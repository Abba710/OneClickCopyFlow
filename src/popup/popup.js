let port = chrome.runtime.connect({ name: "popup" }); // Create a connection when the popup opens

document.addEventListener("DOMContentLoaded", () => {
  // Enter the id of HTML elements into the constants
  const title = document.getElementById("textArea"); // Get the element with id "textArea"
  const clear = document.getElementById("clear"); // Get the element with id "clear"
  const copy = document.getElementById("copy"); // Get the element with id "copy"

  // Enter the HTML elements with "storage" class into the constants
  const STORAGE_SELECTOR = ".storage[id]"; // Selector for elements with class "storage" and an id attribute

  // Create an observer that monitors changes in the code and saves them through the "saveOnChange" function
  const observer = new MutationObserver(() => {
    saveOnChange(title); // Call saveOnChange whenever a mutation is detected in the "title" element
  });

  // Set config for tracking both parent and child elements
  const config = { childList: true, subtree: true };

  observer.observe(title, config); // Monitor changes in the title element

  let processedHTML = ""; // Variable to store processed HTML code
  let data = {}; // Object to store collected data

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Set a listener that fires when the message "sendCodeToPopup" is received
    if (message.action === "sendCodeToPopup") {
      processedHTML = message.code.html; // Store the HTML code from the message
      pasteHTML(processedHTML); // Call a function to insert HTML code into the page
    }
  });

  // Create a save function
  function saveOnChange(el) {
    // Autosave function for changes in the HTML code
    if (el && el.closest(STORAGE_SELECTOR)) {
      // Check if the element is within the storage selector
      doSave(); // Save the data
    }
  }

  function collectData() {
    // Collect data from elements matching STORAGE_SELECTOR and return an object with their id and values
    for (const el of document.querySelectorAll(STORAGE_SELECTOR)) {
      if (el.id === "textArea") {
        data[el.id] = el.innerHTML; // For the "textArea", store innerHTML
      } else {
        data[el.id] = el.type === "checkbox" ? el.checked : el.value; // Store checkbox value or input value for other elements
      }
    }
    return data;
  }

  function doSave() {
    // Save collected data to local storage
    chrome.storage.local.set(collectData());
  }

  function loadFromStorage() {
    // Load data from local storage and restore values of elements on the page by their id
    chrome.storage.local.get((data) => {
      if (data.autoSave) data = data.autoSave; // If autoSave data exists, use it
      for (const [id, value] of Object.entries(data)) {
        const el = document.getElementById(id);
        if (el) {
          if (id === "textArea") {
            el.innerHTML = value; // Restore the value of "textArea" element
          } else {
            el[el.type === "checkbox" ? "checked" : "value"] = value; // Restore the value or checked state for other elements
          }
        }
      }
    });
  }

  function pasteHTML(processedHTML) {
    // Load processedHTML into the page (insert HTML into the "title" element)
    title.innerHTML += processedHTML;
  }

  clear.addEventListener("click", () => {
    // Listener for the "Clear" button: clears the title and removes everything from storage
    title.innerHTML = ""; // Clear the title element
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        console.log("Error when clearing sync storage:"); // Log error if clearing fails
      } else {
        console.log("Sync storage successfully cleared"); // Log success message
      }
    });
  });

  copy.addEventListener("click", () => {
    // Listener for the "Copy" button: copies the title text to the clipboard
    navigator.clipboard.writeText(title.innerText).then(() => {
      copy.innerText = "Copied"; // Change the button text to "Copied"
      setTimeout(() => {
        copy.innerText = "Copy"; // Change the button text back to "Copy" after 3 seconds
      }, 3000);
    });
  });

  loadFromStorage(); // Call function to load data from storage when the page is loaded
});
