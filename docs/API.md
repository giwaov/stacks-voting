# Stacks Voting API Documentation

## Smart Contract Interface

The voting dApp interacts with the `voting-v2` smart contract deployed on Stacks mainnet.

### Contract Address
```
SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voting-v2
```

## Read-Only Functions

### get-poll
Retrieves poll information by ID.

```clarity
(get-poll (poll-id uint))
```

**Parameters:**
- `poll-id`: The unique identifier of the poll

**Returns:**
```clarity
(response 
  {
    title: (string-utf8 100),
    option-a: (string-utf8 50),
    option-b: (string-utf8 50),
    votes-a: uint,
    votes-b: uint,
    creator: principal,
    active: bool
  } 
  uint)
```

### get-voter
Check if an address has voted on a specific poll.

```clarity
(get-voter (poll-id uint) (voter principal))
```

**Parameters:**
- `poll-id`: The poll identifier
- `voter`: The principal address to check

**Returns:**
```clarity
(response bool uint)
```

### get-poll-count
Returns the total number of polls created.

```clarity
(get-poll-count)
```

**Returns:**
```clarity
uint
```

## Public Functions

### create-poll
Creates a new poll with a title and two options.

```clarity
(create-poll 
  (title (string-utf8 100))
  (option-a (string-utf8 50))
  (option-b (string-utf8 50)))
```

**Parameters:**
- `title`: Poll question/title (max 100 chars)
- `option-a`: First voting option (max 50 chars)
- `option-b`: Second voting option (max 50 chars)

**Returns:**
```clarity
(response uint uint)
```
Returns the new poll ID on success.

### vote
Cast a vote on an existing poll.

```clarity
(vote (poll-id uint) (option uint))
```

**Parameters:**
- `poll-id`: The poll to vote on
- `option`: `1` for option A, `2` for option B

**Returns:**
```clarity
(response bool uint)
```

**Error Codes:**
- `u101`: Poll does not exist
- `u102`: Poll is not active
- `u103`: Already voted on this poll
- `u104`: Invalid option (must be 1 or 2)

### close-poll
Close a poll to prevent further voting (creator only).

```clarity
(close-poll (poll-id uint))
```

**Parameters:**
- `poll-id`: The poll to close

**Returns:**
```clarity
(response bool uint)
```

**Error Codes:**
- `u101`: Poll does not exist
- `u105`: Not the poll creator

## Frontend Integration

### Using @stacks/connect

```typescript
import { openContractCall } from "@stacks/connect";
import { uintCV, stringUtf8CV } from "@stacks/transactions";

// Create a poll
await openContractCall({
  contractAddress: "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY",
  contractName: "voting-v2",
  functionName: "create-poll",
  functionArgs: [
    stringUtf8CV("What's your favorite blockchain?"),
    stringUtf8CV("Stacks"),
    stringUtf8CV("Ethereum"),
  ],
  onFinish: (data) => console.log("TX:", data.txId),
});

// Vote on a poll
await openContractCall({
  contractAddress: "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY",
  contractName: "voting-v2",
  functionName: "vote",
  functionArgs: [uintCV(1), uintCV(1)], // Poll 1, Option A
  onFinish: (data) => console.log("TX:", data.txId),
});
```

### Using @stacks/blockchain-api-client

```typescript
import { Configuration, SmartContractsApi } from "@stacks/blockchain-api-client";

const config = new Configuration({
  basePath: "https://stacks-node-api.mainnet.stacks.co",
});

const api = new SmartContractsApi(config);

// Read poll data
const result = await api.callReadOnlyFunction({
  contractAddress: "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY",
  contractName: "voting-v2",
  functionName: "get-poll",
  readOnlyFunctionArgs: {
    sender: "SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY",
    arguments: ["0x0100000000000000000000000000000001"], // uint 1
  },
});
```

## Rate Limits

The Stacks API has the following rate limits:
- Read-only calls: 500 requests/minute
- Transaction broadcasts: 25 requests/minute

## Network Endpoints

- **Mainnet API**: `https://stacks-node-api.mainnet.stacks.co`
- **Testnet API**: `https://stacks-node-api.testnet.stacks.co`
- **Explorer**: `https://explorer.stacks.co`
