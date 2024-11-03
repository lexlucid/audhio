console.log('Content script loaded!');

// Helper function to get all text nodes
function getAllTextNodes(): Text[] {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip if parent is script, style, or the text is just whitespace
        if (
          node.parentElement?.tagName === 'SCRIPT' ||
          node.parentElement?.tagName === 'STYLE' ||
          !node.textContent?.trim()
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }
  
  return textNodes;
}

// Helper function to highlight text nodes
function highlightTextNodes() {
  const textNodes = getAllTextNodes();
  textNodes.forEach(text => {
    const range = document.createRange();
    const selection = window.getSelection();
    if (!selection) return;

    const span = document.createElement('span');
    span.className = 'tts-highlight';
    span.textContent = text.textContent;

    const button = document.createElement('button');
    button.className = 'tts-button';
    button.textContent = '▶';
    button.onclick = () => {
      // Send message to play this specific text
      chrome.runtime.sendMessage({
        action: 'playText', 
        text: text.textContent 
      });
    };

    span.appendChild(button);
    // Replace text node with highlighted span
    selection.removeAllRanges();
    selection.addRange(range);
    selection.getRangeAt(0).surroundContents(span);
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message received:', request);
  
  try {
    if (request.action === "findTextNodes") {
      highlightTextNodes();
      sendResponse({ success: true });
      return true;
    }
    
    if (request.action === "readAll") {
      const textNodes = getAllTextNodes();
      const texts = textNodes.map(node => node.textContent || '').filter(text => text.trim());
      console.log('Sending texts:', texts); // Debug log
      sendResponse({ texts });
      return true;
    }
  } catch (error) {
    console.error('Error in content script:', error);
    sendResponse({ error: (error as Error).message });
  }
  
  return true; // Keep message channel open for async response
});
