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
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import AuthenticationForm from "../components/AuthenticationForm";
import { Container } from "react-bootstrap";
import CustomModal from "../../../components/CustomModal";
import classes from "./User.module.css";
import NewUserModal from "../components/NewUserModal";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const User = (props) => {
  const location = useLocation();
  const history = useHistory();
  const authContext = useContext(AuthContext);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  useEffect(() => {
    setErrors({});
  }, [location.state]);

  const handleClose = () => {
    setShowError(false);
    setShowSuccess(false);
    setShowNewUserModal(false);
  };

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

  const handleLogin = (event) => {
    event.preventDefault();

    const newErrors = findFormErrors();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          if (user.emailVerified == false) {
            setError("Your account is not verified!");
            setShowError(true);
            return;
          }

          const fetchUser = async () => {
            const emailDomain = user.email.split("@")[1];
            let userCollection;
            if (emailDomain.startsWith("student")) {
              userCollection = "students";
            } else {
              userCollection = "staff";
            }

            const usersRef = collection(db, userCollection);
            const q = query(usersRef, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              let userProfile = doc.data();

              switch (userCollection) {
                case "students":
                  userProfile.isStudent = true;
                  break;
                default:
                  userProfile.isStudent = false;
              }
              const expirationTime = new Date(
                new Date().getTime() +
                  +userCredential._tokenResponse.expiresIn * 1000
              );

              authContext.login(
                userCredential._tokenResponse.idToken,
                userProfile,
                expirationTime.toISOString()
              );
            });
          };

          fetchUser();
          history.replace("/videoConferencing");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError("Please enter a valid email/password!");
          setShowError(true);
        });
    }
  };

  const handleResetPassword = () => {
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent!
        setSuccess("Check your email to reset your password!");
        setShowSuccess(true);
      })
      .catch((error) => {
        if (error.message == "Firebase: Error (auth/missing-email).") {
          setError("Please provide an email first!");
          setShowError(true);
        } else {
          setError(error.message);
          setShowError(true);
        }
      });
  };

  const handleRegister = (event) => {
    event.preventDefault();

    const auth = getAuth();

    const newErrors = findFormErrors();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setShowNewUserModal(true);
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log(userCredential);
          sendEmailVerification(auth.currentUser)
            .then(() => {
              setSuccess(
                "Account created, please check your email to verify your account!"
              );
              setShowSuccess(true);
              history.push({ pathname: "/user", state: { register: false } });
              console.log("New user created: " + auth.currentUser);
            })
            .catch((error) => {
              setError(error);
              setShowError(true);
            });
        })
        .catch((error) => {
          if (error.code == "auth/email-already-in-use") {
            setError("Account already exists!");
          } else {
            setError(error);
          }
          setShowError(true);
        });
    }
  };

  let type;
  if (location.state) {
    type = location.state.register == false ? "Login" : "Register";
  } else {
    type = "Login";
  }

  return (
    <Container className={`py-5 ${classes.background}`}>
      <NewUserModal onClose={handleClose} show={showNewUserModal} />
      <CustomModal
        show={showError}
        isSuccess={false}
        onClose={handleClose}
        title="Error"
      >
        {error}
      </CustomModal>

      <CustomModal
        show={showSuccess}
        isSuccess={true}
        onClose={handleClose}
        title="Success"
      >
        {success}
      </CustomModal>

      <AuthenticationForm
        onEmailChange={(e) => setField("email", e.target.value)}
        onPasswordChange={(e) => setField("password", e.target.value)}
        onSubmit={type == "Login" ? handleLogin : handleRegister}
        onReset={handleResetPassword}
        errors={errors}
      >
        {type}
      </AuthenticationForm>
    </Container>
  );
};

export default User;
