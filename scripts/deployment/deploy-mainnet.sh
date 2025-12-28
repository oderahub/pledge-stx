#!/bin/bash

# StacksPledge Mainnet Deployment Script
# Deploys contracts to Stacks mainnet
# ⚠️  WARNING: This deploys to MAINNET with real STX!

set -e

echo "🚀 Starting StacksPledge Mainnet Deployment..."
echo "⚠️  WARNING: You are about to deploy to MAINNET!"
echo ""

# Confirmation prompt
read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Check if Clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "❌ Clarinet CLI not found. Please install it first."
    exit 1
fi

# Generate deployment plan
echo "📋 Generating mainnet deployment plan..."
clarinet deployments generate --mainnet

# Check if deployment plan exists
if [ ! -f "deployments/default.mainnet-plan.yaml" ]; then
    echo "❌ Deployment plan not found"
    exit 1
fi

echo "✅ Deployment plan generated"
echo "📄 Review the plan in deployments/default.mainnet-plan.yaml"
echo ""
echo "⚠️  IMPORTANT: Review all contract code and deployment parameters carefully!"
echo ""
echo "To deploy, run:"
echo "clarinet deployments apply -p deployments/default.mainnet-plan.yaml"
