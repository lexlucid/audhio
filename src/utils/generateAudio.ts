import { createClient } from "@deepgram/sdk";

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new Error("Missing DEEPGRAM_API_KEY in environment variables");
}

const deepgram = createClient("proxy", {
  global: { fetch: { options: { proxy: { url: "http://localhost:8888" } } } },
});

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


