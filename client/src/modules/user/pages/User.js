import React, { useState, useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import AuthContext from "../../../store/auth-context";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import AuthenticationForm from "../components/AuthenticationForm";
import { Container } from "react-bootstrap";
import ErrorModal from "../../../components/ErrorModal";
import classes from "./User.module.css";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const User = (props) => {
  const location = useLocation();
  const history = useHistory();
  const authContext = useContext(AuthContext);
  const API_KEY = firebaseConfig.apiKey;
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    setErrors({});
  }, [location.state.register]);
  const handleClose = () => setShow(false);
  const setField = (field, value) => {
    setForm((prevState) => {
      return { ...prevState, [field]: value };
    });

    if (!!errors[field]) {
      setErrors((prevState) => {
        return { ...prevState, [field]: null };
      });
    }
  };
  const findFormErrors = () => {
    const { email, password } = form;

    const newErrors = {};

    // email errors
    if (!email || email === "") newErrors.email = "Email cannot be empty!";
    else if (
      // !email.split("@")[1] ||
      // !email.split("@")[1].startsWith("student.tarc.edu.my") ||
      // !email.split("@")[1].startsWith("tarc.edu.my")
      !email.endsWith("@student.tarc.edu.my") &&
      !email.endsWith("@tarc.edu.my")
    ) {
      newErrors.email = "Please enter a valid TARUC email!";
    }

    //password errors
    if (!password || password === "")
      newErrors.password = "Password cannot be empty!";
    else if (password.length < 6)
      newErrors.password = "Password must be greater than 6 characters!";

    return newErrors;
  };

  const { email, password } = form;

  function handleLogin(event) {
    event.preventDefault();

    const newErrors = findFormErrors();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({ email, password, returnSecureToken: true }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            return res.json().then(() => {
              let errMsg = "Authentication Failed";
              throw new Error(errMsg);
            });
          }
        })
        .then((data) => {
          let user;
          const fetchUser = async () => {
            const emailDomain = data.email.split("@")[1];
            let userCollection;
            if (emailDomain.startsWith("student")) {
              userCollection = "students";
            } else {
              userCollection = "staff";
            }

            const usersRef = collection(db, userCollection);
            const q = query(usersRef, where("email", "==", data.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              user = doc.data();
              switch (userCollection) {
                case "students":
                  user.isStudent = true;
                  break;
                default:
                  user.isStudent = false;
              }
              const expirationTime = new Date(
                new Date().getTime() + +data.expiresIn * 1000
              );

              authContext.login(
                data.idToken,
                user,
                expirationTime.toISOString()
              );
              history.replace("/videoConferencing");
            });
          };

          fetchUser();
        })
        .catch((e) => {
          console.log(e);
          setShow(true);
        });
    }
  }

  function handleRegister(event) {
    event.preventDefault();

    const auth = getAuth();

    const newErrors = findFormErrors();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          // const docRef = await addDoc(collection(db, "users"), {
          //   name: "Tokyo",
          //   email,
          // });
          history.push({ pathname: "/user", state: { register: false } });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  let type;
  if (location.state) {
    type = location.state.register == false ? "Login" : "Register";
  } else {
    type = "Login";
  }

  return (
    <Container className={`py-5 ${classes.background}`}>
      <ErrorModal
        show={show}
        message="Account doesn't exist!"
        onClose={handleClose}
      />

      <AuthenticationForm
        onEmailChange={(e) => setField("email", e.target.value)}
        onPasswordChange={(e) => setField("password", e.target.value)}
        onSubmit={type == "Login" ? handleLogin : handleRegister}
        show={show}
        errors={errors}
      >
        {type}
      </AuthenticationForm>
    </Container>
  );
};

export default User;
