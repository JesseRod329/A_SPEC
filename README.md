# A_SPEC - Agentic Supply, Promotion & Exchange Center

> Autonomous AI agents for independent creators and brands, powered by Gemini 2.0 Flash, Circle USDC, and Arc blockchain.

**Built for the Agentic Commerce on Arc Hackathon (Jan 9-24, 2026)**

---

## The Problem

Independent creators and small brands face significant challenges:
- **Manual procurement** - Hours spent monitoring wholesale prices and placing orders
- **Inefficient marketing** - Difficulty finding and paying micro-influencers for authentic promotion
- **Complex payments** - Traditional payment rails are slow and expensive for micropayments

## The Solution

A_SPEC deploys autonomous AI agents that handle these tasks 24/7:

### Procurement Agent
- Monitors wholesale supplier prices in real-time
- Makes autonomous purchase decisions using Gemini 2.0 Flash reasoning
- Executes USDC payments when price targets are met
- Operates within strict guardrails (daily limits, max transaction size)

### Marketing Agent
- Discovers micro-influencers via x402 protocol (pay-per-data access)
- Evaluates influencer authenticity and engagement quality
- Executes micropayments for pay-per-post campaigns
- Tracks campaign performance and ROI

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         A_SPEC Dashboard                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Wallet Balance │  │ Procurement Feed │  │ Marketing Feed  │  │
│  │     (USDC)      │  │  (Agent Events)  │  │  (Agent Events) │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│  ┌────────▼────────────────────▼────────────────────▼────────┐  │
│  │                    3D Orb Visualization                    │  │
│  │         (Status: Thinking → Executing → Settled)          │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Agent Layer                                │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │   Procurement Agent     │  │      Marketing Agent        │   │
│  │  • Price Analysis       │  │  • Influencer Evaluation    │   │
│  │  • Budget Management    │  │  • Campaign Management      │   │
│  │  • Order Execution      │  │  • x402 Micropayments       │   │
│  └───────────┬─────────────┘  └───────────────┬─────────────┘   │
│              │                                │                  │
│              └────────────────┬───────────────┘                  │
│                               ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Gemini 2.0 Flash                          │ │
│  │           (Reasoning Engine - 1M Token Context)            │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Payment Layer                               │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │    Circle USDC API      │  │      x402 Protocol          │   │
│  │  • Wallet Management    │  │  • HTTP 402 Payments        │   │
│  │  • Transfer Execution   │  │  • Micropayment Receipts    │   │
│  └───────────┬─────────────┘  └───────────────┬─────────────┘   │
│              │                                │                  │
│              └────────────────┬───────────────┘                  │
│                               ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Arc Blockchain                           │ │
│  │        (Testnet - Sub-second Finality, USDC-native)       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| AI Brain | Gemini 2.0 Flash | Fast reasoning for financial decisions |
| Payments | Circle USDC (Sandbox) | Programmable stablecoin transactions |
| Infrastructure | Arc Platform (Testnet) | Sub-second finality, USDC-native gas |
| Protocol | x402 | HTTP-native micropayments for agent commerce |
| Frontend | Next.js 14 + React Three Fiber | Dashboard with 3D visualization |
| Styling | Tailwind CSS | Modern, responsive UI |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Google AI Studio API key (for Gemini)
- Circle sandbox API key (optional)
- Arc testnet wallet (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/JesseRod329/A_SPEC.git
cd A_SPEC

# Install dependencies
bun install
# or
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
```

### Environment Variables

```env
# Required for full functionality
GOOGLE_AI_API_KEY=your_gemini_key

# Optional - enables real transactions
CIRCLE_API_KEY=SAND_API_KEY_xxxxx
ARC_WALLET_PRIVATE_KEY=your_testnet_key
ARC_RPC_URL=https://testnet.arc.network
```

### Running the App

```bash
# Development mode
bun dev
# or
npm run dev

# Open http://localhost:3000
```

## Usage

1. **View Wallet Balance** - See your USDC balance and wallet address
2. **Trigger Procurement Agent** - Click "Analyze Prices" to have the agent evaluate supplier pricing
3. **Trigger Marketing Agent** - Click "Discover Influencers" or "Evaluate & Engage"
4. **Watch Agent Reasoning** - See real-time decision-making in the activity feeds
5. **Monitor Transactions** - Track USDC transfers on the Arc testnet

## Agent Guardrails

Built-in safety limits to demonstrate responsible AI:

- **Max single transaction:** $500 USDC
- **Procurement daily limit:** $2,000 USDC
- **Marketing daily limit:** $500 USDC
- **Minimum confidence threshold:** 60%
- **Human override controls** in the dashboard

## Demo Mode

The app runs in mock mode by default (no API keys needed):
- Simulated USDC wallet with $10,000 balance
- Mock supplier price data
- Mock influencer data
- Simulated transactions with fake tx hashes

To enable real transactions, add your API keys to `.env.local`.

## Project Structure

```
.
├── src/
│   ├── agents/
│   │   ├── procurement.ts      # Procurement agent logic
│   │   ├── marketing.ts        # Marketing agent logic
│   │   └── prompts.ts          # Gemini system prompts
│   ├── services/
│   │   ├── arc.ts              # Arc wallet integration
│   │   ├── circle.ts           # Circle USDC API
│   │   ├── gemini.ts           # Gemini 2.0 Flash client
│   │   └── x402.ts             # x402 payment protocol
│   ├── components/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── AgentFeed.tsx       # Real-time activity
│   │   ├── WalletBalance.tsx   # USDC balance display
│   │   ├── AgentControls.tsx   # Agent trigger buttons
│   │   ├── AgentStats.tsx      # Budget tracking
│   │   └── OrbVisualization.tsx # R3F 3D orb
│   └── app/
│       ├── page.tsx            # Landing/dashboard
│       └── api/
│           ├── agent/route.ts  # Agent execution endpoint
│           └── webhook/route.ts # Transaction webhooks
├── public/
├── package.json
├── .env.example                # Environment template
└── README.md
```

## API Endpoints

### POST /api/agent

| Action | Description |
|--------|-------------|
| `analyze` | Trigger agent analysis (procurement or marketing) |
| `discover` | Marketing agent discovers influencers via x402 |
| `status` | Get current wallet balance and agent states |
| `events` | Get recent agent activity events |
| `reset` | Reset agent states and clear events |

Example:
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "analyze", "agentType": "procurement"}'
```

## Key Features Demonstrated

1. **Autonomous Decision Making** - Gemini 2.0 Flash analyzes data and makes financial decisions
2. **Programmable Money** - Circle USDC enables instant, low-cost transfers
3. **Blockchain Settlement** - Arc testnet provides sub-second transaction finality
4. **HTTP-Native Payments** - x402 protocol for pay-per-data access
5. **Real-Time Dashboard** - Live agent activity with 3D visualization
6. **Safety Guardrails** - Spending limits and human override controls

## Future Roadmap

- [ ] Royalty Split Agent - Auto-distribute revenue to collaborators
- [ ] Multi-agent coordination - Agents working together on complex tasks
- [ ] Real supplier API integrations
- [ ] Mobile app for on-the-go monitoring
- [ ] Analytics dashboard for ROI tracking

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Gemini 2.0 Flash](https://ai.google.dev/) - AI reasoning engine
- [Circle USDC](https://www.circle.com/usdc) - Programmable stablecoin
- [Arc](https://arc.network/) - High-performance blockchain
- [x402](https://www.x402.org/) - HTTP payment protocol
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D visualization
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## License

MIT

## Acknowledgments

- Anthropic & Google for AI capabilities
- Circle for USDC infrastructure
- Arc team for blockchain support
- Hackathon organizers

---

**A_SPEC** - Autonomous agents for the creator economy.
