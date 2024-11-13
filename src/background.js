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

async function getCurrentTabId() {
  // async function gets the ID of the last opened tab
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab.id;
}
