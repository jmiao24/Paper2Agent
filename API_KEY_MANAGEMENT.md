# 🔐 API Key Management Guide
### Securely Integrate Multiple Providers with NerdCabalMCP

```
 █████╗ ██████╗ ██╗    ██╗  ██╗███████╗██╗   ██╗███████╗
██╔══██╗██╔══██╗██║    ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝
███████║██████╔╝██║    █████╔╝ █████╗   ╚████╔╝ ███████╗
██╔══██║██╔═══╝ ██║    ██╔═██╗ ██╔══╝    ╚██╔╝  ╚════██║
██║  ██║██║     ██║    ██║  ██╗███████╗   ██║   ███████║
╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝
```

> **A comprehensive guide to securely managing API keys for all major AI, development, and creative platforms integrated with NerdCabalMCP.**

---

## 📚 Table of Contents

- [Overview](#overview)
- [Security Best Practices](#security-best-practices)
- [Environment Configuration](#environment-configuration)
- [Provider-Specific Setup](#provider-specific-setup)
  - [LLM Providers](#llm-providers)
  - [Development Platforms](#development-platforms)
  - [Creative Tools](#creative-tools)
  - [ML & Data Platforms](#ml--data-platforms)
  - [Infrastructure](#infrastructure)
- [Secret Management Systems](#secret-management-systems)
- [API Key Rotation](#api-key-rotation)
- [Team Management](#team-management)
- [Troubleshooting](#troubleshooting)

---

## 🔎 Overview

NerdCabalMCP integrates with 20+ external services, each requiring API authentication. This guide shows you how to:

1. **Securely store** API keys and secrets
2. **Configure** NerdCabalMCP to use multiple providers
3. **Rotate keys** regularly for security
4. **Share access** with team members safely
5. **Monitor usage** and prevent leaks

---

## 🛡️ Security Best Practices

### **The Golden Rules**

1. ✅ **NEVER commit API keys to version control**
2. ✅ **Use environment variables or secret managers**
3. ✅ **Rotate keys every 90 days**
4. ✅ **Use least-privilege access (scoped keys)**
5. ✅ **Monitor for unauthorized usage**
6. ❌ **NEVER share keys in chat, email, or screenshots**
7. ❌ **NEVER hardcode keys in source files**

---

### **Checking for Leaked Keys**

Before you start, ensure you haven't accidentally committed keys:

```bash
# Check git history for potential secrets
git log -p | grep -i "api.*key\|secret\|token" | head -20

# Use gitleaks to scan for secrets
docker run -v $(pwd):/repo zricethezav/gitleaks:latest detect --source /repo

# Use TruffleHog
trufflehog git file://. --only-verified
```

**If you find leaked keys**:
1. Immediately revoke them in the provider dashboard
2. Generate new keys
3. Use `git filter-branch` or BFG Repo-Cleaner to remove from history
4. Force push (if private repo) or contact support (if public)

---

### **Access Control Levels**

| Level | Use Case | Example |
|-------|----------|---------|
| **Read-Only** | Fetching data, monitoring | GitHub repo read, HuggingFace model download |
| **Read-Write** | Creating/updating resources | Creating GitHub issues, uploading datasets |
| **Admin** | Full control, billing | Organization settings, key rotation |

**Principle**: Always use the **minimum required** permission level.

---

## ⚙️ Environment Configuration

### **Method 1: .env File (Recommended for Local Development)**

Create a `.env` file in the project root:

```bash
# /home/user/NerdCabalMCP/.env

# ==============================================================================
# LLM PROVIDERS
# ==============================================================================

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI (GPT-4, DALL-E)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google (Gemini)
GOOGLE_API_KEY=AIzaXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Cohere
COHERE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Mistral AI
MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Together AI
TOGETHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Replicate
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==============================================================================
# DEVELOPMENT PLATFORMS
# ==============================================================================

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Replit
REPLIT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Railway
RAILWAY_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==============================================================================
# CREATIVE TOOLS
# ==============================================================================

# Figma
FIGMA_ACCESS_TOKEN=figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Canva
CANVA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==============================================================================
# ML & DATA PLATFORMS
# ==============================================================================

# HuggingFace
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Kaggle
KAGGLE_USERNAME=your_username
KAGGLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Weights & Biases
WANDB_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MLflow
MLFLOW_TRACKING_URI=https://your-mlflow-server.com
MLFLOW_TRACKING_USERNAME=admin
MLFLOW_TRACKING_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# FiftyOne
FIFTYONE_DATABASE_URI=mongodb://localhost:27017

# ==============================================================================
# INFRASTRUCTURE
# ==============================================================================

# Cloudflare
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_DEFAULT_REGION=us-east-1

# Google Cloud
GCP_PROJECT_ID=your-project-id

# ==============================================================================
# MISCELLANEOUS
# ==============================================================================

# Slack
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Discord
DISCORD_BOT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Brave Search
BRAVE_SEARCH_API_KEY=BSAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Secure the .env file**:

```bash
# Make sure .env is in .gitignore
echo ".env" >> .gitignore

# Set restrictive permissions (Unix/Linux/macOS)
chmod 600 .env

# Verify it's not tracked
git status | grep .env  # Should not appear
```

---

### **Method 2: Environment Variables (Recommended for Production)**

Set environment variables at the system level:

#### **macOS/Linux**

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export HUGGINGFACE_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

#### **Windows (PowerShell)**

```powershell
# User-level environment variable
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-api03-xxx', 'User')

# Or edit via GUI: System Properties > Environment Variables
```

#### **Docker**

```yaml
# docker-compose.yml
version: '3.8'
services:
  nerdcabal:
    image: nerdcabal-mcp:latest
    env_file:
      - .env
    # Or individual variables
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

---

### **Method 3: Secret Management Systems (Recommended for Teams)**

See [Secret Management Systems](#secret-management-systems) section below.

---

## 🔌 Provider-Specific Setup

### **LLM Providers**

#### **Anthropic (Claude)**

**Get API Key**:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to "API Keys"
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-api03-`)

**Environment Variables**:
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```bash
# Test with curl
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

**Usage Monitoring**:
- Dashboard: [console.anthropic.com/settings/usage](https://console.anthropic.com/settings/usage)
- Set spending limits in Settings > Billing

---

#### **OpenAI (GPT-4, DALL-E)**

**Get API Key**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-` or `sk-`)

**Environment Variables**:
```bash
export OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```python
from openai import OpenAI

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

**Usage Monitoring**:
- Dashboard: [platform.openai.com/usage](https://platform.openai.com/usage)

---

#### **Google (Gemini)**

**Get API Key**:
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza`)

**Environment Variables**:
```bash
export GOOGLE_API_KEY="AIzaXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx"
```

**Testing**:
```python
import google.generativeai as genai

genai.configure(api_key=os.environ['GOOGLE_API_KEY'])
model = genai.GenerativeModel('gemini-1.5-pro')
response = model.generate_content("Hello!")
print(response.text)
```

---

#### **Cohere, Mistral, Together, Replicate**

Similar process for each:
1. Create account on provider website
2. Generate API key in dashboard
3. Set environment variable
4. Test with provider's SDK

**Quick Reference**:
```bash
# Cohere
export COHERE_API_KEY="..."
# https://dashboard.cohere.com/api-keys

# Mistral
export MISTRAL_API_KEY="..."
# https://console.mistral.ai

# Together AI
export TOGETHER_API_KEY="..."
# https://api.together.xyz/settings/api-keys

# Replicate
export REPLICATE_API_TOKEN="r8_..."
# https://replicate.com/account/api-tokens
```

---

### **Development Platforms**

#### **GitHub**

**Get Personal Access Token (PAT)**:
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)" or "Fine-grained token"
3. Select scopes:
   - `repo` (for private repos)
   - `read:org` (for organization access)
   - `workflow` (for GitHub Actions)
4. Copy the token (starts with `ghp_` or `github_pat_`)

**Environment Variables**:
```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```bash
# Test with GitHub CLI
gh auth status

# Or with curl
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

**MCP Server Configuration**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

---

#### **Replit**

**Get API Token**:
1. Go to [replit.com/account](https://replit.com/account)
2. Scroll to "API Token"
3. Click "Generate" or "Reveal"
4. Copy the token

**Environment Variables**:
```bash
export REPLIT_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

#### **Vercel**

**Get Token**:
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it and set scope
4. Copy the token

**Environment Variables**:
```bash
export VERCEL_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login with token
vercel login --token $VERCEL_TOKEN

# Test
vercel whoami
```

---

### **Creative Tools**

#### **Figma**

**Get Access Token**:
1. Go to [figma.com/developers/apps](https://www.figma.com/developers/apps)
2. Create a new app or use existing
3. Generate a Personal Access Token
4. Copy the token (starts with `figd_`)

**Environment Variables**:
```bash
export FIGMA_ACCESS_TOKEN="figd_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```bash
# Get user info
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" https://api.figma.com/v1/me
```

**Usage with NerdCabal Creative Director**:
```json
{
  "tool": "creative-director",
  "style": "cyberpunk-brutalist-bauhaus",
  "export_to_figma": true,
  "figma_token": "${FIGMA_ACCESS_TOKEN}"
}
```

---

#### **Canva**

**Get API Key**:
1. Go to [canva.dev/docs/apps/](https://www.canva.dev/docs/apps/)
2. Create an app
3. Get API credentials
4. Copy the API key

**Environment Variables**:
```bash
export CANVA_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export CANVA_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export CANVA_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

### **ML & Data Platforms**

#### **HuggingFace**

**Get Token**:
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Select permissions (read or write)
4. Copy the token (starts with `hf_`)

**Environment Variables**:
```bash
export HUGGINGFACE_TOKEN="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```bash
# Login via CLI
huggingface-cli login

# Or programmatically
python -c "from huggingface_hub import HfApi; api = HfApi(token='$HUGGINGFACE_TOKEN'); print(api.whoami())"
```

**Usage with NerdCabal Dataset Builder**:
```json
{
  "tool": "dataset-builder",
  "dataset_type": "SFT",
  "upload_to_huggingface": true,
  "hf_token": "${HUGGINGFACE_TOKEN}",
  "hf_repo": "username/dataset-name"
}
```

---

#### **Kaggle**

**Get API Credentials**:
1. Go to [kaggle.com/settings](https://www.kaggle.com/settings)
2. Scroll to "API" section
3. Click "Create New API Token"
4. Download `kaggle.json`

**Setup**:
```bash
# Place kaggle.json in the right location
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Or set environment variables
export KAGGLE_USERNAME="your_username"
export KAGGLE_KEY="your_api_key"
```

**Testing**:
```bash
# Install Kaggle CLI
pip install kaggle

# Test
kaggle datasets list
```

---

#### **Weights & Biases (wandb)**

**Get API Key**:
1. Go to [wandb.ai/authorize](https://wandb.ai/authorize)
2. Copy your API key

**Environment Variables**:
```bash
export WANDB_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Testing**:
```bash
# Login
wandb login

# Or programmatically
python -c "import wandb; wandb.login(key='$WANDB_API_KEY')"
```

---

#### **MLflow**

**Self-Hosted Setup**:
```bash
# Start MLflow server
mlflow server \
  --backend-store-uri sqlite:///mlflow.db \
  --default-artifact-root ./mlruns \
  --host 0.0.0.0 \
  --port 5000

# Set tracking URI
export MLFLOW_TRACKING_URI="http://localhost:5000"
```

**With Authentication**:
```bash
export MLFLOW_TRACKING_USERNAME="admin"
export MLFLOW_TRACKING_PASSWORD="your_password"
```

**Testing**:
```python
import mlflow

mlflow.set_tracking_uri(os.environ['MLFLOW_TRACKING_URI'])
with mlflow.start_run():
    mlflow.log_param("test", "value")
```

---

### **Infrastructure**

#### **AWS**

**Get Access Keys**:
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create an IAM user or use existing
3. Generate access keys
4. Download CSV with Access Key ID and Secret Access Key

**Environment Variables**:
```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export AWS_DEFAULT_REGION="us-east-1"
```

**Testing**:
```bash
# Install AWS CLI
pip install awscli

# Test
aws s3 ls
```

---

#### **Google Cloud Platform**

**Get Service Account Key**:
1. Go to [Cloud Console](https://console.cloud.google.com)
2. IAM & Admin > Service Accounts
3. Create service account or select existing
4. Add key > Create new key > JSON
5. Download JSON file

**Environment Variables**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export GCP_PROJECT_ID="your-project-id"
```

**Testing**:
```bash
# Install gcloud CLI
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS

# Test
gcloud projects list
```

---

#### **Cloudflare**

**Get API Token**:
1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create token with appropriate permissions
3. Copy the token

**Environment Variables**:
```bash
export CLOUDFLARE_API_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 🗄️ Secret Management Systems

For production deployments and team collaboration, use a proper secret management system.

### **1. HashiCorp Vault**

**Setup**:
```bash
# Start Vault server (dev mode)
vault server -dev

# Set Vault address
export VAULT_ADDR='http://127.0.0.1:8200'

# Store secrets
vault kv put secret/nerdcabal \
  anthropic_api_key="sk-ant-..." \
  openai_api_key="sk-proj-..." \
  github_token="ghp_..."

# Retrieve secret
vault kv get secret/nerdcabal
```

**Integration with NerdCabal**:
```bash
# Create startup script
cat > load-secrets.sh << 'EOF'
#!/bin/bash
export ANTHROPIC_API_KEY=$(vault kv get -field=anthropic_api_key secret/nerdcabal)
export OPENAI_API_KEY=$(vault kv get -field=openai_api_key secret/nerdcabal)
export GITHUB_TOKEN=$(vault kv get -field=github_token secret/nerdcabal)
EOF

# Source before running MCP server
source load-secrets.sh
node mcp-server/dist/index.js
```

---

### **2. AWS Secrets Manager**

**Store Secrets**:
```bash
# Create secret
aws secretsmanager create-secret \
  --name nerdcabal/api-keys \
  --secret-string '{
    "anthropic_api_key": "sk-ant-...",
    "openai_api_key": "sk-proj-...",
    "github_token": "ghp_..."
  }'

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id nerdcabal/api-keys \
  --query SecretString \
  --output text | jq -r '.anthropic_api_key'
```

**Auto-load Script**:
```bash
#!/bin/bash
# load-aws-secrets.sh

SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id nerdcabal/api-keys \
  --query SecretString \
  --output text)

export ANTHROPIC_API_KEY=$(echo $SECRET_JSON | jq -r '.anthropic_api_key')
export OPENAI_API_KEY=$(echo $SECRET_JSON | jq -r '.openai_api_key')
export GITHUB_TOKEN=$(echo $SECRET_JSON | jq -r '.github_token')
```

---

### **3. Google Cloud Secret Manager**

**Store Secrets**:
```bash
# Create secret
echo -n "sk-ant-..." | gcloud secrets create anthropic-api-key --data-file=-

# Access secret
gcloud secrets versions access latest --secret="anthropic-api-key"
```

**Auto-load Script**:
```bash
#!/bin/bash
export ANTHROPIC_API_KEY=$(gcloud secrets versions access latest --secret="anthropic-api-key")
export OPENAI_API_KEY=$(gcloud secrets versions access latest --secret="openai-api-key")
```

---

### **4. Doppler**

**Setup**:
```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler  # macOS
# or curl -Ls https://cli.doppler.com/install.sh | sh

# Login
doppler login

# Setup project
doppler setup

# Set secrets
doppler secrets set ANTHROPIC_API_KEY="sk-ant-..."

# Run with secrets injected
doppler run -- node mcp-server/dist/index.js
```

**Benefits**:
- Automatic syncing across environments
- Access control per team member
- Audit logs
- Integrations with CI/CD

---

### **5. 1Password CLI**

**Setup**:
```bash
# Install 1Password CLI
brew install 1password-cli

# Sign in
op signin

# Create item
op item create \
  --category=Login \
  --title="NerdCabal API Keys" \
  --vault="Development" \
  anthropic_api_key="sk-ant-..." \
  openai_api_key="sk-proj-..."

# Retrieve and export
export ANTHROPIC_API_KEY=$(op read "op://Development/NerdCabal API Keys/anthropic_api_key")
```

---

### **Comparison Matrix**

| Solution | Hosting | Cost | Best For | Complexity |
|----------|---------|------|----------|------------|
| **Vault** | Self-hosted or Cloud | Free (OSS) / Paid (Enterprise) | Enterprise | High |
| **AWS Secrets Manager** | AWS Cloud | $0.40/secret/month + API calls | AWS users | Medium |
| **GCP Secret Manager** | GCP Cloud | $0.06/secret/month + API calls | GCP users | Medium |
| **Doppler** | Cloud (SaaS) | Free tier / $7/user/month | Startups, teams | Low |
| **1Password** | Cloud (SaaS) | $7.99/user/month | Individuals, small teams | Low |

---

## 🔄 API Key Rotation

Regular key rotation is essential for security.

### **Rotation Strategy**

**Recommended Schedule**:
- **Critical keys** (production, admin): Every 30 days
- **Standard keys** (development, read-only): Every 90 days
- **Emergency rotation**: Immediately if compromised

---

### **Automated Rotation Script**

```bash
#!/bin/bash
# rotate-keys.sh

# 1. Generate new keys (provider-specific)
# Example for GitHub:
NEW_GITHUB_TOKEN=$(gh api /user/tokens --method POST \
  --field scopes[]="repo" \
  --field note="NerdCabal-$(date +%Y%m%d)" \
  --jq '.token')

# 2. Update in secret manager
vault kv put secret/nerdcabal github_token="$NEW_GITHUB_TOKEN"

# 3. Test new key
export GITHUB_TOKEN="$NEW_GITHUB_TOKEN"
if gh auth status; then
  echo "✅ New key works"
else
  echo "❌ New key failed, rolling back"
  exit 1
fi

# 4. Revoke old key
# (provider-specific, e.g., via API)

# 5. Update documentation
echo "$(date): Rotated GitHub token" >> rotation-log.txt
```

---

### **Zero-Downtime Rotation**

Use **dual-key** strategy:

1. Generate new key (Key B) while old key (Key A) is active
2. Update all services to use Key B
3. Verify Key B works everywhere
4. Revoke Key A

**Implementation**:
```bash
# Support multiple keys temporarily
export PRIMARY_API_KEY="new-key"
export FALLBACK_API_KEY="old-key"

# In your code, try primary first, fallback if fails
```

---

## 👥 Team Management

### **Role-Based Access Control (RBAC)**

Define roles for your team:

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Admin** | Full | Create/revoke keys, manage billing, all agents |
| **Developer** | Read-Write | Use all agents, create resources, no billing |
| **Analyst** | Read-Only | Query data, run analyses, no writes |
| **Auditor** | Logs-Only | View usage logs, no resource access |

---

### **Scoped Keys per Team Member**

Instead of sharing one key, create individual keys:

**GitHub Example**:
```bash
# Alice's key (repo read/write)
alice_token="ghp_alice..."

# Bob's key (repo read only)
bob_token="ghp_bob..."

# Charlie's key (workflow management)
charlie_token="ghp_charlie..."
```

**Benefits**:
- Individual usage tracking
- Easy revocation
- Clear audit trail

---

### **Shared Secret Distribution**

**Option 1: Shared 1Password Vault**
1. Create "NerdCabal Team" vault
2. Add team members
3. Store all API keys there
4. Team members use 1Password CLI to load secrets

**Option 2: Doppler Teams**
1. Create Doppler project
2. Invite team members
3. Set up environments (dev, staging, prod)
4. Team members run `doppler run` locally

---

### **Onboarding New Team Members**

**Checklist**:
```markdown
- [ ] Create accounts on required platforms
- [ ] Generate scoped API keys
- [ ] Add to secret management system
- [ ] Grant appropriate RBAC role
- [ ] Share documentation (this guide!)
- [ ] Test access with sample task
- [ ] Add to rotation schedule
```

**Offboarding**:
```markdown
- [ ] Revoke all API keys
- [ ] Remove from secret management
- [ ] Audit recent activity
- [ ] Rotate any shared keys they had access to
- [ ] Update team documentation
```

---

## 🛠️ NerdCabalMCP Configuration

### **MCP Server Configuration File**

Create `mcp-server/config/secrets.json` (excluded from git):

```json
{
  "providers": {
    "anthropic": {
      "api_key": "${ANTHROPIC_API_KEY}",
      "max_tokens": 4096,
      "model": "claude-sonnet-4-5-20250929"
    },
    "openai": {
      "api_key": "${OPENAI_API_KEY}",
      "organization": "${OPENAI_ORG_ID}",
      "model": "gpt-4o"
    },
    "google": {
      "api_key": "${GOOGLE_API_KEY}",
      "model": "gemini-1.5-pro"
    }
  },
  "integrations": {
    "github": {
      "token": "${GITHUB_TOKEN}"
    },
    "huggingface": {
      "token": "${HUGGINGFACE_TOKEN}"
    },
    "mlflow": {
      "tracking_uri": "${MLFLOW_TRACKING_URI}",
      "username": "${MLFLOW_TRACKING_USERNAME}",
      "password": "${MLFLOW_TRACKING_PASSWORD}"
    },
    "figma": {
      "access_token": "${FIGMA_ACCESS_TOKEN}"
    },
    "wandb": {
      "api_key": "${WANDB_API_KEY}",
      "project": "nerdcabal-experiments"
    }
  }
}
```

**Load in TypeScript**:
```typescript
// mcp-server/src/config.ts
import * as fs from 'fs';
import * as path from 'path';

interface Config {
  providers: {
    [key: string]: {
      api_key: string;
      [key: string]: any;
    };
  };
  integrations: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export function loadConfig(): Config {
  const configPath = path.join(__dirname, '../config/secrets.json');
  const configTemplate = fs.readFileSync(configPath, 'utf-8');

  // Replace ${VAR} with process.env.VAR
  const configResolved = configTemplate.replace(
    /\$\{(\w+)\}/g,
    (_, varName) => process.env[varName] || ''
  );

  return JSON.parse(configResolved);
}

// Usage
const config = loadConfig();
const anthropicKey = config.providers.anthropic.api_key;
```

---

### **Dynamic Provider Selection**

Allow agents to choose provider based on task:

```typescript
// mcp-server/src/providers.ts
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { loadConfig } from './config';

const config = loadConfig();

export class LLMProvider {
  private anthropic: Anthropic;
  private openai: OpenAI;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.providers.anthropic.api_key,
    });

    this.openai = new OpenAI({
      apiKey: config.providers.openai.api_key,
    });
  }

  async chat(provider: 'anthropic' | 'openai', prompt: string) {
    if (provider === 'anthropic') {
      const response = await this.anthropic.messages.create({
        model: config.providers.anthropic.model,
        max_tokens: config.providers.anthropic.max_tokens,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].text;
    } else {
      const response = await this.openai.chat.completions.create({
        model: config.providers.openai.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0].message.content;
    }
  }
}
```

---

## 🐛 Troubleshooting

### **Common Issues**

#### **Issue: "Unauthorized" or "Invalid API Key"**

**Solutions**:
1. Verify key is correct (copy-paste error?)
2. Check key hasn't expired
3. Ensure key has required permissions/scopes
4. Verify environment variable is loaded:
   ```bash
   echo $ANTHROPIC_API_KEY  # Should print key
   ```

---

#### **Issue: "Rate limit exceeded"**

**Solutions**:
1. Check usage dashboard for current rate limits
2. Implement exponential backoff:
   ```typescript
   async function retryWithBackoff(fn: Function, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.status === 429 && i < maxRetries - 1) {
           await sleep(2 ** i * 1000);  // 1s, 2s, 4s
         } else {
           throw error;
         }
       }
     }
   }
   ```
3. Upgrade API tier if needed

---

#### **Issue: "Environment variable not found"**

**Solutions**:
1. Check `.env` file exists and is in correct location
2. Verify `.env` is loaded:
   ```bash
   # Add to start script
   export $(cat .env | xargs)
   ```
3. Use `dotenv`:
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();
   ```

---

#### **Issue: "Secret not found in Vault/AWS/GCP"**

**Solutions**:
1. Verify secret name matches exactly (case-sensitive)
2. Check IAM permissions for reading secrets
3. Ensure correct region/project is set
4. Test with CLI:
   ```bash
   # AWS
   aws secretsmanager list-secrets

   # GCP
   gcloud secrets list

   # Vault
   vault kv list secret/
   ```

---

### **Debugging Checklist**

```markdown
- [ ] API key is valid and not expired
- [ ] Environment variable is set correctly
- [ ] Key has required permissions
- [ ] Not hitting rate limits
- [ ] Network connectivity is working
- [ ] Provider service is not down (check status page)
- [ ] Correct API endpoint URL
- [ ] SSL/TLS certificate is valid
```

---

## 📊 Monitoring & Auditing

### **Usage Tracking**

**Log API calls**:
```typescript
// mcp-server/src/middleware/logger.ts
import * as fs from 'fs';

export function logAPICall(
  provider: string,
  endpoint: string,
  status: number,
  timestamp: Date
) {
  const logEntry = {
    provider,
    endpoint,
    status,
    timestamp: timestamp.toISOString(),
  };

  fs.appendFileSync(
    'api-usage.log',
    JSON.stringify(logEntry) + '\n'
  );
}
```

**Analyze logs**:
```bash
# Count calls per provider
cat api-usage.log | jq -r '.provider' | sort | uniq -c

# Find failed requests
cat api-usage.log | jq 'select(.status >= 400)'

# Daily usage summary
cat api-usage.log | jq -r '.timestamp[:10]' | sort | uniq -c
```

---

### **Cost Tracking**

**Estimate costs**:
```typescript
// mcp-server/src/utils/cost-estimator.ts
const PRICING = {
  'claude-3-5-sonnet': {
    input: 0.003 / 1000,    // $3 per million input tokens
    output: 0.015 / 1000,   // $15 per million output tokens
  },
  'gpt-4o': {
    input: 0.005 / 1000,
    output: 0.015 / 1000,
  },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model];
  return (
    inputTokens * pricing.input +
    outputTokens * pricing.output
  );
}
```

**Monthly cost report**:
```bash
# Generate cost report
cat api-usage.log | jq -r '.cost' | awk '{sum+=$1} END {print "Total: $"sum}'
```

---

## 🎓 Best Practices Summary

1. ✅ **Use environment variables** or secret managers, never hardcode keys
2. ✅ **Implement least-privilege access** with scoped keys
3. ✅ **Rotate keys regularly** (30-90 days)
4. ✅ **Monitor usage** and set up alerts for anomalies
5. ✅ **Use HTTPS** for all API calls (enabled by default)
6. ✅ **Log API activity** for auditing
7. ✅ **Test keys** immediately after generation
8. ✅ **Document** which keys are used where
9. ✅ **Revoke immediately** if compromised
10. ✅ **Educate team** on security practices

---

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [12-Factor App: Config](https://12factor.net/config)
- [Anthropic API Best Practices](https://docs.anthropic.com/claude/docs/api-best-practices)
- [OpenAI Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Last Updated**: January 2026
**Version**: 1.0.0

```
Built with 🔐 by the NerdCabal community
```
