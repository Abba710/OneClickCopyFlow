// hotkey listener for command registered in manifest
chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-all") {
    // the function is called to get the ID of the current tab
    getCurrentTabId().then((tabId) => {
      // after took id current tab, send message in to content script
      chrome.tabs.sendMessage(tabId, { action: "copy-all" }, (allCode) => {
        console.log(allCode);
      });
    });
  }
});

// comment button listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendCodeToServer") {
    const codeData = {
      text: "",
    };
    codeData.text = message.text;
    // Вызываем функцию для отправки на сервер
    sendCodeToServer(codeData, sendResponse);
    return true; // Указываем, что ответ будет асинхронным
  }
});

async function getCurrentTabId() {
  // async function gets the ID of the last opened tab
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}

async function sendCodeToServer(code, sendResponse) {
  try {
    // Отправляем запрос на сервер
    const response = await fetch("http://localhost:3000/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }), // Передаём код
    });

    if (!response.ok) {
      throw new Error(
        `Ошибка сервера: ${response.status} ${response.statusText}`
      );
    }

    // Парсим ответ в JSON
    const data = await response.json();

    chrome.runtime.sendMessage({ action: "sendCodeToPopup", code: data });

    console.log("Ответ от сервера:", data);
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error.message);
  }
}
