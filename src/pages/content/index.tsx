import { ChromeMessage, MessageAction } from '@src/interfaces/messages';
import { parse } from 'node-html-parser';

async function sendMessage(action: MessageAction, contents?: Object) {
  if (!contents) {
    contents = {};
  }
  await chrome.runtime.sendMessage({
    action: action,
    ...contents
  });
}

async function scrapeProblem() {
  const root = parse(document.documentElement.innerHTML);
  // grab the problem
  const problem = root.querySelector('[data-track-load="description_content"]');
  if (problem) {
    return problem.innerHTML;
  } else {
    // TODO: Can I use chakra UI to create a Toast here?
    return ""
  }
}

async function onDOMContentLoaded() {
  // send a message saying that the DOM is ready
  // create the listener
  chrome.runtime.onMessage.addListener(async (request: ChromeMessage, sender, sendResponse) => {
    if (request.action == "scrapeProblem") {
      // scrape problem
      const problem = await scrapeProblem();
      if (problem.length) {
        await sendMessage("problem", { problem: problem });
      } else {
        await sendMessage("scrapingError", { error: "Could not get leetcode problem" });
      }
    }
  });
  // say that we are ready
  await sendMessage("domStateChange", { state: "DOMLoaded" });
}

// Listen for the DOMContentLoaded event
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
} else {
  onDOMContentLoaded();
}

