"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from "@deepgram/sdk";

//deegram values
import React, { useState, useEffect, useCallback } from "react";
import Pusher from 'pusher-js';
import useWebSocket from 'react-use-websocket';
import { useQueue } from "@uidotdev/usehooks";
import Dg from "./dg.svg";
import Recording from "./recording.svg";
import Image from "next/image";
import { data } from "autoprefixer";

//useState, useEffect etc


// Interface definition
interface AnalysisData {
  'pusher message': {
      interview_question: string;
  };
}

export default function Microphone() {
  const { add, remove, first, size, queue } = useQueue<any>([]);
  const [apiKey, setApiKey] = useState<CreateProjectKeyResponse | null>();
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isListening, setListening] = useState(false);
  const [isLoadingKey, setLoadingKey] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [isProcessing, setProcessing] = useState(false);
  const [micOpen, setMicOpen] = useState(false);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>();
  const [userMedia, setUserMedia] = useState<MediaStream | null>();
  const [caption, setCaption] = useState<string | null>();
  const [extractedQuestion, setExtractedQuestion] = useState<string>('');
  const [transcriptionsSent, setTranscriptionsSent] = useState(0);


  const INDEX_API_ENDPOINTS = {
    development: 'http://localhost:8000/index',
    production: 'https://interviewbasic.vercel.app/api/index'
  }

  const API_ENDPOINTS = {
    development: 'http://localhost:8000/analyze-text/',
    production: 'https://interviewbasic.vercel.app/api/analyze-text'
  }
  const isBrowser = typeof window !== "undefined";
  const apiEndpoint = isBrowser && window.location.hostname === 'localhost' ?
    API_ENDPOINTS.development : API_ENDPOINTS.production;
