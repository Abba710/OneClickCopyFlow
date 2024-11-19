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
      text: message.text,
    };
    // Вызываем функцию для отправки на сервер
    sendCodeToServer(codeData)
      .then((response) => {
        sendResponse({ status: "success", data: response });
      })
      .catch((error) => {
        sendResponse({ status: "error", message: error.message });
      });
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

    const data = await response.json();

    // Listens when the popup is active
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === "popup") {
        if (data != undefined && data != null)
          try {
            chrome.runtime.sendMessage({
              action: "sendCodeToPopup",
              code: data,
            });
          } catch (error) {}
      }
    });

    console.log("Ответ от сервера:", data);
  } catch (error) {
    console.error("Ошибка при обработке запроса:", error.message);
  }
}
