import { useState } from 'react';
import '@pages/panel/Panel.css';
import { Button, CheckboxGroup, Checkbox, Stack, Text, Center, RadioGroup, Radio } from '@chakra-ui/react';
import { generateNewProblem } from '@src/services/leetcode';
import { AudioManager } from '@src/components/AudioManager';
import Transcript from '@src/components/Transcript';
import { useTranscriber } from "../../hooks/useTranscriber";

export default function Panel(): JSX.Element {
  const [position, setPosition] = useState("intern");

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

  const transcriber = useTranscriber();

  chrome.permissions.request({ permissions: ['audioCapture'] }, function (granted) {
    if (granted) {
      // User granted microphone permission
    } else {
      // User denied microphone permission
    }
  });

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
        <AudioManager transcriber={transcriber} />
      </div>
      <div>
        <Transcript transcribedData={transcriber.output} />
      </div>
    </div>
  );
}
