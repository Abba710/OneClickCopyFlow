document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("textArea");
  let processedHTML = "";
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendCodeToPopup") {
      processedHTML = message.code.html;
      pasteHTML(processedHTML);
    }
  });

  chrome.browserAction.onClicked.addListener((tab) => {
    pasteHTML(processedHTML);
  });

  function pasteHTML(processedHTML) {
    title.innerHTML = processedHTML;
  }
});
// добавить слушатель когда опоапактивен
