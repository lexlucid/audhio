import { useState, useEffect, useRef } from 'react'
import './App.css'


// Constants
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

function App() {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [selectedVoice, setSelectedVoice] = useState('')
  const [speed, setSpeed] = useState(1.0)
  const [voices, setVoices] = useState<any[]>([])
  const [isReading, setIsReading] = useState(false)
  const readingQueueRef = useRef<string[]>([])

  // Add Chrome storage sync functionality
  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(['selectedVoice', 'speed'], (result) => {
      if (result.selectedVoice) {
        setSelectedVoice(result.selectedVoice)
      }
      if (result.speed) {
        setSpeed(Number(result.speed))
      }
    })
  }, [])

  // Update Chrome storage when settings change
  useEffect(() => {
    chrome.storage.sync.set({ selectedVoice, speed })
  }, [selectedVoice, speed])

  async function readText(text: string) {
    if (!text || text.trim().length === 0) return

    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            speed: speed
          }
        })
      })

      if (!response.ok) throw new Error(`API request failed: ${response.status}`)

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        setCurrentAudio(null)
        if (readingQueueRef.current.length > 0 && isReading) {
          readText(readingQueueRef.current.shift()!)
        }
      }

      setCurrentAudio(audio)
      await audio.play()
    } catch (error) {
      console.error('Error in readText:', error)
      alert(`Error playing text: ${error}`)
    }
  }

  useEffect(() => {
    // Load voices on component mount
    async function loadVoices() {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': API_KEY
          }
        })
        const data = await response.json()
        setVoices(data.voices)
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0].voice_id)
        }
      } catch (error) {
        console.error('Error loading voices:', error)
      }
    }

    loadVoices()
  }, [])

  const detectText = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: !0 });
      if (!tab.id) return;
      
      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      await chrome.tabs.sendMessage(tab.id, { action: "findTextNodes" });
    } catch (error) {
      console.error('Error detecting text:', error);
      alert('Error: Could not detect text on page. Please refresh and try again.');
    }
  };

  const readAllText = async () => {
    try {
      setIsReading(true);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: !0 });
      if (!tab.id) return;

      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      const response = await chrome.tabs.sendMessage(tab.id, { action: "readAll" });
      console.log('Received texts:', response.texts);
      readingQueueRef.current = response.texts;
      
      if (readingQueueRef.current.length > 0) {
        const nextText = readingQueueRef.current.shift();
        console.log('First text to read:', nextText);
        if (nextText) readText(nextText);
      }
    } catch (error) {
      console.error('Error in readAllText:', error);
      alert('Error: Could not read text. Please refresh and try again.');
      setIsReading(false);
    }
  };

  return (
    <div className="tts-container">

      <div className="tts-controls">
        <h2>Text to Speech Controls</h2>
        <select 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map(voice => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name}
            </option>
          ))}
        </select>

        <div>
          <label htmlFor="speed">Speed: {speed}x</label>
          <input
            type="range"
            id="speed"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <button onClick={detectText}>
          Detect Text on Page
        </button>

        <button onClick={readAllText}>
          Read All Text
        </button>

        <button onClick={() => {
          if (currentAudio) {
            currentAudio.pause()
            setCurrentAudio(null)
            setIsReading(false)
            readingQueueRef.current = []
          }
        }}>
          Stop
        </button>
      </div>
    </div>
  )
}


export default App
