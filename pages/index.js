import { useState, useEffect } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    loadDefaultVoice();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setInput("");
      speak(data.result);  
    } catch (error) {
      
      console.error(error);
      alert(error.message);
    }
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    speechSynthesis.speak(utterance);
  }

  function loadDefaultVoice() {
    // Get the 109th voice and use it as the default voice
    const voices = window.speechSynthesis.getVoices();
    const defaultVoice = voices[109]; // 109th voice
    setSelectedVoice(defaultVoice);
  }

  function populateVoiceList() {
    if (typeof speechSynthesis === "undefined") {
      return;
    }

    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById("voiceSelect");
    voiceSelect.innerHTML = "";

    for (let i = 0; i < voices.length; i++) {
      const option = document.createElement("option");
      option.textContent = `${voices[i].name} (${voices[i].lang})`;

      if (voices[i].default) {
        option.textContent += " — DEFAULT";
      }

      option.setAttribute("data-lang", voices[i].lang);
      option.setAttribute("data-name", voices[i].name);
      option.setAttribute("value", i);
      voiceSelect.appendChild(option);
    }

    setSelectedVoice(voices[109]); // Set the default voice
  }

  useEffect(() => {
    populateVoiceList();
    if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, []);

  function handleVoiceSelect(event) {
    const voiceIndex = event.target.value;
    const voices = window.speechSynthesis.getVoices();
    const selected = voices[voiceIndex];
    setSelectedVoice(selected);
  }

  return (
    <div className={styles.main}>
       <p>Billy:</p><div className={styles.result}>{result}</div>
      <form onSubmit={onSubmit}>
        <label>
        
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <input className={styles.button} type="submit" value="Send" />
      </form>
      
      <label>
        
        <select className={styles.button} id="voiceSelect" onChange={handleVoiceSelect}>
          {/* Voice options will be populated dynamically */}
        </select>
      </label>
    </div>
  );
}
