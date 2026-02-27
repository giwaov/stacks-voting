# Stacks Voting

On-chain voting and polls on **Stacks** (Bitcoin L2) using `@stacks/connect` and `@stacks/transactions`.

## Features

- Create polls with up to 6 options
- One wallet = one vote (sybil resistant)
- Real-time vote counting on-chain
- Time-based poll expiration

## Tech Stack

- **Smart Contract**: Clarity
- **Frontend**: Next.js 14, React 18, TypeScript
- **Wallet**: `@stacks/connect` v7.7.1
- **Transactions**: `@stacks/transactions` v6.13.0
- **Styling**: Tailwind CSS

## Quick Start

```bash
npm install
npm run dev
```

## Contract Functions

- `create-poll(title, description, options, duration)` - Create a new poll
- `vote(poll-id, option-index)` - Cast a vote
- `get-poll(id)` - Get poll details
- `get-vote-count(poll-id, option-index)` - Get votes for option
- `has-voted(poll-id, voter)` - Check if address voted

## Built For

Stacks Builder Rewards - February 2026
