<div align="center">

# 🗳️ Stacks Voting

**Decentralized on-chain polls and governance on Stacks (Bitcoin L2)**

[![Live on Mainnet](https://img.shields.io/badge/Stacks-Mainnet-brightgreen?logo=bitcoin)](https://explorer.hiro.so/address/SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voting-v2?chain=mainnet)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)

[**🚀 Try Demo**](https://stacks-voting.vercel.app) · [**📜 View Contract**](https://explorer.hiro.so/address/SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voting-v2?chain=mainnet) · [**📖 Docs**](docs/)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🗳️ **Create Polls** | Set up polls with up to 6 options and custom duration |
| 🔐 **Sybil Resistant** | One wallet = one vote, enforced on-chain |
| ⚡ **Real-time Results** | Live vote counting directly from blockchain |
| ⏰ **Time-based Expiry** | Polls automatically close after set duration |
| 🔗 **Fully Decentralized** | All votes stored permanently on Stacks |
| 💼 **Governance Ready** | Use for DAOs, communities, or project decisions |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/giwaov/stacks-voting.git
cd stacks-voting

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view.

## 🛠️ Tech Stack

- **Smart Contract**: [Clarity](https://clarity-lang.org/) on Stacks
- **Frontend**: Next.js 14, React 18, TypeScript
- **Wallet**: `@stacks/connect` v7.7.1
- **Transactions**: `@stacks/transactions` v6.13.0
- **Styling**: Tailwind CSS

## 📜 Smart Contracts (Mainnet)

| Contract | Address | Explorer |
|----------|---------|----------|
| **voting-v2** | `SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voting-v2` | [View →](https://explorer.hiro.so/address/SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voting-v2?chain=mainnet) |
| **poll-analytics** | `SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.poll-analytics` | [View →](https://explorer.hiro.so/address/SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.poll-analytics?chain=mainnet) |
| **voter-reputation** | `SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voter-reputation` | [View →](https://explorer.hiro.so/address/SP3E0DQAHTXJHH5YT9TZCSBW013YXZB25QFDVXXWY.voter-reputation?chain=mainnet) |

**📈 Stats**: 3,900+ votes cast | 88+ unique voters | Live on mainnet

## 📝 Contract Functions

```clarity
;; Create a new poll
(create-poll (title (string-utf8 100)) (description (string-utf8 500)) (options (list 6 (string-utf8 50))) (duration uint))

;; Cast your vote
(vote (poll-id uint) (option-index uint))

;; Read functions
(get-poll (id uint))
(get-vote-count (poll-id uint) (option-index uint))
(has-voted (poll-id uint) (voter principal))
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built for [Stacks Builder Rewards](https://app.talent.xyz) 🏗️**

⭐ Star this repo if you find it useful!

</div>
