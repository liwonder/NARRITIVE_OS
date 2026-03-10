#!/bin/bash
# Narrative OS Publish Script
# Publishes both engine and CLI packages to npm

set -e

echo "🚀 Narrative OS Publisher"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if logged in to npm
echo "🔍 Checking npm login status..."
if ! npm whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to npm${NC}"
    echo "Run: npm login"
    exit 1
fi

echo -e "${GREEN}✅ Logged in as: $(npm whoami)${NC}"
echo ""

# Get version bump type
if [ -z "$1" ]; then
    echo "Usage: ./publish.sh [patch|minor|major]"
    echo ""
    echo "Examples:"
    echo "  ./publish.sh patch   # 0.1.0 → 0.1.1"
    echo "  ./publish.sh minor   # 0.1.0 → 0.2.0"
    echo "  ./publish.sh major   # 0.1.0 → 1.0.0"
    exit 1
fi

VERSION_TYPE=$1

# Confirm
echo -e "${YELLOW}⚠️  This will:${NC}"
echo "  1. Build the project"
echo "  2. Bump version ($VERSION_TYPE)"
echo "  3. Publish @narrative-os/engine"
echo "  4. Publish @narrative-os/cli"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${CYAN}📦 Building project...${NC}"
pnpm build

echo ""
echo -e "${CYAN}📦 Publishing Engine...${NC}"
cd packages/engine

# Bump version
npm version $VERSION_TYPE --no-git-tag-version

# Publish
npm publish --access public

ENGINE_VERSION=$(cat package.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
echo -e "${GREEN}✅ Engine published: v$ENGINE_VERSION${NC}"

cd ../..

echo ""
echo -e "${CYAN}📦 Publishing CLI...${NC}"
cd apps/cli

# Update engine dependency version
sed -i.bak "s/\"@narrative-os\/engine\": \"[0-9.]*\"/\"@narrative-os\/engine\": \"$ENGINE_VERSION\"/" package.json
rm package.json.bak

# Bump version
npm version $VERSION_TYPE --no-git-tag-version

# Publish
npm publish --access public

CLI_VERSION=$(cat package.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')
echo -e "${GREEN}✅ CLI published: v$CLI_VERSION${NC}"

cd ../..

echo ""
echo -e "${GREEN}🎉 All packages published successfully!${NC}"
echo ""
echo "Users can now install with:"
echo "  npm install -g @narrative-os/cli"
echo ""
