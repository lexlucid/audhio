const ELEVENLABS_API_KEY = import.meta.env.ELEVENLABS_API_KEY
const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export async function generateSpeech(text: string, voiceId: string = "Rachel"): Promise<Blob> {
  try {
    const response = await fetch(`${ELEVENLABS_URL}/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    return await response.blob(); // Return audio data as a blob
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
}