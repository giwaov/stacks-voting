"use client";

import { useState } from "react";

interface SharePollProps {
  pollId: number;
  pollTitle: string;
}

export function SharePoll({ pollId, pollTitle }: SharePollProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://stacks-voting.vercel.app?poll=${pollId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Vote on "${pollTitle}" - Decentralized polling on Stacks!`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollTitle,
          text: `Vote on this poll: ${pollTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
      <span className="text-xs text-gray-500">Share:</span>
      
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        title="Copy link"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      <button
        onClick={shareOnTwitter}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
        title="Share on Twitter"
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {typeof navigator !== "undefined" && navigator.share && (
        <button
          onClick={shareNative}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
          title="Share"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      )}
    </div>
  );
}
