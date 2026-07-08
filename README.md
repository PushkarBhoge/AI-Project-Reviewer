# AI Code Reviewer

An intelligent, full-stack application that leverages the power of Google's Gemini 1.5 Flash AI to perform comprehensive code reviews on public GitHub repositories. 

## Features
- **Instant GitHub Audits**: Enter any public repository URL and get an instant audit.
- **Deep Code Analysis**: Analyzes project architecture, security vulnerabilities, performance bottlenecks, and best practices.
- **Actionable Reports**: Provides a modular, easy-to-read report with actionable steps to improve the codebase.
- **Premium Glassmorphism UI**: A stunning, fully responsive dark-mode UI built with React and TailwindCSS.
- **Secure Backend**: Robust Express.js backend handling API routing, GitHub API integrations, and Gemini AI processing.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, React Router, Lucide Icons
- **Backend**: Node.js, Express.js, Google Generative AI (Gemini), GitHub API
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js (v16+)
- A Google Gemini API Key
- A GitHub Personal Access Token (for increased API rate limits)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YourUsername/ai-code-reviewer.git
cd ai-code-reviewer
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

4. Set up Environment Variables:
- In the `backend` directory, create a `.env` file and add your `GEMINI_API_KEY`, `GITHUB_TOKEN`, and `PORT`.
- In the `frontend` directory, create a `.env` file and add `VITE_API_URL=http://localhost:3000/api`.

5. Run the Application:
- Start the backend: `npm run dev` (inside `/backend`)
- Start the frontend: `npm run dev` (inside `/frontend`)
