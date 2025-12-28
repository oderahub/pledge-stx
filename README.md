# 🎯 StacksPledge

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Clarity](https://img.shields.io/badge/Clarity-4.0-blue.svg)](https://clarity-lang.org/)
[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-orange.svg)](https://stacks.co/)
[![Builder Challenge](https://img.shields.io/badge/Stacks%20Builder%20Challenge-%233-purple.svg)](https://stacks.co/)

A micro-commitment dApp built on Stacks (Bitcoin L2) for the **Stacks Builder Challenge #3**.

**🏆 Prize Pool:** 12,000 STX
**📅 Deadline:** December 30, 2024

## Features

- ✅ Create pledges with micro-STX fees
- ✅ Community vouching system  
- ✅ Clarity 4 smart contracts (block-time, contract-hash?)
- ✅ Dual wallet support (Stacks Connect + Reown AppKit)
- ✅ SIP-010 reward token

## Quick Start

### Prerequisites

- [Clarinet CLI](https://github.com/hirosystems/clarinet)
- Node.js 18+
- Leather or Xverse Wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stacks-pledge.git
cd stacks-pledge

# Check contracts
clarinet check

# Run tests
clarinet test

# Start frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
stacks-pledge/
├── contracts/
│   ├── stacks-pledge.clar      # Core pledge contract
│   ├── pledge-token.clar       # SIP-010 reward token
│   └── traits/
│       └── pledge-trait.clar   # Contract interfaces
├── frontend/
│   └── src/
│       ├── components/         # React components
│       ├── hooks/              # Custom hooks
│       └── lib/                # Stacks integration
├── tests/                      # Contract tests
├── scripts/                    # Deployment scripts
└── docs/                       # Documentation
```

## Contract Functions

| Function | Fee | Description |
|----------|-----|-------------|
| `create-pledge` | 0.001 STX | Create a new pledge |
| `vouch-for-pledge` | 0.0005 STX | Vouch for someone's pledge |
| `complete-pledge` | 0.0005 STX | Mark your pledge as completed |
| `batch-vouch` | Variable | Vouch for up to 10 pledges |

## Clarity 4 Features

- `block-time` - Timestamp for pledge creation
- `contract-hash?` - Contract verification for composability
- Uses `restrict-assets?` pattern for asset protection

## Deployment

### Testnet

```bash
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/testnet.yaml
```

### Mainnet

```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p deployments/mainnet.yaml
```

## Environment Variables

Create `.env` in frontend/:

```env
VITE_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so
VITE_CONTRACT_ADDRESS=
VITE_CONTRACT_NAME=stacks-pledge
VITE_REOWN_PROJECT_ID=your_project_id_here
VITE_APP_NAME=StacksPledge
VITE_APP_DESCRIPTION=A micro-commitment dApp on Stacks
VITE_APP_URL=https://stackspledge.app
VITE_APP_ICON=https://stackspledge.app/icon.png
```

### Getting a Reown Project ID

1. Go to [Reown Cloud](https://cloud.reown.com)
2. Sign up or log in
3. Create a new project
4. Copy the **Project ID**
5. Paste it into your `.env` file as `VITE_REOWN_PROJECT_ID`

The Bitcoin wallet integration (via Reown AppKit) will only work with a valid project ID.

## Tech Stack

- **Smart Contracts**: Clarity 4 on Stacks
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Wallet**: @stacks/connect + Reown AppKit

## License

MIT License - see [LICENSE](LICENSE)


