import { useEffect, useState } from 'react';
import '@pages/panel/Panel.css';
import { Button, CheckboxGroup, Checkbox, Stack, Text, Center, RadioGroup, Radio } from '@chakra-ui/react';
import { generateNewProblem } from '@src/services/leetcode';
import { ChromeMessage } from '@src/interfaces/messages';

export default function Panel(): JSX.Element {
  const [position, setPosition] = useState("intern");
  const [recognition, setRecognition] = useState();
  const [interviewState, setInterviewState] = useState<"idle" | "listening" | "speaking">("idle");
  const [feedbackState, setFeedbackState] = useState<"loading" | "idle">("idle");
  const [domState, setDomState] = useState<"DOMLoaded" | "DOMLoading">("DOMLoading");

  function say(text: string) {
    // speech synthesis
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      setInterviewState("speaking");
    }
    utterance.onend = () => {
      setInterviewState("idle");
    }
    speechSynthesis.speak(utterance);
  }

  async function beginInterview() {
    // first, redirect the user to a new leetcode problem
    const problemURL = await generateNewProblem();

    // change the tab url
    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, async (tabs) => {

      // redirect
      await chrome.tabs.update({
        url: problemURL
      });

      // utter the text
      say("Hello there! I will be interviewing you today. You'll be completing this Leetcode problem here. You'll have 30 minutes to come up with a solution. Feel free to ask me for any hints or help.");

      // switch the app state to be "listening" mode
      setInterviewState("listening");

    });
  }

  // const transcriber = useTranscriber();

  useEffect(() => {
    // set up speech recognition
    const recog = new webkitSpeechRecognition() || new SpeechRecognition();

    recog.interimResults = false; // use this to only create results whenever there is a pause
    recog.continuous = true;

    setRecognition(recog);

    // listen for events
    chrome.runtime.onMessage.addListener(async (request: ChromeMessage, sender, sendResponse) => {
      if (request.action === "problem") {
        console.log("I got a problem:");
        console.log(request.problem);
      } else if (request.action === "scrapingError") {
        console.error("Error while scraping:", request.error);
      } else if (request.action === "domStateChange") {
        setDomState(request.state);
      } else if (request.action === "log") {
        console.log("Log from content script:", request.log);
      }
    });
  }, []);

  useEffect(() => {
    console.log(interviewState);
  }, [interviewState]);

  useEffect(() => {
    if (domState === "DOMLoaded") {
      // send message to scrape the leetcode question
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, async (tabs) => {
        const tabId = tabs[0].id;
        if (tabId) {
          console.log("Sending scraping message");
          chrome.tabs.sendMessage(tabId, { action: "scrapeProblem" });
        } else {
          console.error("unknown tabid while loading dom and sending scrape message");
        }
      })
    }
  }, [domState]);

  return (
    <div className='container'>
      <div>
        <Text fontSize="xl">
          Position Level
        </Text>
        <RadioGroup onChange={setPosition} value={position}>
          <Stack direction='row'>
            <Radio value='intern'>Intern</Radio>
            <Radio value='junior'>Junior</Radio>
            <Radio value='senior'>Senior</Radio>
          </Stack>
        </RadioGroup>
      </div>
      <div>
        <Text fontSize="xl">
          Question Difficulties
        </Text>
        <CheckboxGroup>
          <Stack>
            <Checkbox>Easy</Checkbox>
            <Checkbox>Medium</Checkbox>
            <Checkbox>Hard</Checkbox>
          </Stack>
        </CheckboxGroup>
      </div>
      <Center>
        <Button onClick={beginInterview}>
          Begin Interview
        </Button>
      </Center>
      {/* <div>
        <Button onClick={beginListen}>
          Listen
        </Button>
      </div> */}
    </div>
  );
}
