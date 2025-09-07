"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import AISummary from "./AISummary";
import Cookies from "js-cookie";

export default function Recorder() {
  const params = useParams();
  const meetingId = Number(params?.id);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState<string>("");

  const [chunks, setChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const tempChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) tempChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(tempChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", blob, "recording.webm");

        try {
          const token = Cookies.get("token");
          if (!token) {
            setSummary(" No auth token found. Please log in.");
            return;
          }

          const transcriptRes = await fetch(
            `http://localhost:8000/transcripts/${meetingId}/whisper`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            }
          );

          if (!transcriptRes.ok) {
            setSummary(" Failed to save transcript.");
            return;
          }

          const transcriptData = await transcriptRes.json();
          setTranscript(transcriptData.content);

          const transcriptId = transcriptData.id;
          const summaryRes = await fetch(
            `http://localhost:8000/summaries/${transcriptId}/ai`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            setSummary(summaryData.summary_text);
          } else {
            setSummary(" Failed to generate summary.");
          }
        } catch (err) {
          console.error("Upload error:", err);
          setSummary(" Could not connect to backend.");
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setChunks(tempChunks);
      setIsRecording(true);
      setIsPaused(false);
      setSummary("");
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Could not access microphone.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
      setIsRecording(false);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/30 backdrop-blur-md shadow-lg p-6 rounded-3xl border border-white/40 relative">
        <h2 className="text-lg font-semibold mb-3">
          Live Meeting Transcription
        </h2>

        <div className="absolute top-4 right-4 flex gap-3">
          {!isRecording && !isPaused ? (
            <button onClick={startRecording}>
              <img
                src="/voice.svg"
                alt="Start Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          ) : isRecording ? (
            <button onClick={pauseRecording}>
              <img
                src="/pause.svg"
                alt="Pause Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          ) : (
            <button onClick={resumeRecording}>
              <img
                src="/play.svg"
                alt="Resume Recording"
                className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
              />
            </button>
          )}

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

        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg h-60 overflow-y-auto mt-12">
          {transcript ? (
            <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
          ) : (
            <p className="text-gray-500 text-sm">
              {isRecording
                ? "🎙️ Recording..."
                : isPaused
                ? "⏸ Recording paused..."
                : "Waiting for speech..."}
            </p>
          )}
        </div>
      </div>

      <AISummary summary={summary} />
    </div>
  );
}
