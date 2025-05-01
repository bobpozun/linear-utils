# 🛠️ Linear Utils

A collection of command-line utilities for Linear workflows.

---

## ⚙️ Features

- 🔐 Uses `.env` for secure API key management
- ✅ Fetch all labels via pagination
- 🔍 Detect labels with no assigned issues
- 🧪 Preview labels (dry run) before deleting
- 🛑 Label deletion is fully commented out for safety

## 🧰 Available Utilities

- **Label Cleanup** (`yarn delete-unused-labels`): Identifies unused labels and optionally deletes them with confirmation.
  - Fetches all labels, filters by issue count and excludes label groups.
  - Dry-run mode by default (`DRY_RUN=true`).
  - Confirmation prompt before deletion when enabled.

---

## 🚀 Setup Instructions

### 1. Clone and install dependencies

```bash
git clone git@github.com:bobpozun/linear-utils.git
cd linear-utils
yarn install
```

### 2. Configure environment variables

1. Copy `.env.example` to `.env`.
2. In `.env`, set your credentials and flags:
   ```env
   LINEAR_API_KEY=your_linear_api_key
   DRY_RUN=true      # 'true' for dry run, set to 'false' to enable deletions
   ```

### 3. Run the script

```bash
yarn delete-unused-labels
```
