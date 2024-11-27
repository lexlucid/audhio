// import { useState } from 'react'
import { useEffect, useState } from 'react';
import './App.css'

declare const chrome: any;

function App() {
  const [extractedText, setExtractedText] = useState<string>("")

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
  

  return (
    <div>
      <h1>Audhio</h1>
      <button onClick={triggerTextExtraction}>Extract Text</button>
      <h2>Extracted Text</h2>
      <p>{extractedText || "No text extracted yet"}</p>
    </div>
  )
}

export default App
