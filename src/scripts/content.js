console.log("Content script loaded at:", new Date().toISOString());
const findText = () => {
  const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return node.nodeValue && node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
      }
    )
  
    const texts = []
    let currentNode = walker.nextNode()
    while (currentNode) {
      texts.push(currentNode.nodeValue)
      currentNode = walker.nextNode()
    }
    console.log("Extracted text:", texts.join(" "));
    return texts.join(' ')
}

chrome.runtime.sendMessage({ action: "EXTRACT_TEXT", payload: findText() })
console.log("Text extraction complete and sent.");

