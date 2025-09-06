"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import type { Meeting, Transcript, Summary } from "@/types";
import Recorder from "@/components/Recorder";

interface RecorderProps {
  meetingId: number;
}

export default function MeetingDetailsPage() {
  const params = useParams();
  const meetingId = parseInt(params?.id as string, 10);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/meetings/${meetingId}`);
        const data = res.data as Meeting;

        setMeeting(data);
        setNewTitle(data.title); // preload title into edit state
        if (data.transcript) {
          setTranscript(data.transcript);
          setSummaries(data.transcript.summaries || []);
        }
      } catch (err) {
        console.error("Error fetching meeting:", err);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId && !Number.isNaN(meetingId)) fetchMeeting();
  }, [meetingId]);

  const handleGenerateAiSummary = async () => {
    if (!transcript) return;
    setLoadingSummary(true);
    try {
      const res = await api.post(`/summaries/${transcript.id}/ai`);
      const newSummary = res.data as Summary;
      setSummaries((prev) => [newSummary, ...prev]);
    } catch (err) {
      console.error("Error generating AI summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSaveTitle = async () => {
    try {
      const res = await api.put<Meeting>(`/meetings/${meetingId}`, {
        title: newTitle,
      });
      setMeeting(res.data);
      setEditingTitle(false);
    } catch (err) {
      console.error("Error updating meeting:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading meeting...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Meeting not found.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background1.png')" }}
    >
      <div className="pt-10 px-6 space-y-8 max-w-7xl mx-auto">
        <div
          className="bg-white/30 backdrop-blur-md shadow-lg px-12 py-8 rounded-3xl border border-white/40 
                   w-fit max-w-7xl mx-auto flex items-center justify-between"
        >
          {editingTitle ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="border px-2 py-1 rounded-lg flex-grow"
              />
              <button
                onClick={handleSaveTitle}
                className="bg-green-600 text-white px-3 py-1 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTitle(false)}
                className="bg-gray-300 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <button
                onClick={() => {
                  setNewTitle(meeting.title);
                  setEditingTitle(true);
                }}
                className="flex-shrink-0 ml-4"
              >
                <img
                  src="/images/editing.svg"
                  alt="Edit"
                  className="w-6 h-6 cursor-pointer"
                />
              </button>
            </>
          )}
        </div>

        <div className="bg-white/30 backdrop-blur-md shadow-lg p-6 rounded-3xl border border-white/40">
          <Recorder />

          {transcript && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Live Transcript</h2>
              <p className="text-gray-800 whitespace-pre-wrap">
                {transcript.content}
              </p>
            </div>
          )}
        </div>

        {/* Summaries */}
        <div className="bg-white/30 backdrop-blur-md shadow-lg p-6 rounded-3xl border border-white/40">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">AI Summaries</h2>
            {transcript && (
              <button
                onClick={handleGenerateAiSummary}
                disabled={loadingSummary}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingSummary ? "Generating..." : "Generate AI Summary"}
              </button>
            )}
          </div>

          {summaries.length === 0 ? (
            <p className="text-gray-500">No summaries yet.</p>
          ) : (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="p-4 bg-gray-50/70 backdrop-blur-sm rounded-lg border"
                >
                  <p className="text-gray-800">{summary.summary_text}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Source: {summary.source} •{" "}
                    {new Date(summary.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
