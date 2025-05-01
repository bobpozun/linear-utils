# 🏷️ Linear Label Cleanup Script (TypeScript)

This TypeScript script identifies and optionally deletes unused labels in your [Linear](https://linear.app) workspace using the Linear GraphQL API.

---

## ⚙️ Features

- ✅ Fetch all labels via pagination
- 🔍 Detect labels with no assigned issues
- 🧪 Preview labels (dry run) before deleting
- 🛑 Label deletion is fully commented out for safety
- 🔐 Uses `.env` for secure API key management
- 🛠️ Written in modern, typed TypeScript

---

## 🚀 Setup Instructions

### 1. Clone and install dependencies

```bash
git clone git@github.com:bobpozun/linear-utils.git
cd linear-utils
yarn install
```

### 2. Configure environment variables

 - Update the `.env` file with your Linear API key.

### 3. Run the script

```bash
yarn ts-node ./delete-unused.labels.ts
```
