"use client";

import { useState, useEffect, useCallback } from "react";
import { AppConfig, UserSession, showConnect, openContractCall } from "@stacks/connect";
import { StacksMainnet } from "@stacks/network";
import {
  uintCV,
  stringUtf8CV,
  callReadOnlyFunction,
  cvToJSON,
  PostConditionMode,
} from "@stacks/transactions";
import { motion, AnimatePresence } from "framer-motion";

const CONTRACT_ADDRESS = "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY";
const CONTRACT_NAME = "voting-v2";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet();

interface Poll {
  id: number;
  title: string;
  votesA: number;
  votesB: number;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"polls" | "create">("polls");
  const [newPollTitle, setNewPollTitle] = useState("");
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData();
      setIsConnected(true);
      setAddress(data.profile.stxAddress.mainnet);
    }
    fetchPolls();
  }, []);

  const connect = () => {
    showConnect({
      appDetails: { 
        name: "Stacks Voting", 
        icon: "https://stacks-voting.vercel.app/logo.png" 
      },
      onFinish: () => {
        const data = userSession.loadUserData();
        setIsConnected(true);
        setAddress(data.profile.stxAddress.mainnet);
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
        try {
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
            pollList.push({
              id: i,
              title: p.title?.value || `Poll #${i}`,
              votesA: parseInt(p["votes-a"]?.value || "0"),
              votesB: parseInt(p["votes-b"]?.value || "0"),
            });
          }
        } catch (e) {
          console.error(`Error fetching poll ${i}:`, e);
        }
      }
      
      setPolls(pollList.reverse());
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPoll = async () => {
    if (!newPollTitle.trim() || !isConnected) return;
    
    setCreating(true);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "create-poll",
        functionArgs: [stringUtf8CV(newPollTitle)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log("Poll created:", data);
          setNewPollTitle("");
          setActiveTab("polls");
          setTimeout(fetchPolls, 3000);
        },
        onCancel: () => setCreating(false),
      });
    } catch (error) {
      console.error("Error creating poll:", error);
    } finally {
      setCreating(false);
    }
  };

  const vote = async (pollId: number, option: "a" | "b") => {
    if (!isConnected) return;
    
    setVotingFor(pollId);
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: option === "a" ? "vote-a" : "vote-b",
        functionArgs: [uintCV(pollId)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log("Vote cast:", data);
          setTimeout(fetchPolls, 3000);
        },
        onCancel: () => setVotingFor(null),
      });
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setVotingFor(null);
    }
  };

  const getTotalVotes = (poll: Poll) => poll.votesA + poll.votesB;
  const getPercentage = (votes: number, total: number) => 
    total > 0 ? Math.round((votes / total) * 100) : 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Stacks Voting</h1>
              <p className="text-xs text-gray-400">Decentralized Polls on Bitcoin</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-400">Connected</p>
                  <p className="text-sm text-white font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-medium text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Connect Wallet
              </button>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Total Polls</p>
            <p className="text-3xl font-bold text-white">{polls.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Total Votes</p>
            <p className="text-3xl font-bold text-white">
              {polls.reduce((acc, p) => acc + getTotalVotes(p), 0)}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm">Network</p>
            <p className="text-lg font-bold text-green-400">Mainnet</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab("polls")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "polls"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            View Polls
          </button>
          <button
            onClick={() => setActiveTab("create")}
            disabled={!isConnected}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "create"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            Create Poll
          </button>
          <button
            onClick={fetchPolls}
            disabled={loading}
            className="ml-auto px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "polls" ? (
            <motion.div
              key="polls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {loading && polls.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading polls...</p>
                </div>
              ) : polls.length === 0 ? (
                <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-400 text-lg mb-2">No polls yet</p>
                  <p className="text-gray-500">Be the first to create a poll!</p>
                </div>
              ) : (
                polls.map((poll, index) => {
                  const total = getTotalVotes(poll);
                  const percentA = getPercentage(poll.votesA, total);
                  const percentB = getPercentage(poll.votesB, total);
                  
                  return (
                    <motion.div
                      key={poll.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs text-purple-400 font-medium">Poll #{poll.id}</span>
                          <h3 className="text-xl font-semibold text-white mt-1">{poll.title}</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                          {total} vote{total !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Vote Bars */}
                      <div className="space-y-3 mb-4">
                        <div className="group/option">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 font-medium">Option A</span>
                            <span className="text-purple-400">{percentA}% ({poll.votesA})</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentA}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="group/option">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 font-medium">Option B</span>
                            <span className="text-pink-400">{percentB}% ({poll.votesB})</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentB}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vote Buttons */}
                      {isConnected && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => vote(poll.id, "a")}
                            disabled={votingFor === poll.id}
                            className="flex-1 py-3 rounded-xl bg-purple-500/20 text-purple-400 font-medium hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {votingFor === poll.id ? "Voting..." : "Vote A"}
                          </button>
                          <button
                            onClick={() => vote(poll.id, "b")}
                            disabled={votingFor === poll.id}
                            className="flex-1 py-3 rounded-xl bg-pink-500/20 text-pink-400 font-medium hover:bg-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {votingFor === poll.id ? "Voting..." : "Vote B"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Create a New Poll</h2>
              <p className="text-gray-400 mb-6">Ask your community a question with two options.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Poll Question</label>
                  <input
                    type="text"
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    placeholder="e.g., Bitcoin or Ethereum?"
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">{newPollTitle.length}/100 characters</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-purple-400 font-medium">Option A</p>
                    <p className="text-gray-400 text-sm">First choice</p>
                  </div>
                  <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    <p className="text-pink-400 font-medium">Option B</p>
                    <p className="text-gray-400 text-sm">Second choice</p>
                  </div>
                </div>

                <button
                  onClick={createPoll}
                  disabled={!newPollTitle.trim() || creating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Poll...
                    </span>
                  ) : (
                    "Create Poll"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 mt-8"
        >
          <p className="text-gray-500 text-sm">
            Powered by{" "}
            <a href="https://stacks.co" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              Stacks
            </a>
            {" "}&amp; Bitcoin
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Contract: {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_NAME}
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
