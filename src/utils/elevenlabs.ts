export const generateSpeech = async (text: string): Promise<Blob> => {
  const { ElevenLabsClient } = await import("elevenlabs");
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string;

  const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

  const audioStream = await client.generate({
    voice: "Rachel",
    model_id: "eleven_turbo_v2_5",
    text,
  });

  const chunks: Uint8Array[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }

  return new Blob(chunks, { type: "audio/mpeg" });
};