let port = chrome.runtime.connect({ name: "popup" });

document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("textArea");
  const clear = document.getElementById("clear");
  const STORAGE_SELECTOR = ".storage[id]";
  const observer = new MutationObserver(() => {
    saveOnChange(title);
  });

  const config = { childList: true, subtree: true };

  observer.observe(title, config);

  let processedHTML = "";
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendCodeToPopup") {
      processedHTML = message.code.html;
      pasteHTML(processedHTML);
    }
  });

  // autosave logic
  function saveOnChange(el) {
    if (el && el.closest(STORAGE_SELECTOR)) {
      doSave();
    }
  }

  function collectData() {
    const data = {};
    for (const el of document.querySelectorAll(STORAGE_SELECTOR))
      if (el.id === "textArea") {
        data[el.id] = el.innerHTML;
      } else {
        data[el.id] = el.type === "checkbox" ? el.checked : el.value;
      }
    return data;
  }

  function doSave() {
    chrome.storage.sync.set(collectData());
  }

  function loadFromStorage() {
    chrome.storage.sync.get((data) => {
      if (data.autoSave) data = data.autoSave;
      for (const [id, value] of Object.entries(data)) {
        const el = document.getElementById(id);
        if (el) {
          if (id === "textArea") {
            el.innerHTML = value;
          } else {
            el[el.type === "checkbox" ? "checked" : "value"] = value;
          }
        }
      }
    });
  }

  loadFromStorage();

  function pasteHTML(processedHTML) {
    if (title.innerHTML == "") {
      title.innerHTML = processedHTML;
    } else {
      title.innerHTML += processedHTML;
    }
    // Обновить HTML-контент страницы
    saveOnChange(title);
  }

  clear.addEventListener("click", () => {
    title.innerHTML = "";
    saveOnChange(title);
  });
});
