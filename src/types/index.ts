export interface Poll {
  creator: string;
  question: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  active: boolean;
  endBlock: number;
}

export interface VoteRecord {
  voter: string;
  pollId: number;
  option: 'A' | 'B';
}

export interface VotingStats {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
}

export interface WalletState {
  address: string | null;
  connected: boolean;
  balance: number;
}

export interface TransactionResult {
  txId: string;
  success: boolean;
  error?: string;
}
