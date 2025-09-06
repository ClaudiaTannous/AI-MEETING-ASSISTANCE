export interface User {
  id: number;
  name: string;
  email: string;
  meetings: Meeting[]; // always present (empty array if none)
}

export interface Meeting {
  id: number;
  title: string;
  date: string; // ISO datetime string
  user_id: number;
  transcript: Transcript | null; // always present, null if no transcript
}

export interface Transcript {
  id: number;
  content: string;
  created_at: string; // ISO datetime string
  meeting_id: number;
  summaries: Summary[]; // always present (empty if none)
}

export interface Summary {
  id: number;
  summary_text: string;
  source: string;
  created_at: string; // ISO datetime string
  transcript_id: number;
}
