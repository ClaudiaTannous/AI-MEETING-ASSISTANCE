export interface User {
  id: number;
  name: string;
  email: string;
  meetings: Meeting[];
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  user_id: number;
  transcript: Transcript | null;
}

export interface Transcript {
  id: number;
  content: string;
  created_at: string;
  meeting_id: number;
  summaries: Summary[];
}

export interface Summary {
  id: number;
  summary_text: string;
  source: string;
  created_at: string;
  transcript_id: number;
}
