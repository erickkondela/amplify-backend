# Create Required GitHub Secrets

You need to add these secrets to your backend repo to make the workflow work.

## Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Settings:
   - **Note**: `Backend to Frontend Config Updates`
   - **Expiration**: Choose duration (recommend 90 days or No expiration)
   - **Scopes**: Check **`repo`** (Full control of private repositories)
4. Click **"Generate token"**
5. **Copy the token** (starts with `ghp_...`)

## Step 2: Add Secrets to Backend Repo

Go to: https://github.com/erickkondela/amplify-backend/settings/secrets/actions

Click **"New repository secret"** for each:

### Secret 1: FRONTEND_REPO_TOKEN
```
Name: FRONTEND_REPO_TOKEN
Value: [Your GitHub Token]
```

### Secret 2: AMPLIFY_APP_ID
```
Name: AMPLIFY_APP_ID
Value: [Your Amplify App ID]
```

**How to find it:**
1. Go to: https://console.aws.amazon.com/amplify
2. Click on your app
3. Copy the App ID from the URL or App settings
   - URL format: `.../amplify/home?region=eu-north-1#/d123abc456def/...`
   - The App ID is: `d123abc456def`

### Secret 3: AWS_ACCESS_KEY_ID
```
Name: AWS_ACCESS_KEY_ID
Value: [Your AWS Access Key ID]
```

**How to create:**
1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Click your username → Security credentials
3. Create access key → Command Line Interface (CLI)
4. Copy the Access Key ID

### Secret 4: AWS_SECRET_ACCESS_KEY
```
Name: AWS_SECRET_ACCESS_KEY
Value: [Your AWS Secret Access Key]
```

Use the secret from the same access key creation in step 3.

## Verify Secrets

After adding all secrets, you should see:
- ✅ FRONTEND_REPO_TOKEN
- ✅ AMPLIFY_APP_ID
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY

## Test the Workflow

Once secrets are added:

```bash
# Make a test commit
git add .
git commit -m "test: trigger workflow"
git push origin main

# Watch the action run
# Go to: https://github.com/erickkondela/amplify-backend/actions
```

## Troubleshooting

### "Credentials could not be loaded"
- ✅ Check AWS_ACCESS_KEY_ID is set
- ✅ Check AWS_SECRET_ACCESS_KEY is set
- ✅ Verify the AWS credentials are valid
- ✅ Ensure the IAM user has Amplify permissions

### "Permission denied" when accessing frontend repo
- ✅ Check FRONTEND_REPO_TOKEN is set
- ✅ Verify the token has `repo` scope
- ✅ Ensure token hasn't expired

### "App not found"
- ✅ Check AMPLIFY_APP_ID is correct
- ✅ Verify it's the production app ID (not sandbox)
- ✅ Ensure the app exists in eu-north-1 region
