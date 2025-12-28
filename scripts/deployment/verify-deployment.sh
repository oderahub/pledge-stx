#!/bin/bash

# StacksPledge Deployment Verification Script
# Verifies that contracts are properly deployed

set -e

# Configuration
NETWORK="${1:-testnet}"
CONTRACT_ADDRESS="${2}"

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Usage: ./verify-deployment.sh <network> <contract-address>"
    echo "Example: ./verify-deployment.sh testnet ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    exit 1
fi

echo "🔍 Verifying StacksPledge deployment on $NETWORK..."

# Set API URL based on network
if [ "$NETWORK" == "mainnet" ]; then
    API_URL="https://api.mainnet.hiro.so"
else
    API_URL="https://api.testnet.hiro.so"
fi

# Check stacks-pledge contract
echo "Checking stacks-pledge contract..."
RESPONSE=$(curl -s "${API_URL}/v2/contracts/interface/${CONTRACT_ADDRESS}/stacks-pledge")

if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ stacks-pledge contract not found or error occurred"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ stacks-pledge contract verified"

# Check pledge-token contract
echo "Checking pledge-token contract..."
RESPONSE=$(curl -s "${API_URL}/v2/contracts/interface/${CONTRACT_ADDRESS}/pledge-token")

if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ pledge-token contract not found or error occurred"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ pledge-token contract verified"
echo ""
echo "🎉 All contracts successfully deployed and verified!"
