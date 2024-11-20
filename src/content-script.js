const preEls = document.querySelectorAll("pre"); // find all <pre> elements

[...preEls].forEach((preEl) => {
  // preEls converted to array and then the forEach method is used for iterate through each <pre> element
  const root = document.createElement("div"); // for each <pre> elemet a new <div> element is created

  root.style.position = "relative";
  const shadowRoot = root.attachShadow({ mode: "open" }); // connect to <div> container "Shadow DOM" with "open" mode

  const cssUrl = chrome.runtime.getURL("content-script.css"); // external styles are connected with api

  shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssUrl}"></link>`; // add styles inside Shadow DOM, and didn't touch external elements

  const button = document.createElement("button"); // add "Copy" button inside Shadow DOM
  button.innerText = "Copy";
  button.type = "button";

  const button2 = document.createElement("button"); // add "Comment" button inside Sadow DOM
  button2.innerText = "Explain";
  button2.type = "button";
  button2.className = "button2";

  // add a buttons to the beginning of the shadow DOM element
  shadowRoot.prepend(button);
  shadowRoot.prepend(button2);

  const codeEl = preEl.querySelector("code"); // add container inside <pre>
  preEl.prepend(root); // add a root root inside preEl

  button.addEventListener("click", () => {
    // add an event to copy text
    const execute = "notification/execute.js";
    navigator.clipboard.writeText(codeEl.innerText).then(() => {
      notify(execute);
      console.log(codeEl.textContent);
    });
  });

  button2.addEventListener("click", () => {
    button2.style.backgroundColor = "#444444";
    button2.innerText = "In process";
    button2.disabled = true;
    const began = "notification/began.js";
    let comcode = codeEl.textContent;
    chrome.runtime.sendMessage(
      { action: "sendCodeToServer", text: comcode },
      (response) => {
        if (response.status === "success") {
          const completion = "notification/completion.js";
          notify(completion);
          button2.innerText = "Explained!";
          button2.disabled = false;
          button2.style.backgroundColor = "#00bb00";
          setTimeout();
        } else {
          console.error("Error sending data to server: ", response.message);
        }
      }
    );
    notify(began);
  });

  chrome.runtime.onMessage.addListener((req, info, cb) => {
    // function to copy all code
    const execute = "notification/execute.js";
    if (req.action === "copy-all") {
      const allCode = getAllCode();

      navigator.clipboard.writeText(allCode).then(() => {
        notify(execute);
        cb(allCode);
      });
      return true;
    }
  });

  function getAllCode() {
    // this function iterates through all pre elements, gets the text and combines it into one
    return [...preEls]
      .map((preEl) => {
        return preEl.querySelector("code").innerText;
      })
      .join("");
  }

  function notify(url) {
    // shows notification when copying code
    const scriptEl = document.createElement("script");
    scriptEl.src = chrome.runtime.getURL(url);

    document.body.appendChild(scriptEl);
    scriptEl.onload = () => {
      scriptEl.remove();
    };
  }
});
