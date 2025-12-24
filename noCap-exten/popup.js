document.getElementById("actionBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: sayHello
    });
  });
});

function sayHello() {
  alert("Hello from your extension!");
}
