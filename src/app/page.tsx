"use client";

import { useState, useEffect, useCallback } from "react";
import { AppConfig, UserSession, showConnect, openContractCall } from "@stacks/connect";
import { StacksTestnet } from "@stacks/network";
import {
  uintCV,
  stringUtf8CV,
  listCV,
  callReadOnlyFunction,
  cvToJSON,
  PostConditionMode,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const CONTRACT_NAME = "voting";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet();

interface Poll {
  id: number;
  creator: string;
  title: string;
  description: string;
  options: string[];
  endBlock: number;
  totalVotes: number;
  votes: number[];
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"polls" | "create">("polls");
  
  // Create poll form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("1000");

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setIsConnected(true);
      setAddress(data.profile.stxAddress.testnet);
    }
  }, []);

  const connect = () => {
    showConnect({
      appDetails: { name: "Stacks Voting", icon: "/logo.png" },
      onFinish: () => {
        const data = userSession.loadUserData();
        setIsConnected(true);
        setAddress(data.profile.stxAddress.testnet);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setAddress(null);
  };

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      const countResult = await callReadOnlyFunction({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-poll-count",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });
      
      const count = parseInt(cvToJSON(countResult).value);
      const pollList: Poll[] = [];
      
      for (let i = 0; i < count; i++) {
        const pollResult = await callReadOnlyFunction({
          network,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "get-poll",
          functionArgs: [uintCV(i)],
          senderAddress: CONTRACT_ADDRESS,
        });
        
        const json = cvToJSON(pollResult);
        if (json.value) {
          const p = json.value.value;
          const opts = p.options.value.map((o: any) => o.value);
          
          // Fetch votes for each option
          const votes: number[] = [];
          for (let j = 0; j < opts.length; j++) {
            const voteResult = await callReadOnlyFunction({
              network,
              contractAddress: CONTRACT_ADDRESS,
              contractName: CONTRACT_NAME,
              functionName: "get-vote-count",
              functionArgs: [uintCV(i), uintCV(j)],
              senderAddress: CONTRACT_ADDRESS,
            });
            votes.push(parseInt(cvToJSON(voteResult).value.value.count.value));
          }
          
          pollList.push({
            id: i,
            creator: p.creator.value,
            title: p.title.value,
            description: p.description.value,
            options: opts,
            endBlock: parseInt(p["end-block"].value),
            totalVotes: parseInt(p["total-votes"].value),
            votes,
          });
        }
      }
      
      setPolls(pollList.reverse());
    } catch (e) {
      console.error("Error fetching polls:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const createPoll = async () => {
    if (!isConnected) return;
    
    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      alert("Need at least 2 options");
      return;
    }
    
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "create-poll",
        functionArgs: [
          stringUtf8CV(title),
          stringUtf8CV(description),
          listCV(validOptions.map(o => stringUtf8CV(o))),
          uintCV(parseInt(duration)),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => {
          setTitle("");
          setDescription("");
          setOptions(["", ""]);
          setActiveTab("polls");
          setTimeout(fetchPolls, 3000);
        },
      });
    } catch (e) {
      console.error("Error creating poll:", e);
    }
  };

  const castVote = async (pollId: number, optionIndex: number) => {
    if (!isConnected) return;
    
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "vote",
        functionArgs: [uintCV(pollId), uintCV(optionIndex)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: () => setTimeout(fetchPolls, 3000),
      });
    } catch (e) {
      console.error("Error voting:", e);
    }
  };

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getPercentage = (votes: number, total: number) => 
    total === 0 ? 0 : Math.round((votes / total) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">🗳️ Stacks Voting</h1>
            <p className="text-purple-300">On-chain polls & governance</p>
          </div>
          {isConnected ? (
            <div className="text-right">
              <p className="text-sm text-purple-300">{truncate(address!)}</p>
              <button onClick={disconnect} className="text-sm underline">Disconnect</button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("polls")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "polls" ? "bg-purple-500" : "bg-purple-800/50"
            }`}
          >
            Active Polls
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-2 rounded-lg font-medium ${
              activeTab === "create" ? "bg-purple-500" : "bg-purple-800/50"
            }`}
          >
            Create Poll
          </button>
          <button onClick={fetchPolls} className="ml-auto px-4 py-2 rounded-lg border border-purple-500">
            🔄 Refresh
          </button>
        </div>

        {/* Polls List */}
        {activeTab === "polls" && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-8 text-purple-300">Loading polls...</p>
            ) : polls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-purple-300 mb-4">No polls yet</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="text-purple-400 underline"
                >
                  Create the first poll →
                </button>
              </div>
            ) : (
              polls.map((poll) => (
                <div key={poll.id} className="bg-purple-800/20 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{poll.title}</h3>
                      <p className="text-purple-300 text-sm">{poll.description}</p>
                    </div>
                    <span className="text-sm px-2 py-1 rounded bg-purple-700/50">
                      {poll.totalVotes} votes
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {poll.options.map((option, idx) => {
                      const pct = getPercentage(poll.votes[idx], poll.totalVotes);
                      return (
                        <div key={idx} className="relative">
                          <div
                            className="absolute inset-0 bg-purple-600/30 rounded-lg"
                            style={{ width: `${pct}%` }}
                          />
                          <button
                            onClick={() => castVote(poll.id, idx)}
                            disabled={!isConnected}
                            className="relative w-full text-left px-4 py-3 rounded-lg border border-purple-600 hover:border-purple-400 disabled:opacity-50"
                          >
                            <span className="font-medium">{option}</span>
                            <span className="float-right">
                              {poll.votes[idx]} ({pct}%)
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="mt-4 text-xs text-purple-400">
                    Created by {truncate(poll.creator)} • Ends at block {poll.endBlock}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Poll Form */}
        {activeTab === "create" && (
          <div className="bg-purple-800/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Create New Poll</h2>
            
            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-purple-300 mb-4">Connect wallet to create polls</p>
                <button
                  onClick={connect}
                  className="bg-purple-500 px-6 py-2 rounded-lg"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Poll Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-600"
                    placeholder="What's your question?"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-600"
                    placeholder="Add more context..."
                    maxLength={500}
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Options</label>
                  {options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-600 mb-2"
                      placeholder={`Option ${idx + 1}`}
                      maxLength={100}
                    />
                  ))}
                  {options.length < 6 && (
                    <button
                      onClick={() => setOptions([...options, ""])}
                      className="text-purple-400 text-sm"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Duration (blocks)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-600"
                  />
                  <p className="text-xs text-purple-400 mt-1">~1000 blocks ≈ 1 week</p>
                </div>
                
                <button
                  onClick={createPoll}
                  className="w-full bg-purple-500 hover:bg-purple-600 py-3 rounded-lg font-semibold"
                >
                  Create Poll
                </button>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-purple-400 text-sm">
          <p>Built with @stacks/connect & @stacks/transactions</p>
          <p>Stacks Builder Rewards February 2026</p>
        </footer>
      </div>
    </main>
  );
}
