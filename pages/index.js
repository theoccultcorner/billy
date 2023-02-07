 
import { useState } from "react";
import styles from "./index.module.css";
import React from 'react';

export default function Home() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState();
 

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("https://lorenzo.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setQuestion("");
      speak(data.result);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <main className={styles.main}>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="question"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <input type="submit" value="Get answer" />
        </form>
        <div className={styles.result}>{result}</div>
   
      </main>
    </div>
  );
}

function speak(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  let voicesArray = speechSynthesis.getVoices();
  console.log(voicesArray);
  utterance.voice = voicesArray[106];
  utterance.pitch = 1.0;
  utterance.volume = 0.9;
  utterance.rate = 1.1;
  speechSynthesis.speak(utterance);
}
