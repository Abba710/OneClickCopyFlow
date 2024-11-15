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
  button2.innerText = "Comment";
  button2.type = "button";
  button2.className = "button2";

  shadowRoot.prepend(button);
  shadowRoot.prepend(button2);

  const codeEl = preEl.querySelector("code"); // add container inside <pre>
  preEl.prepend(root);

  button.addEventListener("click", () => {
    // add an event to copy text
    navigator.clipboard.writeText(codeEl.innerText).then(() => {
      notify();
      console.log(codeEl.textContent);
    });
  });

  button2.addEventListener("click", () => {
    let comcode = codeEl.outerHTML;
    chrome.runtime.sendMessage({ action: "sendHTMLToServer", html: comcode });
  });

  chrome.runtime.onMessage.addListener((req, info, cb) => {
    // function to copy all code
    if (req.action === "copy-all") {
      const allCode = getAllCode();

      navigator.clipboard.writeText(allCode).then(() => {
        notify();
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

  function notify() {
    // shows notification when copying code
    const scriptEl = document.createElement("script");
    scriptEl.src = chrome.runtime.getURL("execute.js");

    document.body.appendChild(scriptEl);
    scriptEl.onload = () => {
      scriptEl.remove();
    };
  }
});
