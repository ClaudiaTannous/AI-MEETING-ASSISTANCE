"use client";

import { useRouter } from "next/navigation";
import { Meeting } from "@/types";

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/meetings/${meeting.id}`)}
      className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition cursor-pointer"
    >
      <h3 className="font-semibold text-lg">{meeting.title}</h3>
      <p className="text-sm text-gray-500">
        {new Date(meeting.date).toLocaleString()}
      </p>
      {meeting.transcript ? (
        <p className="text-sm text-green-600 mt-2">Transcript Available</p>
      ) : (
        <p className="text-sm text-gray-400 mt-2">No Transcript Yet</p>
      )}
    </div>
  );
}
