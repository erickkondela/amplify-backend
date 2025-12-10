#!/bin/bash

# Auto-update frontend config after backend deployment
# Run this after deploying to production

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/.."
FRONTEND_DIR="$BACKEND_DIR/../newtodo"

echo "🔄 Updating frontend production config..."

# Check if we're in the right directory
if [ ! -d "$FRONTEND_DIR" ]; then
  echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
  exit 1
fi

# Get Amplify App ID from environment or parameter
APP_ID="${AMPLIFY_APP_ID:-$1}"

if [ -z "$APP_ID" ]; then
  echo "❌ Error: Amplify App ID required"
  echo "Usage: AMPLIFY_APP_ID=xxx ./scripts/update-frontend-config.sh"
  echo "   or: ./scripts/update-frontend-config.sh YOUR_APP_ID"
  exit 1
fi

echo "📦 Generating config for App ID: $APP_ID"

# Generate production outputs
cd "$BACKEND_DIR"
npx ampx generate outputs \
  --app-id "$APP_ID" \
  --branch main \
  --format dart \
  --out-dir "$FRONTEND_DIR/lib/config"

# Rename to prod config
if [ -f "$FRONTEND_DIR/lib/config/amplify_outputs.dart" ]; then
  mv "$FRONTEND_DIR/lib/config/amplify_outputs.dart" \
     "$FRONTEND_DIR/lib/config/amplify_outputs_prod.dart"
  echo "✅ Production config updated!"
else
  echo "❌ Error: Config file not generated"
  exit 1
fi

# Optional: Auto-commit if in git repo
if [ -d "$FRONTEND_DIR/.git" ]; then
  echo ""
  read -p "📝 Commit changes to git? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$FRONTEND_DIR"
    git add lib/config/amplify_outputs_prod.dart
    git commit -m "chore: update production Amplify config" || echo "No changes to commit"
    echo "✅ Changes committed!"
    echo ""
    echo "Don't forget to push: cd $FRONTEND_DIR && git push"
  fi
fi

echo ""
echo "🎉 Done! Frontend is ready to use production config."
echo "Run: cd $FRONTEND_DIR && flutter run --dart-define=ENVIRONMENT=prod"
