"use client";

interface AISummaryProps {
  summary: string;
}

export default function AISummary({ summary }: AISummaryProps) {
  if (!summary) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🤖 AI Summary <span className="text-sm text-blue-500">Generated</span>
      </h3>

      <p className="text-gray-800 whitespace-pre-wrap mb-4">{summary}</p>

      <div className="flex justify-between text-sm text-gray-500 mt-3"></div>
    </div>
  );
}
