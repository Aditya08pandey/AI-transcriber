import mongoose from 'mongoose';

export interface IActionItem {
  task: string;
  assignee: string;
  deadline?: string;
  tone?: string;
  importance?: string;
}

export interface ITranscript {
  id: string;
  timestamp: string;
  source: string;
  transcript: string;
  summary: string;
  actionItems: IActionItem[];
  createdAt: string;
}

const ActionItemSchema = new mongoose.Schema({
  task: { type: String, required: true },
  assignee: { type: String, required: true },
  deadline: { type: String },
  tone: { type: String },
  importance: { type: String }
});

const TranscriptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  source: { type: String, required: true },
  transcript: { type: String, required: true },
  summary: { type: String, required: true },
  actionItems: [ActionItemSchema],
  createdAt: { type: String, required: true }
}, {
  timestamps: true
});

// Create index for better query performance
TranscriptSchema.index({ createdAt: -1 });
TranscriptSchema.index({ source: 1 });

export default mongoose.models.Transcript || mongoose.model('Transcript', TranscriptSchema); 