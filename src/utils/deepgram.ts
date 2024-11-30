import { createClient } from "@deepgram/sdk";
import { playAudio } from "./playAudio";

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new Error("Missing DEEPGRAM_API_KEY in environment variables");
}

const deepgram = createClient("proxy", {
  global: { fetch: { options: { proxy: { url: "http://localhost:8888" } } } },
});

const chunkTextBySentence = (text : string) : string[] => {
  // Match sentence boundaries (., !, ? followed by space)
  const sentenceRegex = /(?<=[.!?])\s+/g;
  return text.split(sentenceRegex).map((sentence) => sentence.trim());
}

export const generateAudio = async (text: string): Promise<Blob> => {
  try {
    // Make a request to generate speech
    const response = await deepgram.speak.request(
      { text },
      {
        model: "aura-asteria-en", // Use your preferred model
        encoding: "linear16",
        container: "wav",
      }
    );

    // Get the audio stream
    const stream = await response.getStream();
    if (!stream) {
      throw new Error("No audio stream received from Deepgram");
    }

    // Convert the stream to a Blob
    const audioBlob = await getAudioBlobFromStream(stream);
    return audioBlob;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};

// Helper function to convert a stream to a Blob
const getAudioBlobFromStream = async (stream: ReadableStream): Promise<Blob> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
  }

  // Combine chunks into a single Blob
  return new Blob(chunks, { type: "audio/wav" });
};

export const processAndPlayAudio = async (text: string): Promise<void> => {
  try {
    // Split the text into chunks by sentence
    const chunks = chunkTextBySentence(text);

    for (const chunk of chunks) {
      console.log("Processing chunk:", chunk);

      // Generate audio for the current chunk
      const audioBlob = await generateAudio(chunk);

      // Play the audio chunk using the playAudio utility
      await new Promise<void>((resolve) => {
        const audio = playAudio(audioBlob);
        audio.onended = () => resolve(); // Wait for the audio to finish playing
      });
    }

    console.log("All chunks processed and played!");
  } catch (error) {
    console.error("Error processing and playing audio:", error);
  }
};