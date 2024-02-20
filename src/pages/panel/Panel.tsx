import { useEffect, useState } from 'react';
import '@pages/panel/Panel.css';
import { Button, CheckboxGroup, Checkbox, Stack, Text, Center, RadioGroup, Radio, CircularProgress } from '@chakra-ui/react';
import { generateNewProblem } from '@src/services/leetcode';
import { ChromeMessage } from '@src/interfaces/messages';
import { generatePrompt } from '@src/util/Constants';
import { generateResponse } from '@src/services/gemini';

export default function Panel(): JSX.Element {
  const [position, setPosition] = useState("intern");
  const [interviewState, setInterviewState] = useState<"off" | "listening" | "speaking" | "doneListening">("off");
  const [transcript, setTranscript] = useState<string>("");
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  const [speech, setSpeech] = useState<SpeechSynthesis | null>(null);
  const [problem, setProblem] = useState<string>("");
  const [history, setHistory] = useState<string[]>();

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
        // TODO: Create an internal timer or something somehow?
        const problem = request.problem;
        console.log(problem);
        // save this to display the current problem being worked on
        setProblem(problem);
        // generate the main prompt
        const mainPrompt = generatePrompt(problem);
        let history = [mainPrompt];
        setHistory(history);
        // now begin the interview cycle
        setInterviewState("doneListening");
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

    } else if (interviewState === "doneListening") {
      // generate a response using gpt with the current history
      console.log("Just said:", `"${transcript}"`);
      // make the request to Gemini
      setIsLoadingResponse(true);
      let historyToSend: string[];
      if (!history || history.length === 0) {
        console.log("No history found, I'm regenerating prompt");
        historyToSend = [generatePrompt(problem)];
      } else {
        console.log("Using existing history");
        historyToSend = [...history];
      }
      // add in the transcript
      historyToSend.concat([transcript]);
      generateResponse(historyToSend).then(response => {
        setIsLoadingResponse(false);
        // say the result
        // parse out the speak
        const responseObj = JSON.parse(response);
        const speakString = responseObj.speak
        // save the history
        const newHistory = historyToSend.concat([response]);
        setHistory(newHistory);
        // speak it now
        if (speakString && speakString.length > 0) {
          setInterviewState("speaking");
          say(speakString);
        } else {
          setInterviewState("listening");
          console.log("no speaking, but here is the res:", responseObj)
        }

      });
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
      }
      recognition.stop()
    };

    recognition.onend = () => {
      console.log("ending recognition");
      setInterviewState("doneListening");
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
      <h1>Interviewer Status</h1>
      <div>
        {isLoadingResponse ? <CircularProgress isIndeterminate /> : "Ready to respond"}
      </div>
      <h1>Real-time Transcript</h1>
      <div>{transcript}</div>
      <h1>History</h1>
      <div>
        {history?.map(message => { return <div>{message}</div> })}
      </div>
    </div>
  );
}
