// This script is no longer used as we're using inline functions in chrome.scripting.executeScript
// Keeping this file for reference or future use

// This script runs in the context of web pages
function getSelectedText() {
    return window.getSelection()?.toString() || '';
  }
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSelectedText') {
      sendResponse({ selectedText: getSelectedText() });
    }
    return true; // Keep the message channel open for async response
  });
  
  console.log('Text Selector content script loaded');