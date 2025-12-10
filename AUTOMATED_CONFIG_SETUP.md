# Automated Frontend Config Updates

This setup automatically updates your frontend's production Amplify config whenever you deploy backend changes.

## How It Works

1. You push backend changes to `main` branch
2. GitHub Action triggers after push
3. Action generates fresh Amplify outputs
4. Action commits the config to your frontend repo
5. Frontend team pulls changes and runs the app

## Setup Instructions

### Step 1: Create GitHub Secrets (Backend Repo)

Go to your backend repo → Settings → Secrets and variables → Actions

Add these secrets:

1. **`AMPLIFY_APP_ID`**
   - Your Amplify App ID (e.g., `d123abc456def`)
   - Find it in AWS Amplify Console URL or app settings

2. **`FRONTEND_REPO_TOKEN`**
   - Personal Access Token with `repo` scope
   - Create at: https://github.com/settings/tokens
   - Select: `repo` (Full control of private repositories)

3. **`AWS_ACCESS_KEY_ID`** (if not using OIDC)
   - AWS access key with Amplify permissions

4. **`AWS_SECRET_ACCESS_KEY`** (if not using OIDC)
   - AWS secret access key

### Step 2: Update Workflow File

Edit `.github/workflows/update-frontend-config.yml`:

```yaml
repository: YOUR_GITHUB_USERNAME/newtodo  # Line 19
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### Step 3: Configure Frontend Repo

In your **frontend repo** (newtodo):

1. **Ensure config files are tracked**:
   ```bash
   # Make sure these lines are NOT in .gitignore:
   # lib/config/amplify_outputs_dev.dart
   # lib/config/amplify_outputs_prod.dart
   ```

2. **Commit current configs**:
   ```bash
   git add lib/config/amplify_outputs_*.dart
   git commit -m "chore: add Amplify config files"
   git push
   ```

### Step 4: Test the Workflow

1. **Make a backend change**:
   ```bash
   cd amplify-backend
   # Make any change to amplify/data/resource.ts
   git add .
   git commit -m "test: trigger config update"
   git push origin main
   ```

2. **Watch the GitHub Action**:
   - Go to backend repo → Actions tab
   - Watch "Update Frontend Config" workflow run

3. **Pull changes in frontend**:
   ```bash
   cd newtodo
   git pull
   # Config is automatically updated!
   flutter run --dart-define=ENVIRONMENT=prod
   ```

## Workflow Behavior

### When It Runs
- ✅ On every push to `main` branch
- ✅ Manual trigger via Actions tab (workflow_dispatch)

### What It Does
1. Checks out backend repo
2. Checks out frontend repo (using token)
3. Installs dependencies
4. Generates Amplify outputs for production
5. Renames to `amplify_outputs_prod.dart`
6. Commits and pushes to frontend repo
7. Uses `[skip ci]` to prevent infinite loops

## Team Workflow

### Backend Developer
```bash
# 1. Make backend changes
cd amplify-backend
# Edit schema, auth, etc.

# 2. Push to main
git add .
git commit -m "feat: add new field to Todo model"
git push origin main

# 3. Done! GitHub Action handles the rest
```

### Frontend Developer
```bash
# 1. Pull latest changes (includes auto-updated config)
cd newtodo
git pull

# 2. Run in production mode
flutter run --dart-define=ENVIRONMENT=prod

# That's it!
```

## Alternative: AWS OIDC (More Secure)

Instead of using AWS access keys, you can use OIDC:

1. **Setup OIDC in AWS**:
   - Create an OIDC provider for GitHub
   - Create an IAM role with Amplify permissions
   - Trust the GitHub Actions role

2. **Update workflow** to use OIDC:
   ```yaml
   - name: Configure AWS Credentials
     uses: aws-actions/configure-aws-credentials@v4
     with:
       role-to-assume: arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole
       aws-region: eu-north-1
   ```

3. **Remove secrets**:
   - Delete `AWS_ACCESS_KEY_ID`
   - Delete `AWS_SECRET_ACCESS_KEY`

## Troubleshooting

### Action fails with "Permission denied"
- Check `FRONTEND_REPO_TOKEN` has `repo` scope
- Ensure token hasn't expired

### Action fails with "App not found"
- Verify `AMPLIFY_APP_ID` is correct
- Check AWS credentials have Amplify permissions

### Config not updating in frontend
- Check the Action logs in GitHub
- Verify the commit was pushed to frontend repo
- Run `git pull` in frontend repo

### Want to update dev config too?
Add another step in the workflow:
```yaml
- name: Generate dev config
  run: |
    npx ampx generate outputs \
      --app-id ${{ secrets.AMPLIFY_APP_ID }} \
      --branch dev \
      --format dart \
      --out-dir ../frontend/lib/config
    mv ../frontend/lib/config/amplify_outputs.dart \
       ../frontend/lib/config/amplify_outputs_dev.dart
```

## Benefits

✅ **Zero manual work** - Configs update automatically  
✅ **Always in sync** - Frontend always has latest backend config  
✅ **Version controlled** - Config changes are tracked in git  
✅ **Team friendly** - Frontend devs just pull and run  
✅ **No secrets in frontend** - Configs are generated, not hardcoded  

## Security Notes

- Config files contain public endpoints (safe to commit)
- User pool IDs and API URLs are not secrets
- Actual secrets (API keys, passwords) are in AWS, not in config
- Use `.env` files for any app-specific secrets (not Amplify config)
