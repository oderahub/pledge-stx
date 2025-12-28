# Deployment Scripts

This directory contains scripts for deploying StacksPledge contracts to Stacks blockchain.

## Available Scripts

- `deploy-testnet.sh` - Deploy to Stacks testnet
- `deploy-mainnet.sh` - Deploy to Stacks mainnet
- `verify-deployment.sh` - Verify contract deployment
- `setup-env.sh` - Set up deployment environment

## Prerequisites

1. Install Clarinet CLI
2. Configure wallet keys
3. Fund deployment wallet with STX

## Usage

### Quick Start

```bash
# 1. Setup environment
./setup-env.sh

# 2. Configure your mnemonic in settings/Mainnet.toml

# 3. Generate deployment plan (mainnet)
clarinet deployments generate --mainnet

# 4. Review the plan in deployments/default.mainnet-plan.yaml

# 5. Deploy
clarinet deployments apply -p deployments/default.mainnet-plan.yaml

# 6. Verify
./verify-deployment.sh mainnet <YOUR_ADDRESS>
```

See individual script files for detailed instructions.
