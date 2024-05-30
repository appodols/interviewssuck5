"use client";


//deegram values
import React, { useState, useEffect, useCallback } from "react";
import Pusher from 'pusher-js';

export default function Recommender() {
  const [currentRecommendation, setCurrentRecommendation] = useState("");
  useEffect(() => {
    const pusher = new Pusher('22266158fe1cbe76cc85', {
      cluster: 'us2',
      // useTLS: true
      // encrypted: true
      // forceTLS: true
    });
  
    const channel = pusher.subscribe('recs-channel');
    channel.bind('new-recommendation', function (data: any) {
      console.log('Received data for rec:', data);
      let recommendation = data.recommendation['answer_recommendation'];
      setCurrentRecommendation(recommendation)
      console.log("Current Recommendation:", recommendation);
    });
  
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

return (
  <div className="w-full relative">
    {currentRecommendation}
</div>
  );
}
