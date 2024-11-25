const preEls = document.querySelectorAll("pre"); // Find all <pre> elements in the document

[...preEls].forEach((preEl) => {
  // Convert NodeList to an array and iterate over each <pre> element using forEach
  const root = document.createElement("div"); // Create a new <div> element for each <pre> element

  root.style.position = "relative"; // Set the position style for the <div>
  const shadowRoot = root.attachShadow({ mode: "open" }); // Attach a Shadow DOM to the <div> with open mode

  const cssUrl = chrome.runtime.getURL("content-script.css"); // Get the URL for the external stylesheet

  shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssUrl}"></link>`; // Apply the stylesheet inside the Shadow DOM

  const button = document.createElement("button"); // Create a "Copy" button inside the Shadow DOM
  button.innerText = "Copy"; // Set the text for the "Copy" button
  button.type = "button"; // Set the button type

  const button2 = document.createElement("button"); // Create an "Explain" button inside the Shadow DOM
  button2.innerText = "Explain"; // Set the text for the "Explain" button
  button2.type = "button"; // Set the button type
  button2.className = "button2"; // Add a class to the "Explain" button for styling

  // Add both buttons at the beginning of the Shadow DOM
  shadowRoot.prepend(button);
  shadowRoot.prepend(button2);

  const codeEl = preEl.querySelector("code"); // Find the <code> element inside the current <pre> element
  preEl.prepend(root); // Add the created <div> (root) inside the current <pre> element

  // "Copy" button click event listener
  button.addEventListener("click", () => {
    const execute = "notification/execute.js"; // Define the notification script to show after copying
    navigator.clipboard.writeText(codeEl.innerText).then(() => {
      notify(execute); // Show the notification after text is copied
      console.log(codeEl.textContent); // Log the text content of the code element
    });
  });

  // "Explain" button click event listener
  button2.addEventListener("click", () => {
    button2.style.backgroundColor = "#444444"; // Change the button color to indicate processing
    button2.innerText = "In process"; // Update the button text to show it's in progress
    button2.disabled = true; // Disable the button to prevent further clicks
    const began = "notification/began.js"; // Define the notification script for when the process starts
    let comcode = codeEl.textContent; // Get the code text to be sent for explanation
    chrome.runtime.sendMessage(
      { action: "sendCodeToServer", text: comcode }, // Send the code to the background to be processed
      (response) => {
        if (response.status === "success") {
          // If the server responds successfully, show a completion notification
          const completion = "notification/completion.js";
          notify(completion); // Show the completion notification
          button2.innerText = "Explained!"; // Update the button text to show completion
          button2.disabled = false; // Re-enable the button
          button2.style.backgroundColor = "#00bb00"; // Change button color to indicate success
          setTimeout(); // Potentially handle timing or UI update here
        } else {
          console.error("Error sending data to server: ", response.message); // Log any errors
        }
      }
    );
    notify(began); // Show the "process began" notification
  });

  chrome.runtime.onMessage.addListener((req, info, cb) => {
    // Listener for messages, specifically the "copy-all" action
    const execute = "notification/execute.js"; // Define the notification script to show after copying all code
    if (req.action === "copy-all") {
      const allCode = getAllCode(); // Get all code content

      navigator.clipboard.writeText(allCode).then(() => {
        notify(execute); // Show the notification after copying all code
        cb(allCode); // Send the combined code back as the response
      });
      return true; // Indicate the response is asynchronous
    }
  });

  function getAllCode() {
    // Function to get all code from <pre> elements, combine them into a single string
    return [...preEls]
      .map((preEl) => {
        return preEl.querySelector("code").innerText; // Extract the text content from each <code> inside <pre>
      })
      .join(""); // Combine all code snippets into one string
  }

  function notify(url) {
    // Function to show notifications (by injecting script)
    const scriptEl = document.createElement("script");
    scriptEl.src = chrome.runtime.getURL(url); // Get the URL of the notification script

    document.body.appendChild(scriptEl); // Append the script to the body
    scriptEl.onload = () => {
      scriptEl.remove(); // Remove the script after it is loaded and executed
    };
  }
});
