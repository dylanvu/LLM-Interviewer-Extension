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
  return problem;
}

async function onDOMContentLoaded() {
  // send a message saying that the DOM is ready
  // create the listener
  chrome.runtime.onMessage.addListener(async (request: ChromeMessage, sender, sendResponse) => {
    if (request.action == "scrapeProblem") {
      let attempts = 0;
      const maxAttempts = 1000;
      let scraped = false;
      while (attempts < maxAttempts) {
        // scrape problem
        const problem = await scrapeProblem();
        // TODO: Create a toast depending on the scraping result
        if (problem) {
          let problemText = problem.innerText;
          // replace all html tabs, or specifically anything between a < and a >
          problemText = problemText.replace(/<[^>]*>/g, '');

          // remove all &nbsp;
          problemText = problemText.replaceAll("&nbsp;", "");

          // process all html entities
          const entities: Record<string, string> = {
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&apos;': "'",
            '&amp;': '&'
          };

          problemText = problemText.replace(/&lt;|&gt;|&quot;|&apos;|&amp;/g, (match) => {
            return entities[match];
          })

          await sendMessage("problem", { problem: problemText });
          scraped = true;
          break;
        } else {
          await sendMessage("log", { log: "Did not find leetcode problem, rescraping" });
        }
        attempts++;
      }
      if (!scraped) {
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

