"use client";

import React from "react";
import type { JSX } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";
import jsPDF from "jspdf";

interface MeetingData {
  id: string;
  timestamp: string;
  source: string;
  transcript: string;
  summary: string;
  createdAt: string;
}

const sourceIcons: Record<string, JSX.Element> = {
  "google-meet": (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h7a2 2 0 012 2v2h2.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0121 10.414V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
    </svg>
  ),
  "manual-import": (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  "pdf-import": (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  "docx-import": (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "txt-import": (
    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "csv-import": (
    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  "pdf-url": (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  "docx-url": (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  "txt-url": (
    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  "csv-url": (
    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  default: (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<MeetingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<MeetingData | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const response = await fetch("/api/transcripts");
      if (response.ok) {
        const data = await response.json();
        setTranscripts(data.transcripts);
        if (data.transcripts.length > 0) setSelectedTranscript(data.transcripts[0]);
      } else {
        console.error("Failed to fetch transcripts");
      }
    } catch (error) {
      console.error("Error fetching transcripts:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSourceDisplayName = (source: string) => {
    const sourceNames: Record<string, string> = {
      'google-meet': 'Google Meet Meeting',
      'manual-import': 'Manual Import',
      'pdf-import': 'PDF Import',
      'docx-import': 'Word Document Import',
      'txt-import': 'Text File Import',
      'csv-import': 'CSV File Import',
      'pdf-url': 'PDF from URL',
      'docx-url': 'Word Document from URL',
      'txt-url': 'Text File from URL',
      'csv-url': 'CSV File from URL'
    };
    return sourceNames[source] || `${source.charAt(0).toUpperCase() + source.slice(1)} Meeting`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Copied to clipboard!");
      } catch (fallbackError) {
        alert("Failed to copy to clipboard");
      }
    }
  };

  const downloadAsTxt = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = (content: string, filename: string, title: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, 20, 20);
    
    // Add content with better formatting
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const splitText = doc.splitTextToSize(content, 170);
    let yPosition = 40;
    
    for (let i = 0; i < splitText.length; i++) {
      // Check if we need a new page
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(splitText[i], 20, yPosition);
      yPosition += 7;
    }
    
    doc.save(filename);
  };

  const handleDownload = async (type: 'transcript' | 'summary', format: 'pdf' | 'txt') => {
    if (!selectedTranscript) return;
    
    const downloadId = `${type}-${format}`;
    setDownloading(downloadId);
    
    try {
      const content = type === 'transcript' ? selectedTranscript.transcript : selectedTranscript.summary;
      const timestamp = formatDate(selectedTranscript.timestamp);
      const source = getSourceDisplayName(selectedTranscript.source);
      
      if (format === 'txt') {
        const fullContent = type === 'transcript' 
          ? `${source}\nDate: ${timestamp}\n\nFULL TRANSCRIPT:\n${content}`
          : `${source}\nDate: ${timestamp}\n\nCOMPLETE SUMMARY:\n${content}`;
        
        downloadAsTxt(fullContent, `${type}-${selectedTranscript.id}.txt`);
      } else {
        const title = type === 'transcript' 
          ? `${source} - Full Transcript`
          : `${source} - Complete Summary`;
        
        const fullContent = `Date: ${timestamp}\n\n${content}`;
        downloadAsPdf(fullContent, `${type}-${selectedTranscript.id}.pdf`, title);
      }
    } catch (error) {
      console.error(`Error downloading ${type} as ${format}:`, error);
      alert(`Failed to download ${type} as ${format.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-xl font-bold text-gray-900 tracking-tight">Meeting Transcripts</span>
          </div>
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transcripts...</p>
          </div>
        ) : transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <svg className="mx-auto h-16 w-16 text-blue-300 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No transcripts yet</h3>
            <p className="text-gray-500 mb-4">Start recording a Google Meet session to generate your first transcript.</p>
            <Link href="/" className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transcript List */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Transcripts</h2>
                  <span className="text-xs text-gray-400">{transcripts.length}</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {transcripts.map((transcript) => (
                    <button
                      key={transcript.id}
                      className={`w-full text-left px-6 py-4 flex items-center gap-3 transition-all duration-150 hover:bg-blue-50 focus:outline-none ${selectedTranscript?.id === transcript.id ? "bg-blue-100 border-r-4 border-blue-600" : ""}`}
                      onClick={() => setSelectedTranscript(transcript)}
                    >
                      {sourceIcons[transcript.source] || sourceIcons.default}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {getSourceDisplayName(transcript.source)}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">{formatDate(transcript.timestamp)}</span>
                        </div>
                        <span className="block text-xs text-gray-500 truncate mt-1">
                          {transcript.summary.slice(0, 60)}{transcript.summary.length > 60 ? "..." : ""}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Transcript Details */}
            <section className="lg:col-span-2">
              {selectedTranscript ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        {sourceIcons[selectedTranscript.source] || sourceIcons.default}
                        {getSourceDisplayName(selectedTranscript.source)}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(selectedTranscript.timestamp)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedTranscript.transcript)}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Download Section */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Files
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Transcript Downloads */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Full Transcript
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload('transcript', 'txt')}
                            disabled={downloading === 'transcript-txt'}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {downloading === 'transcript-txt' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                TXT
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDownload('transcript', 'pdf')}
                            disabled={downloading === 'transcript-pdf'}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {downloading === 'transcript-pdf' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Summary Downloads */}
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                          Complete Summary & Actions
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload('summary', 'txt')}
                            disabled={downloading === 'summary-txt'}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {downloading === 'summary-txt' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                TXT
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDownload('summary', 'pdf')}
                            disabled={downloading === 'summary-pdf'}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {downloading === 'summary-pdf' ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                PDF
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Summary & Action Items</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 text-gray-800 shadow-inner animate-fade-in-slide-up max-h-[40vh] overflow-y-auto whitespace-pre-wrap">
                      {selectedTranscript.summary}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Transcript</h3>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-[40vh] overflow-y-auto text-gray-700 whitespace-pre-wrap border border-gray-100 shadow-inner animate-fade-in-slide-up">
                      {selectedTranscript.transcript}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Select a transcript to view details</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0e7ef;
          border-radius: 4px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fade-in-slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in-slide-up {
          animation: fade-in-slide-up 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 