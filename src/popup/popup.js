document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("textArea");
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendCodeToPopup") {
      const text = message.code.text;
      pasteText(text);
    }
  });

  function pasteText(text) {
    title.textContent = text;
  }
});
