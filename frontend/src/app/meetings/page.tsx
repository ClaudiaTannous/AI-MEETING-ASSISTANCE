"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Meeting } from "@/types";

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get("/meetings");
        setMeetings(res.data as Meeting[]);
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleCreateMeeting = async () => {
    setCreating(true);
    try {
      const res = await api.post("/meetings", { title: "New Meeting" });
      const newMeeting = res.data as Meeting;
      router.push(`/meetings/${newMeeting.id}`);
    } catch (err) {
      console.error("Error creating meeting:", err);
      setCreating(false);
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    try {
      await api.delete(`/meetings/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting meeting:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading meetings...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background1.png')" }}
    >
      <div className="flex justify-center mt-12 px-6">
        <div className="bg-white/30 backdrop-blur-md shadow-lg px-12 py-8 rounded-3xl border border-white/40 w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="logo1.svg"
              alt="Logo"
              className="w-30 h-20 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-gray-900">
                Ready to Record Meeting
              </h2>
              <p className="text-sm text-gray-600">Click to start</p>
            </div>
          </div>

          <button
            onClick={handleCreateMeeting}
            disabled={creating}
            className="bg-white text-white px-5 py-2 rounded-lg shadow disabled:opacity-50"
          >
            <img src="voice.svg" alt="Recorder Icon" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Meeting List */}
      <div className="flex justify-center mt-12 px-6">
        <div className="bg-white/30 backdrop-blur-md shadow-lg px-8 py-6 rounded-3xl border border-white/40 w-full max-w-7xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Meetings{" "}
              <span className="text-gray-400 text-sm">
                ({meetings.length} meetings)
              </span>
            </h2>
            <button
              onClick={() => router.push("/meetings")}
              className="text-200 text-black font-serif"
            >
              View All
            </button>
          </div>

          {meetings.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No meetings yet. Create one above.
            </p>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const latestSummary =
                  meeting.transcript?.summaries &&
                  meeting.transcript.summaries.length > 0
                    ? meeting.transcript.summaries[0].summary_text
                    : null;

                return (
                  <div
                    key={meeting.id}
                    className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {meeting.transcript ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-[#ff9b54] text-black">
                              Transcript Available
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-[#ff9b54] text-black">
                              No Transcript
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMeeting(meeting.id);
                            }}
                            className="p-1"
                          >
                            <img
                              src="/images/delete.svg"
                              alt="Delete"
                              className="w-4 h-4 cursor-pointer"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>

                      {latestSummary && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                          {latestSummary}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
