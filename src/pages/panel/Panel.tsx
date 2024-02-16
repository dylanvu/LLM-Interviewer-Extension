import { useEffect, useState } from 'react';
import '@pages/panel/Panel.css';
import { Button, CheckboxGroup, Checkbox, Stack, Text, Center, RadioGroup, Radio } from '@chakra-ui/react';
import { generateNewProblem } from '@src/services/leetcode';
import { ChromeMessage } from '@src/interfaces/messages';

export default function Panel(): JSX.Element {
  const [position, setPosition] = useState("intern");
  const [interviewState, setInterviewState] = useState<"off" | "listening" | "speaking" | "doneListening">("off");
  const [transcript, setTranscript] = useState<string>("");
  const [speech, setSpeech] = useState<SpeechSynthesis | null>(null)

  function endInterview() {
    // reset the FSM, clear transcripts, etc
    setInterviewState("off");
    setTranscript("");
    if (speech) {
      speech.cancel();
      setSpeech(null);
    }
  }

  function say(text: string) {
    setInterviewState("speaking");
    // speech synthesis
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setInterviewState("listening");
      setSpeech(null);
    }
    speechSynthesis.speak(utterance);
    setSpeech(speechSynthesis);
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
    });
  }

  // const transcriber = useTranscriber();

  useEffect(() => {

    // listen for events
    chrome.runtime.onMessage.addListener(async (request: ChromeMessage, sender, sendResponse) => {
      if (request.action === "problem") {
        console.log(request.problem);
        // now begin the interview
        // TODO: Create an internal timer or something somehow?
        say("Hello there! I will be interviewing you today. You'll be completing this Leetcode problem here. You'll have 30 minutes to come up with a solution. Feel free to ask me for any hints or help.");

      } else if (request.action === "scrapingError") {
        console.error("Error while scraping:", request.error);

      } else if (request.action === "domStateChange") {
        if (request.state === "DOMLoaded") {
          // send message to scrape the leetcode question
          chrome.tabs.query({
            currentWindow: true,
            active: true
          }, async (tabs) => {
            const tabId = tabs[0].id;
            if (tabId) {
              console.log("Sending scraping message");
              await chrome.tabs.sendMessage(tabId, { action: "scrapeProblem" });
            } else {
              console.error("unknown tabid while loading dom and sending scrape message");
            }
          })
        }

      } else if (request.action === "log") {
        console.log("Log from content script:", request.log);
      }
    });
  }, []);

  useEffect(() => {
    // when the FSM changes, listen
    if (interviewState === "listening") {
      // clear transcript
      setTranscript("");
      listen();
    } else if (interviewState === "speaking") {
      // reset transcript
    } else if (interviewState === "doneListening") {
      // send transcript to LLM

      // say it out loud
      say(transcript);
    }
    console.log(interviewState);
  }, [interviewState]);

  function listen() {

    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();

    recognition.interimResults = false; // use this to only create results whenever there is a pause
    recognition.continuous = true;

    recognition.start();

    recognition.onresult = (event: any) => {
      if (interviewState === "listening") {
        const result = event.results[event.results.length - 1][0].transcript;
        setTranscript(result);
        setInterviewState("doneListening");
      }
      recognition.stop()
    };

    recognition.onend = () => {
      console.log("ending recognition");
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onnomatch = () => {
      console.log('No speech was recognized.');
    };


  }

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
        <Button onClick={() => interviewState === "off" ? beginInterview() : endInterview()}>
          {interviewState === "off" ? "Begin Interview" : "Stop Interview"}
        </Button>
      </Center>
      <h1>Real-time Transcript</h1>
      <div>{transcript}</div>
    </div>
  );
}
