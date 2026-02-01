# Auto-Sync File Editor

## Overview

This is a mini file editor with auto-save like Google Docs. It saves your file when you stop typing, every 30 seconds, or when you close the tab.

## Features

* Debounced save: saves 3 seconds after typing stops
* Interval save: saves every 30 seconds
* Tab close save: saves before leaving the page
* Save status: shows `Saved`, `Saving…`, or `Unsaved changes`
* Optimizations: saves only if content changed and retries failed saves

## Backend API

* POST /save
* Payload:

```json
{
  "fileId": "file-1",
  "title": "My File",
  "content": "File content",
  "version": 2,
  "timestamp": "2026-02-02T12:00:00Z"
}
```

## How to Run

1. Clone the repo:

```bash
git clone https://github.com/your-username/auto-sync-editor.git
```

2. Start backend:

```bash
cd backend
npm install
npm run dev
```

3. Start frontend:

```bash
cd frontend
npm install
npm start
```

4. Open `http://localhost:3000` in browser

## Sync Strategy

* Version-based: saves only if content changed
* Cancels old save if new changes happen

## Bonus Ideas

* Offline support with queued saves
* Multi-tab sync
* Live updates with WebSocket
