import { useEffect, useState } from 'react';
import { LucidePlay, LucidePause } from 'lucide-react';
import { processAndPlayAudio } from './utils/deepgram';
import './App.css'

declare const chrome: any;
function App() {
  const [extractedText, setExtractedText] = useState<string>("")
  const [isplaying, setIsPlaying] = useState<boolean>(false)

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === "EXTRACT_TEXT") {
        setExtractedText(message.payload)
        console.log("Extracted text: ", message.payload)
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])
  
  const triggerTextExtraction = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['scripts/content.js']
        })
      }
    } catch (error) {
      console.error("Error extracting text: ", error)
    }
    console.log("Is chrome.scripting available?", chrome.scripting);
  }
  
  const handleGenerateSpeech = async () => {
    try {
      await processAndPlayAudio(extractedText);
    } catch (error) {
      console.error("Error generating speech:", error);
      alert("Failed to generate speech. Please try again.");
    }
  }
 
  function handleIsPlaying() {
    if (!extractedText) {
      triggerTextExtraction()
      return
    }
    handleGenerateSpeech()
    setIsPlaying(!isplaying)
  }

  return (
    <div>
      <h1>Audhio</h1>
      <h2>Extracted Text</h2>
      <p>{extractedText || "No text extracted yet"}</p>
      <button onClick={handleIsPlaying}>
        {isplaying ? <LucidePause /> : <LucidePlay />}
      </button>
    </div>
  )
}

export default App
