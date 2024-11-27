
const extractText = () => {
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
    return texts.join(' ')
}

chrome.runtime.sendMessage({ action: "EXTRACT_TEXT", payload: extractText() })
console.log("Text extraction complete and sent.");
