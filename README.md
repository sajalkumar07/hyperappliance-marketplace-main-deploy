# HyperAppliance AIMs Marketplace

A cross-chain marketplace for buying, selling, and deploying AI Modules (AIMs) built on the HyperCycle ecosystem. This platform enables users to list AIMs on multiple blockchains (Ethereum, Cardano, Polygon, Base) and provides a seamless interface for discovering and purchasing AI solutions.

## Features

- Cross-chain marketplace supporting both EVM chains and Cardano
- Browse AI Modules listed by developers worldwide
- List your own AI Modules for sale
- Connect multiple wallet types (MetaMask, WalletConnect, Cardano wallets)
- Deploy AIMs to compatible HyperBoxes with automated compatibility checking
- Real-time messaging between buyers, sellers, and HyperBox owners
- User profiles with linked wallets across chains
- Redis-powered features for performance and real-time capabilities:
  - Fast caching of marketplace listings
  - Real-time deployment tracking and updates
  - Message storage and conversation management
  - Session management and rate limiting
- Dark mode support
- Database integration with Prisma ORM

## Tech Stack

- **Frontend**: Next.js, TypeScript, React
- **UI**: Chakra UI, Tailwind CSS, Lucide Icons
- **Blockchain**: Ethers.js (EVM chains), Mesh.js (Cardano)
- **Smart Contracts**: Solidity (EVM), Plutus (Cardano)
- **Backend**: Next.js API routes, PostgreSQL with Prisma
- **Caching & Real-time**: Redis for performance optimization
- **State Management**: React Context

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git
- PostgreSQL database (local or hosted)
- Redis server (local or hosted)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/hyperappliance-marketplace.git
   cd hyperappliance-marketplace
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Then edit `.env.local` to include your database connection string, Redis URL, and other configurations.

4. Initialize the database:
   ```
   npx prisma db push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── app/                  # Next.js app directory (App Router)
│   ├── about/            # About page with ecosystem info
│   ├── api/              # API routes for backend functionality
│   │   ├── aims/         # AIMs endpoints with Redis caching
│   │   ├── deployments/  # Deployment endpoints with Redis tracking
│   │   ├── hyperboxes/   # HyperBoxes endpoints with Redis caching
│   │   └── messages/     # Messaging endpoints with Redis messaging
│   ├── create-listing/   # Create AIM listing page
│   ├── deploy/           # Deployment page with form
│   ├── marketplace/      # Marketplace browsing page  
│   ├── messages/         # Messaging interface page
│   ├── my-aims/          # User's owned AIMs and deployments
│   ├── profile/          # User profile page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── providers.tsx     # Chakra UI and wallet providers
├── components/           # Reusable UI components
│   ├── AIMCard.tsx       # Individual AIM listing card
│   ├── AIMsListingPage.tsx # AIM marketplace page with filters
│   ├── DeploymentForm.tsx  # Form for deploying AIMs to HyperBoxes
│   ├── FeaturedListings.tsx # Featured AIMs component
│   ├── Footer.tsx        # Site footer
│   ├── Hero.tsx          # Hero section for homepage
│   ├── MessagingInterface.tsx # Real-time messaging component
│   ├── Navbar.tsx        # Navigation bar
│   └── wallet/           # Wallet-related components
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client setup
│   ├── redis.ts          # Redis client setup
│   ├── redis-utils.ts    # Redis utility functions
│   └── wallet/           # Wallet connection infrastructure
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema definition
├── public/               # Static assets
├── .env.example          # Example environment variables
├── README.md             # Project documentation
└── PROJECT_STATUS.md     # Current project status and roadmap
```

## Wallet Integration

The marketplace supports multiple blockchain wallets:

- **EVM Wallets**: MetaMask, WalletConnect, and other Ethereum-compatible wallets for interacting with Ethereum, Polygon, and Base chains
- **Cardano Wallets**: Integration with Nami, Eternl, and other CIP-30 compatible Cardano wallets

Users can connect wallets of different types and link them to a single profile, enabling seamless interaction with AIMs across blockchains.

## Redis Integration

The application leverages Redis for several key features:

### Caching
- AIM and HyperBox listings are cached with configurable TTL
- API responses use caching with automatic invalidation
- UI components are cache-aware, showing performance indicators

### Messaging
- Real-time messaging between users
- Conversation history storage with efficient retrieval
- Unread message tracking

### Deployment Tracking
- Status updates for AIM deployments
- User-specific deployment tracking
- Real-time deployment monitoring

### Session Management
- Secure session storage with expiration
- Support for multi-device usage
- Session extension on activity

## Database Schema

The database uses Prisma ORM with the following main models:

- **User**: Stores user profiles with support for multiple wallet addresses
- **AIM**: Represents AI Modules with metadata, pricing, and blockchain details
- **HyperBox**: Represents compute nodes for deploying AIMs
- **Deployment**: Tracks AIM deployments on HyperBoxes
- **Message**: Stores messages between users

## Deployment

The application can be easily deployed to Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure environment variables (DB, Redis, etc.)
4. Deploy

For Redis, we recommend using a managed Redis service like Upstash, Redis Labs, or a self-hosted Redis instance.

For database hosting, we recommend using a PostgreSQL provider like Railway, Supabase, or Neon.

## Current Status

This project is currently in the development phase. See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed information about the current implementation status and next steps.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- HyperCycle ecosystem
- HyperAppliance team
- OpenZeppelin for smart contract libraries
- Mesh.js for Cardano wallet integration