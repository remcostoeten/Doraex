#!/bin/bash

# Database Viewer Initialization Script
echo "🚀 Initializing Database Viewer..."

if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

if ! command -v bun &> /dev/null; then
  echo "🔧 Installing Bun..."
  curl -fsSL https://bun.sh/install | bash

  # Update PATH for current shell session
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"

  echo "✅ Bun installed!"
fi

echo "✅ Bun found"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

if [ ! -f "sample.db" ]; then
    echo "📊 Creating sample SQLite database..."
    sqlite3 sample.db < sample-data.sql
    if [ $? -eq 0 ]; then
        echo "✅ Sample database created at ./sample.db"
    else
        echo "⚠️  Could not create sample database (sqlite3 not found?)"
        echo "   You can still use the application with your own databases"
    fi
fi

echo ""
echo "🎉 Database Viewer is ready!"
echo ""
echo "To start the application:"
echo "   bun run dev"
echo ""
echo "Then open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "Sample database location:"
echo "   ./sample.db"
echo ""
echo "For help, see the README.md file."