// console.log('API Endpoint is set to:', apiEndpoint);
  //setup all this stuff in state


  const toggleMicrophone = useCallback(async () => {
    if (microphone && userMedia) {
      setUserMedia(null);
      setMicrophone(null);

      microphone.stop();
    } else {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const microphone = new MediaRecorder(userMedia);
      microphone.start(500);

      microphone.onstart = () => {
        setMicOpen(true);
      };

      microphone.onstop = () => {
        setMicOpen(false);
      };

      microphone.ondataavailable = (e) => {
        add(e.data);
      };

      setUserMedia(userMedia);
      setMicrophone(microphone);
    }
  }, [add, microphone, userMedia]);

  //this is a function for adding the microphone??

  // // Automatically start the microphone when component mounts
  // useEffect(() => {
  //   toggleMicrophone();
  //   return () => {
  //     // Clean up microphone when component unmounts
  //     // if (microphone) {
  //     //   microphone.stop();
  //     // }
  //   };
  // }, [toggleMicrophone]);

  useEffect(() => {
    // console.log(apiKey + "wtf")
    if (!apiKey) {
      console.log("getting a new api key");
      fetch("/api", { cache: "no-store" })
        .then((res) => res.json())
        .then((object) => {
          if (!("key" in object)) throw new Error("No api key returned");

          setApiKey(object);
          setLoadingKey(false);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [apiKey]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        encrypted: true
    });
  
    console.log('process.env.NEXT_PUBLIC_PUSHER_APP_KEY', process.env.NEXT_PUBLIC_PUSHER_APP_KEY)
    console.log('Pusher initiated!');
    const channel = pusher.subscribe('my-channel');

    channel.bind('new-analysis', function (data) {
      console.log("logging return from pusher");
      // console.log(data)
      console.log(data['pusher message'].interview_question);
      setExtractedQuestion(data['pusher message'].interview_question);
      console.log('Extracted Question:', extractedQuestion);
    });
  
    return () => {
        channel.unbind_all();
        channel.unsubscribe();
    };
  }, []);


  // console.log('Pusher App Key:123', process.env.NEXT_PUBLIC_PUSHER_APP_KEY);
  // // console.log('Pusher Cluster:', process.env.NEXT_PUBLIC_PUSHER_CLUSTER);
  // // console.log('Pusher App KeRRRR:', process.env.PUSHER_APP_ID);
  // // console.log('Pusher Cluster:', process.env.PUSHER_APP_SECRET);

  // const PUBLIC_PUSHER_APP_KEY = '22266158fe1cbe76cc8';
  // const PUBLIC_PUSHER_CLUSTER = 'us2'

  // useEffect(() => {
  //   const pusher = new Pusher(PUBLIC_PUSHER_APP_KEY, {
  //       cluster: PUBLIC_PUSHER_CLUSTER
  //   });
  
  //   // console.log('process.env.NEXT_PUBLICs_PUSHER_APP_KEY', process.env.NEXT_PUBLIC_PUSHER_APP_KEY)
  //   console.log('Pusher initiated!');
  //   const channel = pusher.subscribe('my-channel');

  //   channel.bind('new-analysis', function (data) {
  //     console.log("logging return from pusher");
  //     // console.log(data)
  //     console.log(data['pusher message'].interview_question);
  //     setExtractedQuestion(data['pusher message'].interview_question);
  //     console.log('Extracted Question:', extractedQuestion);
  //   });
  
  //   return () => {
  //       channel.unbind_all();
  //       channel.unsubscribe();
  //   };
  // }, []);

  // Function to send a GET request
const fetchIndexFromServer = async () => {
  console.log("fetchIndex is called");
  try {
    // Determine the environment and set the appropriate API endpoint
    const apiEndpoint = process.env.NODE_ENV === 'development' ? INDEX_API_ENDPOINTS.development : INDEX_API_ENDPOINTS.production;

    const response = await fetch(apiEndpoint, {
      method: 'GET', // Change to GET method
      headers: {
        'accept': 'application/json', // Typically, you just need to set accept header for GET requests
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Fetch result:', result);
  } catch (error) {
    console.error('Error fetching index from server:', error);
  }
};

  const sendTranscriptionToServer = async (transcriptionText: string) => {
  // console.log("send is called")
  try {
    const response = await fetch(apiEndpoint, { // Updated endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json', // Added for consistency with the curl command
      },
      body: JSON.stringify({ text: transcriptionText }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // console.log('Analysis result:', result);
  } catch (error) {
    console.error('Error sending transcription to server:', error);
  }
};



  useEffect(() => {
    if (apiKey && "key" in apiKey) {
      // console.log("connecting to deepgram");
      const deepgram = createClient(apiKey?.key ?? "");
      const connection = deepgram.listen.live({
        model: "nova",
        interim_results: true,
        smart_format: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        // console.log("deepgram connection established");
        setListening(true);
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        // console.log(" deepgram connection closed");
        setListening(false);
        setApiKey(null);
        setConnection(null);
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const words = data.channel.alternatives[0].words;
        const caption = words
          .map((word: any) => word.punctuated_word ?? word.word)
          .join(" ");
        if (caption !== "") {
          setCaption(caption);
          console.log('sending to fastAPI');
          sendTranscriptionToServer(caption);
          // if (transcriptionsSent === 0) {
          //   console.log(transcriptionsSent)
          //   // sendTranscriptionToServer(caption);
          //   fetchIndexFromServer();
          //   setTranscriptionsSent(prevCount => prevCount + 1)
          // }
        }
      });
      setConnection(connection);
      setLoading(false);
    }
  }, [apiKey, transcriptionsSent]);

  // sendTranscriptionToServer("what are your strengths as a designer?");

  useEffect(() => {
    const processQueue = async () => {
      if (size > 0 && !isProcessing) {
        setProcessing(true);

        if (isListening) {
          const blob = first;
          connection?.send(blob);
          remove();
        }

        const waiting = setTimeout(() => {
          clearTimeout(waiting);
          setProcessing(false);
        }, 250);
      }
    };

    processQueue();
  }, [connection, queue, remove, first, size, isProcessing, isListening]);

  if (isLoadingKey)
    return (
      <span className="w-full text-center">Loading temporary API key...</span>
    );
  if (isLoading)
    return <span className="w-full text-center">Loading the app...</span>;

  return (
    <div className="w-full relative">
  <div className="mt-10 flex flex-col align-middle items-center bg-[#DB5A30]">
    <div className="text-center text-white font-[Microsoft_Sans_Serif] text-xl mb-4">
      Current question: {extractedQuestion || 'question here'}
    </div>
    <button className="w-24 h-24" onClick={() => toggleMicrophone()}>
      <Recording
        width="96"
        height="96"
        className={`cursor-pointer ${!!userMedia && !!microphone && micOpen ? "fill-red-400 drop-shadow-glowRed" : "fill-gray-600"}`}
      />
    </button>
  </div>
</div>
  );
}
