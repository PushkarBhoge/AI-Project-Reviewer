# Rural Telemedicine Platform

A full-stack telemedicine web app built for rural India, connecting patients with doctors via video consultations, AI-powered symptom checking, and blockchain-verified doctor records.

---
# Some Glimpse

<img width="1357" height="1077" alt="image" src="https://github.com/user-attachments/assets/0e77762d-2c6a-42e8-8dce-efe8b4e89a91" />
<img width="1143" height="1079" alt="image" src="https://github.com/user-attachments/assets/e5facf15-8ccd-44b7-9a17-6239f52200e8" />
<img width="1003" height="1079" alt="image" src="https://github.com/user-attachments/assets/9432998c-85d4-4286-be32-14b0f85d0598" />

---

## Features

- **Patient & Doctor Auth** — Phone + password signup/login with bcrypt
- **Doctor Listing** — Filter by specialty and availability
- **Appointment Booking** — Real-time slot availability, conflict prevention
- **Video Consultations** — Jitsi Meet integration, doctor-initiated calls
- **AI Symptom Checker** — Multi-provider fallback: Claude → GPT → Gemini → Groq
- **Health Records** — Auto-created on appointment completion, PDF download
- **Prescriptions** — Doctor-issued prescriptions with PDF export
- **Blockchain Registry** — Doctor data stored on-chain via Solidity smart contract (Hardhat)
- **Nearby Medicals** — Locate nearby medical stores

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, MongoDB (Mongoose) |
| Blockchain | Solidity, Hardhat, Ethers.js |
| AI | Claude, OpenAI GPT, Gemini, Groq (fallback chain) |
| Video | Jitsi Meet |
| Deployment | Render (backend) |

---

## Project Structure

```
Hawkathon/
├── frontend/        # React + Vite app
├── backend/         # Express API + MongoDB
└── blockchain/      # Hardhat + Solidity smart contracts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB URI
- API keys: Claude, OpenAI, Gemini, Groq

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=<your_mongodb_uri>
ClaudeAPI=<your_claude_api_key>
OpenaiAPI=<your_openai_api_key>
GeminiAPI=<your_gemini_api_key>
GrokAPI=<your_groq_api_key>
```

```bash
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Blockchain (optional)

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network <network>
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/patient/signup` | Register patient |
| POST | `/api/patient/login` | Patient login |
| POST | `/api/doctor/signup` | Register doctor (auto syncs to blockchain) |
| POST | `/api/doctor/login` | Doctor login |
| GET | `/api/doctors` | List doctors (filter by specialty/availability) |
| GET | `/api/doctors/:id/slots` | Get available time slots |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/:bookingId` | Get appointment details |
| PATCH | `/api/appointments/:bookingId/cancel` | Cancel appointment |
| POST | `/api/symptom-check` | AI symptom analysis |
| GET | `/api/health-records/:phone` | Get patient health records |
| POST | `/api/blockchain/sync-all` | Sync all doctors to blockchain |

---

## Seed Data

To populate demo doctors (password: `doctor123` for all):

```bash
POST /api/seed
```
