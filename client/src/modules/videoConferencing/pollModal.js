import React, { Component } from "react";
import styled from "styled-components";
import { Button, Table, Modal, Form, Message, Radio } from "semantic-ui-react";
import { v4 as uuidv4 } from "uuid";

// Download to PDF
import jsPDF from "jspdf";
import "jspdf-autotable";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, updateDoc, deleteDoc, getDocs, collection, onSnapshot } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

let unSubPollRef;
let unSubAllPollRef;

export default class pollModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: this.props.action,
      belowPart: false,
      confirmDeleteModal: false,

      // Errors
      questionError: "",
      eachOptionError: [],
      optionError: "",
    };
  }

  async componentWillUnmount() {
    if (unSubAllPollRef) await unSubAllPollRef();
    if (unSubPollRef) await unSubPollRef();
  }

  componentDidUpdate() {
    if (!this.state.action && this.state.action !== this.props.action) this.setState({ action: this.props.action });
  }

  componentDidMount() {
    let pollRef = collection(db, "poll");
    unSubAllPollRef = onSnapshot(pollRef, () => {
      this.getPollFromFirebase();
    });
  }

  // Get all poll
  getPollFromFirebase = async () => {
    let tempPollList = [];

    let pollRef = collection(db, "poll");
    let pollQuerySnapshot = await getDocs(pollRef);
    pollQuerySnapshot.forEach((doc) => {
      if (this.props.selectedRoom.pollIdList.includes(doc.data().id)) tempPollList.push(doc.data());
    });

    this.setState({ pollList: tempPollList });
  };

  clearError = () => {
    let tempEachOptionError = [];

    // eslint-disable-next-line
    this.state.selectedPoll.options.map(() => {
      tempEachOptionError.push("");
    });

    this.setState({
      questionError: "",
      eachOptionError: tempEachOptionError,
      optionError: "",
    });
  };

  // Confirm modal open & close
  handleConfirmDeleteModal = (status, pollId) => {
    this.setState({ confirmDeleteModal: status, selectedPollId: pollId });
  };

  // Action button (view result, answer poll, create poll)
  handleAction = async (action, belowPart, selectedPoll) => {
    if (action !== "create" && belowPart) {
      let selectedPollRef = doc(db, "poll", selectedPoll.id);
      unSubPollRef = onSnapshot(selectedPollRef, (snapShot) => {
        this.setState({ selectedPoll: snapShot.data() });
      });
    } else if (unSubPollRef) await unSubPollRef();

    if (action === "answer" && belowPart) this.setState({ optionChecked: 0 });

    if (action === "create" && belowPart) {
      let tempPoll;
      tempPoll = {
        id: uuidv4(),
        question: "",
        respondentIdList: [],
        options: [],
      };

      // new error
      let tempEachOptionError = JSON.parse(JSON.stringify(this.state.eachOptionError));

      for (let i = 0; i < 2; i++) {
        let option = {
          id: uuidv4(),
          option: "",
          amountSelected: 0,
        };

        tempEachOptionError.push("");
        tempPoll.options.push(option);
      }

      this.setState({
        action: action,
        belowPart: belowPart,
        selectedPoll: tempPoll,
        eachOptionError: tempEachOptionError,
      });
    } else this.setState({ action: action, belowPart: belowPart, selectedPoll: selectedPoll });
  };

  handleChange = (e) => {
    if (e.target.id === "question") {
      let tempPoll = this.state.selectedPoll;
      tempPoll.question = e.target.value;

      this.setState({ selectedPoll: tempPoll });
    } else if (e.target.id.substring(0, 6) === "option") {
      let tempPoll = this.state.selectedPoll;
      tempPoll.options[e.target.id.substring(6, 7)].option = e.target.value;

      this.setState({ selectedPoll: tempPoll });
    } else if (e.target.id.substring(0, 6) === "answer") {
      this.setState({ optionChecked: parseInt([e.target.id.substring(6, 7)]) });
    } else this.setState({ [e.target.id]: e.target.value });
  };

  // Add new option when creating poll
  handleNewOption = () => {
    let tempPoll = this.state.selectedPoll;
    let option = {
      id: uuidv4(),
      option: "",
      amountSelected: 0,
    };
    tempPoll.options.push(option);

    // new error
    let tempEachOptionError = JSON.parse(JSON.stringify(this.state.eachOptionError));
    tempEachOptionError.push("");

    this.setState({ selectedPoll: tempPoll, eachOptionError: tempEachOptionError });
  };

  // Download result to PDF
  handleDownloadResult = () => {
    let unit = "pt";
    let size = "A4"; // Use A1, A2, A3 or A4
    let orientation = "portrait"; // portrait or landscape

    let marginLeft = 40;
    let doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);

    let today = new Date();
    // Format date to DD/MM/YYYY
    let formattedDate = today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear();

    let title = `Poll result`;
    let generateDate = `Date - ${formattedDate}`;
    let generateBy = `Generated by - ${this.props.loginUser.name}`;
    let generateRoom = `Generated in room - ${this.props.selectedRoom.roomName}`;
    let totalRespondent = `Total respondent - ${this.state.selectedPoll.respondentIdList.length} `;
    let question = `Question - ${this.state.selectedPoll.question}`;
    let headers = [["No.", "Option", "Total respondent"]];

    let data = this.state.selectedPoll.options.map((eachOption, i) => [
      i + 1,
      eachOption.option,
      eachOption.amountSelected,
    ]);

    let content = {
      startY: 160,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.setFontSize(12);
    doc.text(generateDate, marginLeft, 60);
    doc.text(generateBy, marginLeft, 80);
    doc.text(generateRoom, marginLeft, 100);
    doc.text(totalRespondent, marginLeft, 120);
    doc.text(question, marginLeft, 140);
    doc.autoTable(content);
    doc.save(`Poll Result.pdf`);
  };

  // Remove option when creating poll
  removeOption = (optionId) => {
    let tempSelectedPoll = this.state.selectedPoll;
    let tempOptions = [];
    let tempEachOptionError = [];

    // eslint-disable-next-line
    tempSelectedPoll.options.map((eachOption, i) => {
      if (eachOption.id !== optionId) {
        tempOptions.push(eachOption);
      } else {
        for (let errCount = 0; errCount < this.state.eachOptionError.length; errCount++) {
          if (errCount !== i) tempEachOptionError.push(this.state.eachOptionError[i]);
        }
      }
    });
    tempSelectedPoll.options = tempOptions;

    this.setState({ selectedPoll: tempSelectedPoll, eachOptionError: tempEachOptionError });
  };

  // Create new poll
  createPoll = async () => {
    if (this.validatePoll()) return;

    let pollRef = doc(db, "poll", this.state.selectedPoll.id);
    let tempPollIdList = JSON.parse(JSON.stringify(this.props.selectedRoom.pollIdList));
    tempPollIdList.push(this.state.selectedPoll.id);

    let roomRef = doc(db, "videoConferencingRooms", this.props.selectedRoom.id);
    await updateDoc(roomRef, {
      pollIdList: tempPollIdList,
    });

    await setDoc(pollRef, {
      id: this.state.selectedPoll.id,
      question: this.state.selectedPoll.question,
      respondentIdList: this.state.selectedPoll.respondentIdList,
      options: this.state.selectedPoll.options,
    });

    this.handleAction(this.state.action, false);
  };

  // Validation for creating new poll
  validatePoll = () => {
    this.clearError();

    let error = false;
    let questionError = "";
    let eachOptionError = JSON.parse(JSON.stringify(this.state.eachOptionError));
    let optionError = "";

    let question = this.state.selectedPoll.question;
    let options = this.state.selectedPoll.options;

    // Validate empty question
    if (!question.length > 0) {
      questionError = "Poll question cannot be empty.";
      error = true;
    }

    // Validate empty options
    // eslint-disable-next-line
    options.map((eachOption, i) => {
      if (!eachOption.option.length > 0) {
        eachOptionError[i] = "Poll options cannot be empty.";
        optionError = "Poll options cannot be empty";
        error = true;
      } else {
        eachOptionError[i] = "";
      }
    });

    // Validate option >= 2
    if (options.length < 2) optionError = "Poll options must be more than 1";

    if (error) {
      this.setState({
        questionError: questionError,
        eachOptionError: eachOptionError,
        optionError: optionError,
      });
    }

    return error;
  };

  // Delete poll
  deletePoll = async () => {
    // Change status to inactive (need to ammend the code for the generate poll in table)
    // let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
    // await updateDoc(roomRef, { status: "inactive" });

    let pollId = this.state.selectedPollId;

    // Delete poll data
    let pollRef = doc(db, "poll", pollId);
    await deleteDoc(pollRef);

    // Delete poll id in room poll id list
    let tempPollIdList = [];
    // eslint-disable-next-line
    this.props.selectedRoom.pollIdList.map((eachPoll) => {
      if (eachPoll !== pollId) tempPollIdList.push(eachPoll);
    });

    let roomRef = doc(db, "videoConferencingRooms", this.props.selectedRoom.id);
    await updateDoc(roomRef, {
      pollIdList: tempPollIdList,
    });

    this.handleConfirmDeleteModal(false);
    this.handleAction(this.state.action, false);
  };

  // Submit selected answer (participant)
  submitAnswer = async () => {
    let tempOptions = [];
    let tempPoll = JSON.parse(JSON.stringify(this.state.selectedPoll));

    // eslint-disable-next-line
    this.state.selectedPoll.options.map((eachOption, i) => {
      let tempOption = JSON.parse(JSON.stringify(eachOption));
      if (i === this.state.optionChecked) tempOption.amountSelected++;
      tempOptions.push(tempOption);
    });

    tempPoll.options = tempOptions;
    tempPoll.respondentIdList.push(this.props.loginUser.email);

    let pollRef = doc(db, "poll", this.state.selectedPoll.id);
    await updateDoc(pollRef, { respondentIdList: tempPoll.respondentIdList, options: tempPoll.options });

    this.handleAction(this.state.action, false);
  };

  // Generate data in above poll list table
  generatePollList = () => {
    let collectedPoll = [];

    // eslint-disable-next-line
    this.state.pollList.map((eachPoll, i) => {
      collectedPoll.push(
        <StyledRow key={eachPoll.id}>
          <StyledCell>{i + 1}</StyledCell>
          <StyledCell>{eachPoll.question}</StyledCell>
          {this.state.action !== "answer" && <StyledCell>{eachPoll.respondentIdList.length}</StyledCell>}
          {this.state.action !== "answer" ? (
            <StyledCell style={{ display: "flex", flexDirection: "row" }}>
              <Button positive onClick={() => this.handleAction("result", true, eachPoll)}>
                View result
              </Button>
              <Button negative onClick={() => this.handleConfirmDeleteModal(true, eachPoll.id)}>
                Delete
              </Button>
            </StyledCell>
          ) : !eachPoll.respondentIdList.includes(this.props.loginUser.email) ? (
            <StyledCell style={{ display: "flex", justifyContent: "center" }}>
              <Button positive onClick={() => this.handleAction("answer", true, eachPoll)}>
                Answer poll
              </Button>
            </StyledCell>
          ) : (
            <StyledCell style={{ display: "flex", justifyContent: "center" }}>
              <Button>Answered</Button>
            </StyledCell>
          )}
        </StyledRow>
      );
    });

    return collectedPoll;
  };

  // Generate poll result when view result
  generatePollResult = () => {
    let collectedResult = [];

    // eslint-disable-next-line
    this.state.selectedPoll.options.map((eachResult, i) => {
      collectedResult.push(
        <StyledRow key={eachResult.id}>
          <StyledCell>{i + 1}</StyledCell>
          <StyledCell>{eachResult.option}</StyledCell>
          <StyledCell>{eachResult.amountSelected}</StyledCell>
        </StyledRow>
      );
    });

    return collectedResult;
  };

  // Generate options when creating poll
  generateOptions = () => {
    let collectedOptions = [];
    let tempOptions = [];

    if (this.state.selectedPoll) {
      // eslint-disable-next-line
      this.state.selectedPoll.options.map((eachOption, i) => {
        // each option
        tempOptions.push(
          <StyledFormfield key={`option ${eachOption.id}`} error={this.state.eachOptionError[i].length > 0}>
            <Button icon="remove circle" onClick={() => this.removeOption(eachOption.id)} />
            <Form.Input
              style={{ width: "355px" }}
              id={`option${i}`}
              placeholder={`Option ${i + 1}`}
              value={eachOption.option ? eachOption.option : ""}
              onChange={this.handleChange}
            />
          </StyledFormfield>
        );

        // combine 2 options into 1 row
        if (i % 2 !== 0 || this.state.selectedPoll.options.length === i + 1) {
          if (tempOptions.length < 2) tempOptions.push(<Form.Field key={`emptyOption ${eachOption.id}`}></Form.Field>);

          collectedOptions.push(
            <Form.Group widths="equal" key={`optionGroup ${eachOption.id}`}>
              {tempOptions}
            </Form.Group>
          );
          tempOptions = [];
        }
      });

      collectedOptions.push(
        this.state.optionError && this.state.optionError.length > 0 && (
          <Form.Group widths="equal" key={`option error`}>
            <Form.Field>
              <Message negative size={"tiny"}>
                {this.state.optionError}
              </Message>
            </Form.Field>
            <Form.Field></Form.Field>
          </Form.Group>
        )
      );
    }

    return collectedOptions;
  };

  // Generate option for participants when answering poll
  generateAnswerOptions = () => {
    let collectedOptions = [];
    let tempOptions = [];

    // eslint-disable-next-line
    this.state.selectedPoll.options.map((eachOption, i) => {
      // each option
      tempOptions.push(
        <Form.Field
          id={`answer${i}`}
          label={eachOption.option}
          control={Radio}
          value={eachOption.option}
          checked={this.state.optionChecked === i}
          onChange={this.handleChange}
          key={eachOption.id}
        />
      );
    });

    collectedOptions = <Form style={{ marginTop: "10px" }}>{tempOptions}</Form>;
    return collectedOptions;
  };

  renderTopSide = () => {
    return (
      <StyledHeader>
        {this.state.pollList?.length > 0 && <div>Poll list</div>}
        <div style={{ flex: 1 }} />
        {this.state.action === "edit" ||
          (!this.state.belowPart && this.state.action === "create" && (
            <Button positive onClick={() => this.handleAction("create", true)}>
              Create new poll
            </Button>
          ))}
      </StyledHeader>
    );
  };

  renderPollTable = () => {
    if (this.state.pollList?.length > 0) {
      return (
        <div style={{ marginTop: "10px" }}>
          <Table celled>
            <Table.Header>
              <StyledRow>
                <Table.HeaderCell>No.</Table.HeaderCell>
                <Table.HeaderCell>Poll question</Table.HeaderCell>
                {this.state.action !== "answer" && <Table.HeaderCell>Responses</Table.HeaderCell>}
                <Table.HeaderCell style={{ width: "230px", justifyContent: "center" }}>Actions</Table.HeaderCell>
              </StyledRow>
            </Table.Header>
            <Table.Body>{this.generatePollList()}</Table.Body>
          </Table>
        </div>
      );
    } else return <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>No poll found.</div>;
  };

  renderResultTable = () => {
    return (
      <div style={{ marginTop: "10px" }}>
        <Table celled>
          <Table.Header>
            <StyledRow>
              <Table.HeaderCell>No.</Table.HeaderCell>
              <Table.HeaderCell>Poll options</Table.HeaderCell>
              <Table.HeaderCell>Responses</Table.HeaderCell>
            </StyledRow>
          </Table.Header>
          <Table.Body>{this.generatePollResult()}</Table.Body>
        </Table>
      </div>
    );
  };

  renderCreatePoll = () => {
    return (
      <div>
        Create poll
        <Form style={{ marginTop: "10px" }}>
          <Form.Group widths="equal">
            <Form.Field error={this.state.questionError.length > 0}>
              <Form.Input
                id="question"
                placeholder="Enter your question here"
                value={this.state.selectedPoll ? this.state.selectedPoll.question : ""}
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              {this.state.questionError.length > 0 && (
                <Message negative size={"mini"} content={this.state.questionError} />
              )}
            </Form.Field>
          </Form.Group>
        </Form>
        <Form>{this.generateOptions()}</Form>
        <Button onClick={() => this.handleNewOption()}>Add poll options</Button>
      </div>
    );
  };

  renderPollResult = () => {
    return (
      <div>
        {`Poll result - ${this.state.selectedPoll.question}`}
        {this.renderResultTable()}
      </div>
    );
  };

  renderAnswerPoll = () => {
    return (
      <div>
        Answer poll
        {this.generateAnswerOptions()}
      </div>
    );
  };

  renderConfirmDeleteModal = () => {
    return (
      <Modal
        closeIcon
        open={this.state.confirmDeleteModal}
        onClose={() => this.handleConfirmDeleteModal(false)}
        size={"small"}
      >
        <Modal.Header>Are you sure you want to delete this poll?</Modal.Header>

        <Modal.Actions>
          <Button negative onClick={() => this.handleConfirmDeleteModal(false)}>
            No
          </Button>
          <Button positive onClick={() => this.deletePoll()}>
            Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  };

  render = () => {
    return (
      <div>
        {this.renderConfirmDeleteModal()}
        <Modal closeIcon open={this.props.pollModal} onClose={() => this.props.handleModal(false, null, "close")}>
          <Modal.Header>Poll</Modal.Header>

          <Modal.Content scrolling>
            <Modal.Content style={{ paddingBottom: "21px" }}>
              <Modal.Description>
                {this.renderTopSide()}
                {this.renderPollTable()}
              </Modal.Description>
            </Modal.Content>

            {this.state.belowPart && (
              <Modal.Content style={{ borderTop: "1px solid #C4C4C4", padding: "21px 0px" }}>
                <Modal.Description>
                  {this.state.action === "create" && this.renderCreatePoll()}
                  {this.state.action === "result" && this.renderPollResult()}
                  {this.state.action === "answer" && this.renderAnswerPoll()}
                </Modal.Description>
              </Modal.Content>
            )}
          </Modal.Content>

          <Modal.Actions style={{ marginRight: "10px" }}>
            {this.state.action === "result" && this.state.belowPart && (
              <Button positive onClick={() => this.handleDownloadResult()}>
                Download result
              </Button>
            )}
            {this.state.action === "create" && this.state.belowPart && (
              <Button positive onClick={() => this.createPoll()}>
                Create poll
              </Button>
            )}
            {this.state.action === "answer" && this.state.belowPart ? (
              <Button negative onClick={() => this.handleAction(this.state.action, false)}>
                Cancel
              </Button>
            ) : (
              <Button positive onClick={() => this.props.handleModal(false, null, "close")}>
                Exit poll
              </Button>
            )}
            {this.state.action === "answer" && this.state.belowPart && (
              <Button
                positive
                onClick={() => {
                  this.submitAnswer();
                }}
              >
                Submit answer
              </Button>
            )}
          </Modal.Actions>
        </Modal>
      </div>
    );
  };
}

const StyledFormfield = styled(Form.Field)`
  display: flex;
  flex-direction: row;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const StyledRow = styled(Table.Row)`
  height: 45px !important;
`;

const StyledCell = styled(Table.Cell)`
  height: 45px !important;
  padding: 5px !important;
  align-items: center;
`;
