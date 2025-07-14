"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import Logo from "../../components/Logo";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function Dashboard() {
  const { user, logout, getToken } = useAuth();
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    | { summary: string; actionItems: { task: string; assignee: string; deadline: string; tone?: string; importance?: string }[] }
    | null
  >(null);
  const [error, setError] = useState("");
  const [exportMsg, setExportMsg] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [savedTranscriptId, setSavedTranscriptId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string>("");

  // Remove ONEDRIVE_CLIENT_ID and related useEffect

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
      if (importUrl) {
        const ext = importUrl.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') source = 'pdf-url';
        else if (ext === 'docx') source = 'docx-url';
        else if (ext === 'txt') source = 'txt-url';
        else if (ext === 'csv') source = 'csv-url';
      }

      const token = getToken();
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : '',
        },
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
      } else {
        setError('Unsupported file type for URL import. Please use a .txt or .csv link.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to import from URL.");
    }
  }

  const handleImportFileClick = () => {
    setImportError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'txt' || ext === 'csv') {
        const reader = new FileReader();
        reader.onload = ev => setTranscript(ev.target?.result as string || "");
        reader.readAsText(file);
      } else if (ext === 'pdf') {
        // Polyfill DOMMatrix if missing
        if (typeof window !== "undefined" && typeof window.DOMMatrix === "undefined") {
          // @ts-ignore
          window.DOMMatrix = window.WebKitCSSMatrix || window.MSCSSMatrix || function() {};
        }
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setTranscript(text);
      } else {
        setImportError('Unsupported file type. Please select a .txt, .csv, or .pdf file.');
      }
    } catch (err) {
      setImportError('Failed to extract text from file.');
    }
  };

  // Add file upload handler
  // Remove: handleFileUpload, import file button, OneDrive picker, and all file upload logic

  // Remove: handleOneDrivePicker

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center">
        {/* Navigation */}
        <nav className="w-full bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Logo size="md" />
              </div>
              <div className="flex items-center space-x-4">
                <a href="/dashboard" className="relative px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-600 hover:text-transparent hover:underline hover:underline-offset-8">
                  Home
                </a>
                <a href="/transcripts" className="relative px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent hover:bg-gradient-to-r hover:from-pink-400 hover:to-violet-600 hover:text-transparent hover:underline hover:underline-offset-8">
                  Transcripts
                </a>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-bold transition-all duration-300 flex items-center hover:underline hover:underline-offset-8 hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg animate-fade-in-slide-up delay-100">
          <div className="mb-6 animate-fade-in delay-100">
            <Logo size="xl" className="text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg animate-fade-in delay-200 home-hero-title">Transcribe.ai</h1>
          <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl mx-auto animate-fade-in delay-300 home-hero-desc">Transform your meetings into actionable insights with AI-powered transcription, summarization, and action item extraction.</p>
          <div className="flex flex-wrap gap-4 justify-center animate-fade-in delay-300">
            <span className="bg-white/20 px-4 py-2 rounded-full font-semibold border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/40 hover:text-blue-900 animate-bounce-slow">Summarize Meetings</span>
            <span className="bg-white/20 px-4 py-2 rounded-full font-semibold border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/40 hover:text-indigo-900 animate-bounce-slow2">Extract Action Items</span>
            <span className="bg-white/20 px-4 py-2 rounded-full font-semibold border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/40 hover:text-purple-900 animate-bounce-slow3">Export to Slack, Notion, Trello</span>
          </div>
          <div className="mt-8 animate-fade-in delay-400">
            <a href="/transcripts" className="inline-flex items-center px-6 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/40 hover:text-blue-900 hover:scale-105 transition-all duration-300 shadow-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Meeting Transcripts
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-[-3rem] z-10 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-blue-500 animate-fade-in-slide-up delay-200 feature-card hover:scale-105 hover:shadow-2xl transition-all duration-300">
            <svg className="w-10 h-10 mb-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
            <h3 className="font-bold text-lg mb-1">Instant Summaries</h3>
            <p className="text-gray-600">Get concise, AI-powered meeting summaries in seconds.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-indigo-500 animate-fade-in-slide-up delay-300 feature-card hover:scale-105 hover:shadow-2xl transition-all duration-300">
            <svg className="w-10 h-10 mb-2 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <h3 className="font-bold text-lg mb-1">Actionable Tasks</h3>
            <p className="text-gray-600">Extract action items, assignees, and deadlines automatically.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center border-t-4 border-purple-500 animate-fade-in-slide-up delay-400 feature-card hover:scale-105 hover:shadow-2xl transition-all duration-300">
            <svg className="w-10 h-10 mb-2 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h3 className="font-bold text-lg mb-1">Seamless Export</h3>
            <p className="text-gray-600">Send results to Slack, Notion, Trello, or copy as Markdown.</p>
          </div>
        </section>

        {/* Main Form Section */}
        <section className="w-full flex flex-col items-center justify-center flex-1 py-12 px-4">
          <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-2xl gap-4 bg-white rounded-xl shadow-lg p-8 border border-gray-100 mt-8 animate-fade-in-slide-up delay-500">
            {/* File import button and input */}
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={handleImportFileClick} className="px-4 py-2 bg-orange-500 text-white rounded cursor-pointer hover:bg-orange-600 transition font-semibold shadow active:scale-95">
                Import File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {importError && <div className="text-red-600 font-medium mb-2">{importError}</div>}
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
          .home-hero-title {
            transition: color 0.3s, text-shadow 0.3s;
          }
          .home-hero-title:hover {
            color: #fbbf24;
            text-shadow: 0 2px 24px #fbbf24, 0 1px 0 #fff;
          }
          .home-hero-desc {
            transition: color 0.3s, text-shadow 0.3s;
          }
          .home-hero-desc:hover {
            color: #a5b4fc;
            text-shadow: 0 2px 12px #818cf8, 0 1px 0 #fff;
          }
          .feature-card {
            transition: box-shadow 0.3s, transform 0.3s;
          }
          .feature-card:hover {
            box-shadow: 0 8px 32px 0 rgba(59,130,246,0.15), 0 1.5px 6px 0 rgba(99,102,241,0.10);
            transform: scale(1.05);
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 2.2s infinite;
          }
          .animate-bounce-slow2 {
            animation: bounce-slow 2.6s infinite;
          }
          .animate-bounce-slow3 {
            animation: bounce-slow 3s infinite;
          }
        `}</style>
      </main>
    </ProtectedRoute>
  );
} 