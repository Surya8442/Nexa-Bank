# NexaBank — State-of-the-Art Digital Banking Platform

A high-fidelity, full-stack digital banking experience styled after SBI's mobile banking platform (YONO SBI). Built with modern responsive UI and dual stack capabilities (Live Node-Express backend in the workspace container + standard Python FastAPI/PostgreSQL architecture ready for production).

---

## 🏆 Brand Name Selection

### The Best Choice: **NexaBank**
**Why it wins:** *Nexa* combines "Nexus" (meaning a central connecting point of infinite nodes) and "Next-Gen" (representing the velocity of future modular wealth). It conveys instant digital clearance, sovereign bank safety, and beautiful visual clarity.

### 💡 10 Modern Names for a Digital-First Banking App

1. **NexaBank** (Nexus + Next-Gen Finance)
2. **Finura** (Finance + Futura: Clean, premium editorial)
3. **Zephyr Finance** (Represents breeziness, speed, and clean friction-free transfers)
4. **Kinetix Bank** (Represents active, moving capital and instant deposits)
5. **Apex Digital** (The pinnacle of secure wealth assets and investments)
6. **VeloBank** (Velocity: built for lightning-fast UPI and RTGS transfers)
7. **Volt Pay** (High voltage, energetic, instant-disbursal loans)
8. **Aether Finance** (Infinite, digital, cloud-native capital storage)
9. **Novus Pocket** (Novus: Represents a modern wallet ledger card reimagination)
10. **Aura Wealth** (Premium, personal, and customized investment consulting)

---

## 📁 System Architecture Directory Tree

```bash
├── fastapi-backend/        # Production Python FastAPI Engine Codebase
│   ├── routers/            # Modular routing endpoints
│   ├── database.py         # SQLAlchemy Session builders
│   ├── models.py           # SQLAlchemy tables schemas (PostgreSQL indexes)
│   ├── schemas.py          # robust Pydantic validations models
│   ├── schema.sql          # Raw PostgreSQL SQL database creation schema
│   ├── requirements.txt    # Python requirements
│   ├── Dockerfile          # Containerized Python image
│   └── docker-compose.yml  # Local database + python orchestration
│
├── server/                 # Live Container Sandbox database
│   └── db.ts               # Simulated SQL state database seedings
│
├── src/                    # Frontend React SPA
│   ├── components/         # Modular visual UI cards & dashboards
│   ├── App.tsx             # Main authentication app router orchestrator
│   ├── index.css           # Google font imports and Tailwind CSS 4.0 configurations
│   ├── main.tsx            # App container mount
│   └── types.ts            # Shared core client types
│
├── server.ts               # Express.js Server proxy hosting the preview system
└── package.json            # Vite, bundlers and server build scripts config
```

---

## 🔐 Sandbox credentials

For instant evaluation, you can enter these credentials in the login forms to bypass manual enrollment:

*   **Email Address:** `demo@nexabank.com`
*   **Acess Passphrase PIN:** `Demo@123`
*   **Transmissions code (OTP):** `123456`
*   **Savings UPI Security PIN:** `121212`

---

## 🛠️ Step-by-Step Installation Setup Guide

### 🚀 Setup Way 1 — Running the React + Node Fullstack locally
1.  **Extract project files**, nav into directory root.
2.  Install required Node Packages:
    ```bash
    npm install
    ```
3.  Launch both Frontend and Node Backend Express proxies locally on port 3000:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:3000` in your web browser.

### 🐍 Setup Way 2 — Production Python FastAPI + PostgreSQL (Docker)
1.  Enter the Python backend scope:
    ```bash
    cd fastapi-backend
    ```
2.  Fire up the orchestrated containers (Both relational PostgreSQL + FastAPI web services will boot):
    ```bash
    docker-compose up --build
    ```
3.  This handles database creations and initialization scripts automatically.
4.  Access interactive **Swagger API Docs** at: `http://localhost:8000/docs`.

---

## 💎 Features Walkthrough

1.  **Advanced KYC Onboarding**: Custom multi-form page inputs representing high-security registers (PAN validity, custom Date of birth datepickers, Address inputs).
2.  **Wealth Investments Segment**: Interactive allocations summary stats charts showing capital gain profiles. Buy tickets in Mutual funds or digital 24K gold instantly.
3.  **EMI Lending Sliders**: Dynamic slide controls representing principal values and tenure periods. Recalculates EMIs reactively with direct account clearance credits.
4.  **ATM Hotlisting Controls**: High-fidelity dark glass debit cards displaying masking formats. Freeze card toggles or ATM PIN resets change status with immediate verification.
5.  **Multi-Channel Pay transfer**: Clear IMPS/NEFT transfer routes, persistent payee notebooks, and secure UPI payment PIN assertions.
