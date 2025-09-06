"use client";

import { useState } from "react";
import { useParams } from "next/navigation"; // ✅ get meetingId from URL
import AISummary from "./AISummary";
import Cookies from "js-cookie";

export default function Recorder() {
  const params = useParams(); // ✅ get dynamic route params
  const meetingId = Number(params?.id); // ✅ parse meetingId from /meetings/[id]

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);
  const [summary, setSummary] = useState<string>("");

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.continuous = true;

    recog.onresult = (event: any) => {
      let finalText = transcript;
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }

      setTranscript(finalText + interimText);
    };

    recog.start();
    setRecognition(recog);
    setIsRecording(true);
    setIsPaused(false);
    setSummary("");
  };

  const pauseRecording = () => {
    if (recognition) recognition.stop();
    setIsPaused(true);
    setIsRecording(false);
  };

  const resumeRecording = () => {
    if (recognition) recognition.start();
    setIsPaused(false);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (recognition) recognition.stop();
    setIsRecording(false);
    setIsPaused(false);

    console.log("📤 Sending transcript:", transcript);

    if (!transcript.trim()) {
      setSummary("⚠️ No speech detected. Please try again.");
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        setSummary("❌ No auth token found. Please log in.");
        return;
      }

      // 1️⃣ Save transcript dynamically for this meeting
      const transcriptRes = await fetch(
        `http://localhost:8000/transcripts/${meetingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ content: transcript }),
        }
      );

      if (!transcriptRes.ok) {
        setSummary("❌ Failed to save transcript.");
        return;
      }

      const transcriptData = await transcriptRes.json();
      const transcriptId = transcriptData.id;

      // 2️⃣ Generate summary dynamically
      const response = await fetch(
        `http://localhost:8000/summaries/${transcriptId}/ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary_text);
      } else {
        setSummary("❌ Failed to get summary from backend.");
      }
    } catch (err) {
      console.error("Error:", err);
      setSummary("❌ Could not connect to backend.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/30 backdrop-blur-md shadow-lg p-6 rounded-3xl border border-white/40 relative">
        <h2 className="text-lg font-semibold mb-3">
          Live Meeting Transcription
        </h2>

        {/* Controls in top-right */}
        <div className="absolute top-4 right-4 flex gap-3">
          {!isRecording && !isPaused ? (
            // Start
            <button onClick={startRecording}>
              <img
                src="/voice.svg"
                alt="Start Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          ) : isRecording ? (
            // Pause
            <button onClick={pauseRecording}>
              <img
                src="/pause.svg"
                alt="Pause Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          ) : (
            // Resume
            <button onClick={resumeRecording}>
              <img
                src="/play.svg"
                alt="Resume Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          )}

          {/* Stop (only visible when recording or paused) */}
          {(isRecording || isPaused) && (
            <button onClick={stopRecording}>
              <img
                src="/stop.svg"
                alt="Stop Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          )}
        </div>

        {/* Transcript Box */}
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg h-60 overflow-y-auto mt-12">
          {transcript ? (
            <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-gray-500 text-sm">Waiting for speech...</p>
          )}
        </div>
      </div>

      {/* AI Summary */}
      <AISummary summary={summary} />
    </div>
  );
}
