# 🤖 AI Code Reviewer Bot

An automated GitHub Pull Request reviewer powered by **Groq AI (LLaMA 3.1)**. When a PR is opened or updated, this bot fetches the changed files, sends them to an AI model for analysis, and posts a structured review comment directly on the PR — covering bugs, suggestions, and a summary.

---

## 🚀 Features

- ✅ Listens to GitHub webhook events for Pull Requests
- ✅ Automatically reviews code on PR `opened` or `synchronize` events
- ✅ Uses **Groq AI (LLaMA 3.1 8B)** for fast, accurate code analysis
- ✅ Posts structured review comments with bugs, suggestions, and a summary
- ✅ Filters only `.js` files and added lines (ignores noise)
- ✅ Deployed on **AWS EC2** and managed via **PM2**

---

## 🛠️ Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Runtime      | Node.js (ES Modules)               |
| Framework    | Express.js                         |
| AI Provider  | Groq API (LLaMA 3.1 8B Instant)    |
| GitHub Auth  | Personal Access Token (PAT)        |
| Deployment   | AWS EC2 (Ubuntu 24.04)             |
| Process Mgr  | PM2                                |
| Tunnel (dev) | ngrok                              |

---

## 📁 Project Structure

```
backend/
├── controllers/
│   ├── githubController.js   # Webhook handler & GitHub API calls
│   └── reviewController.js   # AI review logic via Groq
├── routes/
│   ├── githubRoutes.js       # POST /api/github/webhook
│   └── reviewRoutes.js       # POST /api/review
├── server.js                 # Express server entry point
├── .env                      # Environment variables (not committed)
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/mayank74pathak/ai-pr-fresh.git
cd ai-pr-fresh/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=ghp_your_personal_access_token_here
```

> **GROQ_API_KEY** → Get from [console.groq.com](https://console.groq.com)  
> **GITHUB_TOKEN** → GitHub → Settings → Developer Settings → Personal Access Tokens (classic)  
> Required scopes: `repo`, `pull_requests`

### 4. Start the server

```bash
node server.js
```

Server runs on **port 5001**.

---

## 🔗 GitHub App & Webhook Setup

### GitHub App Configuration

| Field              | Value                                          |
|--------------------|------------------------------------------------|
| App Name           | AI Code Reviewer Bot                           |
| App ID             | `3327160`                                      |
| Client ID          | `Iv23liiXmLHHpX6AT8UD`                        |
| Webhook URL (prod) | `http://54.83.125.169:5001/api/github/webhook` |
| Webhook URL (dev)  | `https://<ngrok-url>/api/github/webhook`       |
| Webhook Secret     | Set in GitHub App settings                     |

### Required Permissions

| Permission    | Level          |
|---------------|----------------|
| Pull Requests | Read & Write   |
| Contents      | Read           |
| Metadata      | Read (default) |

### Subscribed Events

- ✅ Pull Request

---

## ☁️ AWS EC2 Deployment

### Initial Deployment

```bash
# Set permissions on your .pem key
chmod 400 ai-reviewer-key.pem

# Sync code to EC2 (excluding node_modules)
rsync -avz --exclude 'node_modules' -e "ssh -i ai-reviewer-key.pem" backend ubuntu@54.83.125.169:~

# SSH into EC2
ssh -i ai-reviewer-key.pem ubuntu@54.83.125.169

# Install dependencies on EC2
cd backend && npm install

# Start with PM2
pm2 start server.js --name ai-reviewer
pm2 save
```

### Update Deployed Code

```bash
# Step 1 — Sync updated code (local)
rsync -avz --exclude 'node_modules' -e "ssh -i ai-reviewer-key.pem" backend ubuntu@54.83.125.169:~

# Step 2 — Restart the process (EC2)
pm2 restart ai-reviewer
```

### PM2 Commands

```bash
pm2 logs ai-reviewer       # View live logs
pm2 restart ai-reviewer    # Restart after code update
pm2 stop ai-reviewer       # Temporarily stop
pm2 start ai-reviewer      # Start again
pm2 status                 # View all processes
```

---

## 🧪 Testing the Bot

```bash
# Create and switch to a new branch
git checkout -b test-pr-branch

# Make a code change
echo "console.log(undefinedVar)" >> test.js
git add .
git commit -m "trigger AI review"
git push origin test-pr-branch

# Create a pull request via GitHub CLI
gh pr create --base main --head test-pr-branch --title "Test AI PR Review"
```

Then open the PR on GitHub — the bot will automatically post a review comment within seconds.

---

## 🤖 How It Works

```
GitHub PR opened/updated
        │
        ▼
Webhook → POST /api/github/webhook
        │
        ▼
Fetch changed .js files (only added lines)
        │
        ▼
POST /api/review (internal)
        │
        ▼
Groq AI (LLaMA 3.1) analyzes the code
        │
        ▼
Returns: { bugs, suggestions, explanation }
        │
        ▼
Post structured comment on GitHub PR ✅
```

---

## 📝 Sample AI Review Comment

```markdown
## 🤖 AI Code Review

### 🐞 Bugs
- `undefinedVar` is used without being declared

### 💡 Suggestions
- Declare variables with `const` or `let` before use
- Add input validation before processing

### 📘 Summary
The code references an undefined variable which will cause a ReferenceError at runtime.
```

---

## 🔒 Security Notes

- Never commit your `.env` file — it contains sensitive API keys
- Your `GITHUB_TOKEN` shown in notes (`ghp_nzw5...`) should be **regenerated** if exposed publicly
- Consider adding webhook signature verification using the webhook secret for production use

---

## 📄 License

MIT License — feel free to fork, modify, and build on top of this project.

---

## 👤 Author

**Mayank Pathak** — [@mayank74pathak](https://github.com/mayank74pathak)
