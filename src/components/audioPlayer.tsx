export function audioPlayer() {
    if (!document.getElementById("floating-audio-player")) {
        // Create the floating audio player
        const player = document.createElement("div");
        player.id = "floating-audio-player";
        player.innerHTML = `
          <button id="play-pause-button">Play</button>
          <button id="stop-button">Stop</button>
          <span id="audio-title">Audio Title</span>
        `;
        document.body.appendChild(player);
      
        // Add styles to position the player
        const style = document.createElement("style");
        style.textContent = `
          #floating-audio-player {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: Arial, sans-serif;
          }
          #floating-audio-player button {
            background: #555;
            color: #fff;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            cursor: pointer;
          }
          #floating-audio-player button:hover {
            background: #777;
          }
          #floating-audio-player span {
            flex-grow: 1;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
        `;
        document.head.appendChild(style);
      
    return {
        playPauseButton: document.getElementById("play-pause-button"),
        stopButton: document.getElementById("stop-button"),
        audioTitle: document.getElementById("audio-title")
    }
}
}