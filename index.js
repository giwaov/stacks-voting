// @giwaov/stacks-voting - Stacks Voting SDK
const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV } = require('@stacks/transactions');

const VOTING_CONTRACT = {
  address: 'SP33C21DH86NQ56RYYY69CGD1146H4E5NHNM32W5P',
  name: 'voting-v5'
};

async function vote(pollId, optionId, senderKey, network) {
  const tx = await makeContractCall({
    contractAddress: VOTING_CONTRACT.address,
    contractName: VOTING_CONTRACT.name,
    functionName: 'vote',
    functionArgs: [uintCV(pollId), uintCV(optionId)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 1500
  });
  return broadcastTransaction(tx, network);
}

async function createPoll(title, options, senderKey, network) {
  const tx = await makeContractCall({
    contractAddress: VOTING_CONTRACT.address,
    contractName: VOTING_CONTRACT.name,
    functionName: 'create-poll',
    functionArgs: [/* poll args */],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 2000
  });
  return broadcastTransaction(tx, network);
}

module.exports = { vote, createPoll, VOTING_CONTRACT };
