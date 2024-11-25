// Hotkey listener for the command registered in the manifest
chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-all") {
    // The function is called to get the ID of the current tab
    getCurrentTabId().then((tabId) => {
      // Once the tab ID is retrieved, send a message to the content script to trigger the "copy-all" action
      chrome.tabs.sendMessage(tabId, { action: "copy-all" }, (allCode) => {
        console.log(allCode); // Log the result from the content script
      });
    });
  }
});

// Message listener that works if the message action is "sendCodeToServer"
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendCodeToServer") {
    const codeData = {
      text: message.text, // Prepare the code data to send to the server
    };
    // Call the send function to the server to process the code
    sendCodeToServer(codeData)
      .then((response) => {
        sendResponse({ status: "success", data: response }); // Send a successful response back
      })
      .catch((error) => {
        sendResponse({ status: "error", message: error.message }); // Send an error response if something went wrong
      });
    return true; // Indicate that the response will be asynchronous
  }
});

// Async function to get the ID of the currently active tab
async function getCurrentTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true }; // Query options to find the last focused active tab
  let [tab] = await chrome.tabs.query(queryOptions); // Get the tab that matches the query
  return tab.id; // Return the ID of the tab
}

// Function to send the code to the server and process the response
async function sendCodeToServer(code, sendResponse) {
  try {
    // Send a POST request to the server with the code
    const response = await fetch("http://localhost:3000/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set content type to JSON
      },
      body: JSON.stringify({ code }), // Send the code as JSON data
    });

    if (!response.ok) {
      // If the server responds with an error, throw an error
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    // Get the response data from the server
    let data = await response.json();

    // Listen for a connection from the popup
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === "popup") {
        // If the popup is connected, send the explained code to it
        if (data != undefined && data != null && data !== "") {
          try {
            chrome.runtime.sendMessage({
              action: "sendCodeToPopup",
              code: data, // Send the code explanation to the popup
            });
            data = ""; // Clear the data after sending
            console.log("Sent from background");
          } catch (error) {
            console.error("Error sending to popup:", error);
          }
        }
      }
    });

    console.log("Response from the server:", data); // Log the response from the server
  } catch (error) {
    console.error("Error processing request:", error.message); // Log any errors that occur during the process
  }
}
