// omponent while handling the state carefully to avoid unnecessary re-renders and potential crashes, here's a structured plan:

// Plan for Integrating Two WebSocket Connections
// 1. WebSocket Setup
// Deepgram WebSocket: As already implemented, this handles real-time audio to text transcription.
// FastAPI WebSocket: This will be used to send the transcription to your FastAPI server and receive the processed text (like extracted questions).
// 2. React Component State Management
// State Management: Use useState for managing state like transcription text, connection status, current question, etc.
// UseEffect for WebSockets: Establish WebSocket connections in a useEffect hook that cleans up (closes connections) on component unmount to prevent memory leaks.
// 3. Handling Real-time Data


// Data Flow: Capture audio, send it to Deepgram via WebSocket, receive transcription, and then send this transcription to the FastAPI server to extract questions.
// State Updates: Update states based on responses from both WebSockets. Be cautious with updates inside WebSocket event handlers to prevent re-renders that don't change the state.
// 4. Avoiding Unnecessary Renders


// Memoization: Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders of components or recalculations of data.
// Batching State Updates: Batch related state updates together to avoid triggering excessive re-renders.
// 5. Component and WebSocket Logic


// Here is an outline of how you might modify the existing Microphone component to handle both WebSocket connections effectively:

// jsx
// Copy code
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

//I get this

export default function Microphone() {
  const [transcript, setTranscript] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    
    //seaparating the state
  const [deepgramConnection, setDeepgramConnection] = useState(null);
  const [fastAPIConnection, setFastAPIConnection] = useState(null);

  const audioChunks = useRef([]);
    const audioRecorder = useRef(null);
    
    //not sure what this ius
    //looks like we're missing a lot

  // Establish Deepgram WebSocket connection
  useEffect(() => {
    const deepgram = createClient('<Your_Deepgram_API_Key>');
    const connection = deepgram.listen.live({ /* options */ });
    setDeepgramConnection(connection);

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcription = /* process transcription data */;
      setTranscript(transcription);
      if (fastAPIConnection) {
        fastAPIConnection.send(JSON.stringify({ transcript }));
      }
    });

    return () => connection.close();
  }, []);

    //how does this compare to the original file? and what does the depedency array mean?


    
    
    
  // Establish FastAPI WebSocket connection
  useEffect(() => {
    const connection = new WebSocket('ws://127.0.0.1:8000/ws');
    setFastAPIConnection(connection);

    connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentQuestion(data.question);
    };

    return () => connection.close();
  }, []);
    
    //how does this send the Message to the fastAPI server?

  // Function to start/stop recording
  const toggleRecording = useCallback(() => {
    if (audioRecorder.current && audioRecorder.current.state === 'recording') {
      audioRecorder.current.stop();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioRecorder.current = new MediaRecorder(stream);
        audioRecorder.current.start();
        audioRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };
        audioRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current);
          deepgramConnection.send(audioBlob);
          audioChunks.current = [];
        };
      });
    }
  }, [deepgramConnection]);
    
    //

  return (
    <div>
      <button onClick={toggleRecording}>Toggle Recording</button>
      <div>Transcription: {transcript}</div>
      <div>Question: {currentQuestion}</div>
    </div>
  );
}



