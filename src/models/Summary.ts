import mongoose from 'mongoose';

export interface ISummary {
  user: mongoose.Schema.Types.ObjectId;
  transcript: mongoose.Schema.Types.ObjectId;
  fullSummaryText: string;
  createdAt: Date;
}

const SummarySchema = new mongoose.Schema<ISummary>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transcript: { type: mongoose.Schema.Types.ObjectId, ref: 'Transcript', required: true },
  fullSummaryText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema); 