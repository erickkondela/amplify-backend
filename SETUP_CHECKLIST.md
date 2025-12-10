# Setup Checklist - Automated Config Updates

Follow these steps to enable automatic frontend config updates.

## ✅ Prerequisites

- [ ] Backend repo on GitHub
- [ ] Frontend repo on GitHub (separate repo)
- [ ] AWS account with Amplify app deployed
- [ ] GitHub account with admin access to both repos

## 📋 Setup Steps

### 1. Get Required Information

Gather these before starting:

- [ ] **Amplify App ID**
  - Location: AWS Amplify Console → Your App → App settings
  - Format: `d123abc456def`
  - Example: `d2a3b4c5d6e7f`

- [ ] **Frontend Repo Full Name**
  - Format: `YOUR_USERNAME/newtodo`
  - Example: `johndoe/newtodo`

- [ ] **AWS Credentials**
  - Access Key ID
  - Secret Access Key
  - Or setup OIDC (more secure)

### 2. Create GitHub Personal Access Token

- [ ] Go to: https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Name: `Backend to Frontend Config Updates`
- [ ] Expiration: Choose duration (recommend 90 days or No expiration for automation)
- [ ] Scopes: Check **`repo`** (Full control of private repositories)
- [ ] Click "Generate token"
- [ ] **Copy the token** (you won't see it again!)

### 3. Add Secrets to Backend Repo

Go to: `https://github.com/YOUR_USERNAME/amplify-backend/settings/secrets/actions`

Add these secrets:

- [ ] **`AMPLIFY_APP_ID`**
  ```
  Value: d123abc456def  (your actual App ID)
  ```

- [ ] **`FRONTEND_REPO_TOKEN`**
  ```
  Value: ghp_xxxxxxxxxxxxxxxxxxxx  (token from step 2)
  ```

- [ ] **`AWS_ACCESS_KEY_ID`**
  ```
  Value: AKIAIOSFODNN7EXAMPLE
  ```

- [ ] **`AWS_SECRET_ACCESS_KEY`**
  ```
  Value: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  ```

### 4. Update Workflow File

- [ ] Open: `.github/workflows/update-frontend-config.yml`
- [ ] Find line 22: `repository: YOUR_USERNAME/newtodo`
- [ ] Replace `YOUR_USERNAME` with your actual GitHub username
- [ ] Save and commit:
  ```bash
  git add .github/workflows/update-frontend-config.yml
  git commit -m "chore: configure automated frontend config updates"
  git push origin main
  ```

### 5. Prepare Frontend Repo

In your frontend repo:

- [ ] Ensure config files exist:
  ```bash
  ls -la lib/config/amplify_outputs_*.dart
  ```

- [ ] Make sure they're NOT in `.gitignore`:
  ```bash
  # Check .gitignore doesn't have these uncommented:
  # lib/config/amplify_outputs_dev.dart
  # lib/config/amplify_outputs_prod.dart
  ```

- [ ] Commit current configs:
  ```bash
  git add lib/config/amplify_outputs_*.dart
  git commit -m "chore: track Amplify config files"
  git push
  ```

### 6. Test the Automation

- [ ] Make a test change in backend:
  ```bash
  cd amplify-backend
  echo "# Test" >> README.md
  git add README.md
  git commit -m "test: trigger config update"
  git push origin main
  ```

- [ ] Watch GitHub Action:
  - Go to: `https://github.com/YOUR_USERNAME/amplify-backend/actions`
  - Click on "Update Frontend Config" workflow
  - Verify it completes successfully

- [ ] Check frontend repo:
  - Go to: `https://github.com/YOUR_USERNAME/newtodo/commits/main`
  - Look for commit: "chore: update production Amplify config [skip ci]"

- [ ] Pull and test:
  ```bash
  cd newtodo
  git pull
  flutter run --dart-define=ENVIRONMENT=prod
  ```

## ✅ Verification

After setup, verify everything works:

- [ ] GitHub Action runs on push to main
- [ ] Action completes without errors
- [ ] Frontend repo receives automatic commit
- [ ] Config file is updated correctly
- [ ] Flutter app runs with production config

## 🔧 Troubleshooting

### Action fails with "Permission denied"
- Check `FRONTEND_REPO_TOKEN` is correct
- Verify token has `repo` scope
- Ensure token hasn't expired

### Action fails with "App not found"
- Verify `AMPLIFY_APP_ID` is correct
- Check it matches your production app (not sandbox)

### Config not updating
- Check Action logs for errors
- Verify AWS credentials are valid
- Ensure Amplify app is deployed to `main` branch

### Frontend doesn't see changes
- Run `git pull` in frontend repo
- Check the commit was actually pushed
- Verify file path is correct

## 📚 Next Steps

Once setup is complete:

1. **Normal workflow:**
   - Backend dev pushes to main
   - Action auto-updates frontend config
   - Frontend dev pulls and runs

2. **Monitor:**
   - Check Action runs in GitHub
   - Review commits in frontend repo

3. **Maintain:**
   - Rotate GitHub token before expiration
   - Update AWS credentials if needed

## 🎉 Success!

If all checkboxes are checked, your automation is ready!

Backend changes will automatically update frontend configs. 🚀
