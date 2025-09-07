"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import AISummary from "./AISummary";
import Cookies from "js-cookie";

export default function Recorder() {
  const params = useParams();
  const meetingId = Number(params?.id);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [summary, setSummary] = useState<string>("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunks, { type: "audio/webm" });
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
      setIsRecording(true);
      setSummary("");
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white/30 backdrop-blur-md shadow-lg p-6 rounded-3xl border border-white/40 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Meeting Recorder</h2>
          <div className="flex gap-3">
            {!isRecording ? (
              <button onClick={startRecording}>
                <img
                  src="/voice.svg"
                  alt="Start Recording"
                  className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
                />
              </button>
            ) : (
              <button onClick={stopRecording}>
                <img
                  src="/stop.svg"
                  alt="Stop Recording"
                  className="w-8 h-8 cursor-pointer hover:scale-110 transition-transform"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <AISummary summary={summary} />
    </div>
  );
}
