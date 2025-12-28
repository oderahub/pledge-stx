#!/bin/bash

# StacksPledge Testnet Deployment Script
# Deploys contracts to Stacks testnet

set -e

echo "🚀 Starting StacksPledge Testnet Deployment..."

# Check if Clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "❌ Clarinet CLI not found. Please install it first."
    exit 1
fi

# Generate deployment plan
echo "📋 Generating deployment plan..."
clarinet deployments generate --testnet

# Check if deployment plan exists
if [ ! -f "deployments/default.testnet-plan.yaml" ]; then
    echo "❌ Deployment plan not found"
    exit 1
fi

echo "✅ Deployment plan generated"
echo "📄 Review the plan in deployments/default.testnet-plan.yaml"
echo ""
echo "To deploy, run:"
echo "clarinet deployments apply -p deployments/default.testnet-plan.yaml"
