"use client";

import { useMemo } from "react";

interface PollAnalyticsProps {
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  createdAt?: number;
}

export function PollAnalytics({ optionA, optionB, votesA, votesB, createdAt }: PollAnalyticsProps) {
  const analytics = useMemo(() => {
    const total = votesA + votesB;
    const percentA = total > 0 ? (votesA / total) * 100 : 50;
    const percentB = total > 0 ? (votesB / total) * 100 : 50;
    const leadingOption = votesA > votesB ? optionA : votesB > votesA ? optionB : "Tied";
    const margin = Math.abs(votesA - votesB);
    const marginPercent = total > 0 ? (margin / total) * 100 : 0;
    
    // Engagement metrics
    const engagementLevel = total < 5 ? "Low" : total < 20 ? "Moderate" : total < 50 ? "High" : "Viral";
    const isContested = marginPercent < 10;
    
    return {
      total,
      percentA: percentA.toFixed(1),
      percentB: percentB.toFixed(1),
      leadingOption,
      margin,
      marginPercent: marginPercent.toFixed(1),
      engagementLevel,
      isContested,
    };
  }, [optionA, optionB, votesA, votesB]);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "Low": return "text-gray-400";
      case "Moderate": return "text-blue-400";
      case "High": return "text-purple-400";
      case "Viral": return "text-pink-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Poll Analytics
      </h4>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Total Votes</span>
          <p className="text-white font-bold text-lg">{analytics.total}</p>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Engagement</span>
          <p className={`font-semibold ${getEngagementColor(analytics.engagementLevel)}`}>
            {analytics.engagementLevel}
          </p>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Leading</span>
          <p className="text-white font-medium truncate">{analytics.leadingOption}</p>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-gray-500">Margin</span>
          <p className="text-white font-medium">
            {analytics.margin} ({analytics.marginPercent}%)
          </p>
        </div>
      </div>
      
      {analytics.isContested && analytics.total > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400/80">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Closely contested poll!
        </div>
      )}
      
      {/* Vote Distribution Bar */}
      <div className="mt-4">
        <div className="flex text-xs mb-1 justify-between">
          <span className="text-purple-400">{optionA}: {analytics.percentA}%</span>
          <span className="text-pink-400">{optionB}: {analytics.percentB}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden flex bg-gray-800">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
            style={{ width: `${analytics.percentA}%` }}
          />
          <div 
            className="bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-500"
            style={{ width: `${analytics.percentB}%` }}
          />
        </div>
      </div>
    </div>
  );
}
