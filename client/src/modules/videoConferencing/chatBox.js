import React, { Component } from "react";
import styled from "styled-components";
import { Button, Form } from "semantic-ui-react";
import Picker from "emoji-picker-react";
import { v4 as uuidv4 } from "uuid";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

export default class ChatBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputMessage: "",
      emojiPicker: false,
      chatCooldown: false,
    };
  }

  // Input new message in chat box
  inputNewMessage = async () => {
    if (this.state.inputMessage && this.state.inputMessage.length > 0) {
      let tempChatMessageList = this.props.chatMessageList;
      let id = uuidv4();

      tempChatMessageList.push({
        id: id,
        message: this.state.inputMessage,
        sender: this.props.loginUser.name,
        time: new Date(),
      });

      let chatHistoryRef = doc(db, "chatHistory", this.props.selectedRoom.id);
      await updateDoc(chatHistoryRef, { messageList: tempChatMessageList });
      this.setState({ inputMessage: "", chatCooldown: true });
      setTimeout(() => this.setState({ chatCooldown: false }), this.props.selectedRoom.chatTimeout * 1000);
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  // Generate chat history
  generateChatHistory = () => {
    let chatHistoryList = [];

    if (this.props.chatMessageList?.length > 0) {
      // eslint-disable-next-line
      this.props.chatMessageList.map((eachMessage) => {
        let time =
          ("0" + eachMessage.time.getHours()).slice(-2) + ":" + ("0" + eachMessage.time.getMinutes()).slice(-2);

        chatHistoryList.push(
          <MessageContainer key={eachMessage.id}>
            <SenderContainer>
              {eachMessage.sender} <div style={{ fontSize: "10px", marginLeft: "20px", color: "gray" }}>{time}</div>
            </SenderContainer>
            <div>{eachMessage.message}</div>
          </MessageContainer>
        );
      });
    }

    return chatHistoryList;
  };

  // Render chat box
  render = () => {
    const onEmojiClick = (event, emojiObject) => {
      let tempMessage = this.state.inputMessage.concat(emojiObject.emoji);
      this.setState({ emojiPicker: false, inputMessage: tempMessage });
    };

    return (
      <ChatBoxContainer>
        <ChatHistoryContainer>{this.generateChatHistory()}</ChatHistoryContainer>
        <InputContainer>
          <Form onSubmit={() => this.inputNewMessage()}>
            <Form.Input
              style={this.props.selectedRoom?.emoji ? { width: "200px" } : { width: "238px" }}
              id="inputMessage"
              placeholder={"Type here..."}
              value={this.state.inputMessage ? this.state.inputMessage : ""}
              onChange={this.handleChange}
              disabled={
                (this.props.selectedRoom &&
                  !this.props.selectedRoom.chat &&
                  this.props.loginUser?.email !== this.props.selectedRoom.ownerId) ||
                this.state.chatCooldown
                  ? true
                  : false
              }
            />
          </Form>

          {this.props.selectedRoom?.emoji && this.props.selectedRoom?.chat && (
            <EmojiContainer>
              <Button
                onClick={() => this.setState({ emojiPicker: !this.state.emojiPicker })}
                icon="smile outline"
                size="medium"
              />
              {this.state.emojiPicker && (
                <Picker onEmojiClick={onEmojiClick} pickerStyle={{ position: "Absolute", bottom: "40px" }} />
              )}
            </EmojiContainer>
          )}
        </InputContainer>
      </ChatBoxContainer>
    );
  };
}

const ChatBoxContainer = styled.div`
  width: 240px;
  height: calc((100vh - 70px) / 2);
`;

const ChatHistoryContainer = styled.div`
  width: 100%;
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid black;
  border-bottom: none;
  overflow: auto;
`;

const MessageContainer = styled.div`
  width: 100%;
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
`;

const SenderContainer = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  flex-direction: row;
`;

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  border: 1px solid black;
`;

const EmojiContainer = styled.div`
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
