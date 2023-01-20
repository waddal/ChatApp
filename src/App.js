import "./App.css";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  collection,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBtwh4x07sKUGYhP6nthW6pNc9BvS8PhkU",
  authDomain: "chatapp-c4dee.firebaseapp.com",
  projectId: "chatapp-c4dee",
  storageBucket: "chatapp-c4dee.appspot.com",
  messagingSenderId: "11364178911",
  appId: "1:11364178911:web:8f6d22ced3814d531f426a",
  measurementId: "G-MKL4BNKRGD",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>{user && <SignOut />}</header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://randomuser.me/api/portraits/thumb/men/33.jpg'} alt="usrPhoto" />
      <p>{text}</p>
    </div>
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  const [messages] = useCollectionData(q, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    const data = {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    };

    try {
      addDoc(collection(firestore, "messages"), data);
    } catch (e) {
      console.log("error: ", e, "\nunable to send: ", {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
      });
    }

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit" disabled={!formValue}>
          🕊
        </button>
      </form>
    </>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return <button onClick={() => signInWithGoogle()}>Sign In</button>;
}

function SignOut() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

export default App;
