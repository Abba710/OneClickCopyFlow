const preEls = document.querySelectorAll("pre");

[...preEls].forEach((preEl) => {
  const root = document.createElement("div");

  root.style.position = "relative";
  const shadowRoot = root.attachShadow({ mode: "open" });

  const cssUrl = chrome.runtime.getURL("content-script.css");

  shadowRoot.innerHTML = `<link rel="stylesheet" href="${cssUrl}"></link>`;

  const button = document.createElement("button");
  button.innerText = "Copy";
  button.type = "button";

  shadowRoot.prepend(button);

  const codeEl = preEl.querySelector("code");
  preEl.prepend(root);

  button.addEventListener("click", () => {
    navigator.clipboard.writeText(codeEl.innerText).then(() => {
      notify();
    });
  });
});

function notify() {
  const scriptEl = document.createElement("script");
  scriptEl.src = chrome.runtime.getURL("execute.js");

  document.body.appendChild(scriptEl);
  scriptEl.onload = () => {
    scriptEl.remove();
  };
}
