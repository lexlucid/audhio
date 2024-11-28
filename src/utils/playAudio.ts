export function playAudio(audioBlob: Blob): void {
    const audioUrl = URL.createObjectURL(audioBlob); // Convert Blob to a URL
    const audio = new Audio(audioUrl); // Create an Audio object
    audio.play(); // Play the audio
  }