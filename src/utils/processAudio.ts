const chunkTextBySentence = (text : string) : string[] => {
    // Match sentence boundaries (., !, ? followed by space)
    const sentenceRegex = /(?<=[.!?])\s+/g;
    return text.split(sentenceRegex).map((sentence) => sentence.trim());
  }
  

export const processAndPlayAudio = async (text: string): Promise<void> => {
    try {
      // Split the text into chunks by sentence
      const chunks = chunkTextBySentence(text);
  
      for (const chunk of chunks) {
        console.log("Processing chunk:", chunk);
        if (isPaused) {
        // Generate audio for the current chunk
          const audioBlob = await generateAudio(chunk);
  
        // Play the audio chunk using the playAudio utility
          await new Promise<void>((resolve) => {
            const checkResume = setInterval(() => {
              if (!isPaused) {
                clearInterval(checkResume);
                resolve();
              }
            }, 100)
  
            const audio = playAudio(audioBlob);
            audio.onended = () => resolve(); // Wait for the audio to finish playing
          });
        }
      } 
      console.log("All chunks processed and played!");
    } catch (error) {
      console.error("Error processing and playing audio:", error);
    }
  };