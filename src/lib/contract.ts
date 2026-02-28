import { callReadOnlyFunction, cvToValue, uintCV, standardPrincipalCV } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

const CONTRACT_ADDRESS = "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY";
const CONTRACT_NAME = "voting-v2";

export async function getPoll(id: number) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-poll",
    functionArgs: [uintCV(id)],
    network: STACKS_MAINNET,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToValue(result);
}

export async function getPollCount() {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-poll-count",
    functionArgs: [],
    network: STACKS_MAINNET,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToValue(result);
}

export async function hasVoted(pollId: number, voter: string) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "has-voted",
    functionArgs: [uintCV(pollId), standardPrincipalCV(voter)],
    network: STACKS_MAINNET,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToValue(result);
}

export interface Poll {
  question: string;
  votesA: number;
  votesB: number;
  creator: string;
}
