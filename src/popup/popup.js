let port = chrome.runtime.connect({ name: "popup" });

document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("textArea");
  const clear = document.getElementById("clear");
  const copy = document.getElementById("copy");
  const STORAGE_SELECTOR = ".storage[id]";
  const observer = new MutationObserver(() => {
    saveOnChange(title);
  });

  const config = { childList: true, subtree: true };

  observer.observe(title, config); // Monitors all changes and saves them

  let processedHTML = "";
  let data = {};

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendCodeToPopup") {
      processedHTML = message.code.html;
      pasteHTML(processedHTML);
    }
  });

  // autosave logic
  function saveOnChange(el) {
    // Autosave function for changes in HTML code
    if (el && el.closest(STORAGE_SELECTOR)) {
      doSave();
    }
  }

  function collectData() {
    for (const el of document.querySelectorAll(STORAGE_SELECTOR))
      if (el.id === "textArea") {
        data[el.id] = el.innerHTML;
      } else {
        data[el.id] = el.type === "checkbox" ? el.checked : el.value;
      }
    return data;
  }

  function doSave() {
    chrome.storage.local.set(collectData());
  }

  function loadFromStorage() {
    chrome.storage.local.get((data) => {
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

  function pasteHTML(processedHTML) {
    title.innerHTML += processedHTML;
  }

  clear.addEventListener("click", () => {
    title.innerHTML = "";
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.log("Error when clearing sync storage:");
      } else {
        console.log("Sync storage succesfully cleared");
      }
    });
  });

  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(title.innerText).then(() => {
      copy.innerText = "Copied";
      setTimeout(() => {
        copy.innerText = "Copy";
      }, 3000);
    });
  });

  loadFromStorage();
});
