"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import Logo from "../components/Logo";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | { summary: string; actionItems: { task: string; assignee: string; deadline: string; tone?: string; importance?: string }[] }
    | null
  >(null);
  const [error, setError] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [savedTranscriptId, setSavedTranscriptId] = useState<string | null>(null);

  // OneDrive integration
  const ONEDRIVE_CLIENT_ID = "YOUR_ONEDRIVE_CLIENT_ID"; // TODO: Replace with your OneDrive Client ID

  useEffect(() => {
    // Load OneDrive API script
    if (!window.OneDrive) {
      const script = document.createElement('script');
      script.src = 'https://js.live.net/v7.2/OneDrive.js';
      document.body.appendChild(script);
    }
  }, []);

  async function handleExport(type: 'slack' | 'notion' | 'trello' | 'markdown' | 'email') {
    if (!result) return;
    setExportMsg("");
    if (type === 'markdown') {
      const md = `**Meeting Summary**\n\n${result.summary}\n\n**Action Items**\n${result.actionItems.map(item => `- ${item.task} _(Assignee: ${item.assignee}${item.deadline ? ", Due: " + item.deadline : ""})_`).join("\n")}`;
      try {
        await navigator.clipboard.writeText(md);
        setExportMsg("Markdown copied to clipboard!");
      } catch {
        setExportMsg("Failed to copy markdown.");
      }
      return;
    }
    if (type === 'email') {
      try {
        const res = await fetch('/api/export-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Export failed');
        // Open default email client with subject and body
        const mailto = `mailto:?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.body)}`;
        window.location.href = mailto;
        setExportMsg('Email client opened!');
      } catch (err: any) {
        setExportMsg(err.message || 'Export failed');
      }
      return;
    }
    try {
      const res = await fetch(`/api/export-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');
      setExportMsg(data.message || 'Export successful!');
    } catch (err: any) {
      setExportMsg(err.message || 'Export failed');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSavedTranscriptId(null);
    if (!transcript.trim()) {
      setError("Please enter or paste a transcript.");
      return;
    }
    setLoading(true);
    try {
      // Determine source based on how the transcript was imported
      let source = 'manual-import';
      if (selectedFileName) {
        const ext = selectedFileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') source = 'pdf-import';
        else if (ext === 'docx') source = 'docx-import';
        else if (ext === 'txt') source = 'txt-import';
        else if (ext === 'csv') source = 'csv-import';
      } else if (importUrl) {
        const ext = importUrl.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') source = 'pdf-url';
        else if (ext === 'docx') source = 'docx-url';
        else if (ext === 'txt') source = 'txt-url';
        else if (ext === 'csv') source = 'csv-url';
      }

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
      setSavedTranscriptId(data.id);
    } catch (err: any) {
      setError(err.message || "Error processing transcript");
    } finally {
      setLoading(false);
    }
  }

  async function handleImportUrl() {
    setError("");
    if (!importUrl.trim()) {
      setError("Please enter a URL.");
      return;
    }
    try {
      const ext = importUrl.split('.').pop()?.toLowerCase();
      if (ext === 'txt' || ext === 'csv') {
        const res = await fetch(importUrl);
        if (!res.ok) throw new Error("Failed to fetch transcript from URL.");
        const text = await res.text();
        setTranscript(text);
      } else if (ext === 'pdf' || ext === 'docx') {
        const res = await fetch(importUrl);
        if (!res.ok) throw new Error("Failed to fetch file from URL.");
        const blob = await res.blob();
        const file = new File([blob], `imported.${ext}`);
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload-transcript', {
          method: 'POST',
          body: formData,
        });
        const data = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(data.error || 'Failed to parse file from URL.');
        setTranscript(data.text);
      } else {
        setError('Unsupported file type for URL import. Please use a .txt, .csv, .pdf, or .docx link.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to import from URL.");
    }
  }

  // Add file upload handler
  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt' || ext === 'csv' || ext === 'pdf' || ext === 'docx') {
      const formData = new FormData();
      formData.append('file', file);
      setError("");
      try {
        const res = await fetch('/api/upload-transcript', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to parse file.');
        setTranscript(data.text);
      } catch (err: any) {
        setError(err.message || 'Failed to parse file.');
      }
    } else {
      setError('Unsupported file type. Please upload a .txt, .csv, .pdf, or .docx file.');
    }
  }

  async function handleOneDrivePicker() {
    setError("");
    if (ONEDRIVE_CLIENT_ID === "YOUR_ONEDRIVE_CLIENT_ID") {
      setError("Please set your OneDrive Client ID in the code.");
      return;
    }
    if (!window.OneDrive) {
      setError("OneDrive Picker is still loading. Please try again in a moment.");
      return;
    }
    window.OneDrive.open({
      clientId: ONEDRIVE_CLIENT_ID,
      action: 'download',
      multiSelect: false,
      openInNewWindow: true,
      advanced: { filter: '.txt,.csv,.pdf,.docx' },
      success: async (files: any) => {
        if (files && files.value && files.value.length > 0) {
          const file = files.value[0];
          try {
            const fileRes = await fetch(file['@microsoft.graph.downloadUrl']);
            const text = await fileRes.text();
            setTranscript(text);
          } catch (err: any) {
            setError("Failed to fetch file from OneDrive.");
          }
        }
      },
      cancel: () => {},
      error: () => setError("OneDrive Picker error."),
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center">
      {/* Navigation */}
      <nav className="w-full bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
              <a href="/transcripts" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Transcripts
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg animate-fade-in-slide-up delay-100">
        <div className="mb-6 animate-fade-in delay-100">
          <Logo size="xl" className="text-white" />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in delay-200">Transcribe.ai</h1>
        <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl mx-auto animate-fade-in delay-300">Transform your meetings into actionable insights with AI-powered transcription, summarization, and action item extraction.</p>
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in delay-300">
          <span className="bg-white/20 px-4 py-2 rounded-full font-semibold border border-white/30 transition-all duration-300 hover:scale-105">Summarize Meetings</span>
          <span className="bg-white/20 px-4 py-2 rounded-full font-semibold border border-white/30 transition-all duration-300 hover:scale-105">Extract Action Items</span>
          <span className="bg-white/20 px-4 py-2 rounded-full font-semibold border border-white/30 transition-all duration-300 hover:scale-105">Export to Slack, Notion, Trello</span>
        </div>
        <div className="mt-8 animate-fade-in delay-400">
          <a href="/transcripts" className="inline-flex items-center px-6 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Meeting Transcripts
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-[-3rem] z-10 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-blue-500 animate-fade-in-slide-up delay-200">
          <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
          <h3 className="font-bold text-lg mb-1">Instant Summaries</h3>
          <p className="text-gray-600">Get concise, AI-powered meeting summaries in seconds.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-indigo-500 animate-fade-in-slide-up delay-300">
          <svg className="w-10 h-10 mb-2 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <h3 className="font-bold text-lg mb-1">Actionable Tasks</h3>
          <p className="text-gray-600">Extract action items, assignees, and deadlines automatically.</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-purple-500 animate-fade-in-slide-up delay-400">
          <svg className="w-10 h-10 mb-2 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <h3 className="font-bold text-lg mb-1">Seamless Export</h3>
          <p className="text-gray-600">Send results to Slack, Notion, Trello, or copy as Markdown.</p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="w-full flex flex-col items-center justify-center flex-1 py-12 px-4">
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-2xl gap-4 bg-white rounded-xl shadow-lg p-8 border border-gray-100 mt-8 animate-fade-in-slide-up delay-500">
          {/* Only file upload input remains */}
          <div className="flex items-center gap-2 mb-2">
            <label htmlFor="file-upload" className="px-4 py-2 bg-orange-500 text-white rounded cursor-pointer hover:bg-orange-600 transition font-semibold shadow active:scale-95">
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".txt,.csv,.pdf,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="text-gray-600 text-sm truncate max-w-xs">{selectedFileName}</span>
          </div>
          <textarea
            className="border border-gray-300 rounded-lg p-3 w-full min-h-[120px] focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800 text-base resize-vertical"
            placeholder="Paste meeting transcript here..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
          <button
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 active:scale-95"
            type="submit"
            disabled={loading}
          >
            {loading ? "Summarizing..." : "Summarize & Extract Actions"}
          </button>
          {error && <div className="text-red-600 font-medium">{error}</div>}
        </form>

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8 w-full max-w-2xl border border-gray-100 animate-fade-in-slide-up delay-700">
            <h2 className="text-2xl font-bold mb-3 text-blue-700">Summary</h2>
            <p className="mb-6 text-gray-800 text-lg">{result.summary}</p>
            <h3 className="text-xl font-semibold mb-2 text-indigo-700">Action Items</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              {result.actionItems.map((item, idx) => (
                <li key={idx} className="mb-3">
                  <div className="font-semibold text-base">
                    <strong>{item.task}</strong>
                    {" — "}
                    <span className="italic">{item.assignee}</span>
                    {item.deadline ? (
                      <span> (Due: {item.deadline})</span>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-500 ml-2 flex flex-wrap gap-4">
                    <span><span className="font-medium">Tone:</span> {item.tone || <span className="italic">N/A</span>}</span>
                    <span><span className="font-medium">Importance:</span> {item.importance || <span className="italic">N/A</span>}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                onClick={() => handleExport('slack')}
              >
                Export to Slack
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                onClick={() => handleExport('notion')}
              >
                Export to Notion
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
                onClick={() => handleExport('trello')}
              >
                Export to Trello
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800 transition"
                onClick={() => handleExport('markdown')}
              >
                Copy Markdown
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                onClick={() => handleExport('email')}
              >
                Export to Email
              </button>
            </div>
            {exportMsg && <div className="mt-3 text-green-700 font-medium">{exportMsg}</div>}
            {savedTranscriptId && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold text-green-800">Transcript Saved!</span>
                </div>
                <p className="text-green-700 mb-3">Your transcript has been saved and is now available in your transcripts library.</p>
                <a 
                  href="/transcripts" 
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Transcripts
                </a>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Animation keyframes for fade-in */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        @keyframes fade-in-slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in-slide-up {
          animation: fade-in-slide-up 1s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </main>
  );
}
