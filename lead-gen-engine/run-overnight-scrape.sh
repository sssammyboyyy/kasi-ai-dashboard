#!/bin/bash
# ===========================================
# OVERNIGHT ICP SCRAPE - Commercial Cleaning
# ===========================================
# Run this script before going to bed.
# Expected duration: 4-8 hours for 2000 leads
# Expected output: ~800-1200 enriched leads with emails
#
# Prerequisites:
# 1. Node.js installed
# 2. npm install completed in lead-gen-suite folder
# 3. Apify account (for Actor runtime)
#
# Usage:
#   chmod +x run-overnight-scrape.sh
#   ./run-overnight-scrape.sh

echo "🌙 KASI AI - OVERNIGHT ICP SCRAPE"
echo "=================================="
echo "Target: Commercial Cleaning businesses in South Africa"
echo "Locations: 20 cities"
echo "Max leads per location: 100"
echo "Total potential: 2000 leads"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the lead-gen-suite directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the actor locally with the overnight config
echo ""
echo "🚀 Starting scrape at $(date)"
echo "💤 Go to sleep! Results will be saved to storage/datasets/default/"
echo ""

# Run with the overnight config
npx apify run --input-file=overnight-icp-scrape.json

echo ""
echo "✅ Scrape completed at $(date)"
echo "📂 Check storage/datasets/default/ for results"
