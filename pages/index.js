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
    window.speechSynthesis.speak(utterance);
  }

  function loadDefaultVoice() {
    const voices = window.speechSynthesis.getVoices();
    const defaultVoice = voices[0];
    setSelectedVoice(defaultVoice);
  }

  function populateVoiceList() {
    const voices = window.speechSynthesis.getVoices();
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

    setSelectedVoice(voices[0]);
  }

  useEffect(() => {
    populateVoiceList();
    if (typeof window.speechSynthesis !== "undefined" && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, []);

  function handleVoiceSelect(event) {
    const voiceIndex = event.target.value;
    const voices = window.speechSynthesis.getVoices();
    const selected = voices[voiceIndex];
    setSelectedVoice(selected);
  }

  function handleMicClick() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  }

  return (
    <div className={styles.container}>
      <form onSubmit={onSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a writing prompt..."
        />
        <button type="submit">Generate</button>
      </form>

      <div className={styles.output}>
        {result && <p>{result}</p>}
        <select id="voiceSelect" onChange={handleVoiceSelect}>
        </select>
        <button onClick={handleMicClick}>Speak</button>
      </div>
    </div>
  );
}
