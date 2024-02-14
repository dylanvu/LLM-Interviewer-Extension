import { useEffect, useState } from 'react';
import '@pages/panel/Panel.css';
import { Button, CheckboxGroup, Checkbox, Stack, Text, Center, RadioGroup, Radio } from '@chakra-ui/react';
import { generateNewProblem } from '@src/services/leetcode';
import { AudioManager } from '@src/components/AudioManager';
import Transcript from '@src/components/Transcript';
import { useTranscriber } from "../../hooks/useTranscriber";

export default function Panel(): JSX.Element {
  const [position, setPosition] = useState("intern");
  const [recognition, setRecognition] = useState()

  async function beginInterview() {
    const problemURL = await generateNewProblem();

    chrome.tabs.query({ // change the tab url
      currentWindow: true,
      active: true
    }, function (tab) {
      chrome.tabs.update({
        url: problemURL
      });
    });
  }

  // const transcriber = useTranscriber();

  useEffect(() => {
    // set up speech  recognition
    const recog = new webkitSpeechRecognition() || new SpeechRecognition();

    recog.interimResults = false; // use this to only create results whenever there is a pause
    recog.continuous = true;

    setRecognition(recog);

  }, [])

  function beginListen() {
    if (recognition) {
      recognition.start();

      recognition.onresult = event => {
        const result = event.results[event.results.length - 1][0].transcript;
        console.log(result);

        // speech synthesis
        let utterance = new SpeechSynthesisUtterance(result);
        speechSynthesis.speak(utterance);
        // TODO: Find a way to not capture this audio again
      };

      recognition.onend = () => {
        console.log("ended, restarting recording");
      };

      recognition.onerror = event => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onnomatch = () => {
        console.log('No speech was recognized.');
      };
    } else {
      console.log("no recognition");
    }
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
        <Button onClick={beginInterview}>
          Begin Interview
        </Button>
      </Center>
      <div>
        {/* <AudioManager transcriber={transcriber} /> */}
        <Button onClick={beginListen}>
          Listen
        </Button>
      </div>
      <div>
        {/* <Transcript transcribedData={transcriber.output} /> */}
      </div>
    </div>
  );
}
