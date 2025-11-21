<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TopBins - Football Bet Tracking System

A stylish, cyberpunk-themed web application for tracking friendly football wagers between friends. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎯 **Active Bet Tracking**: Monitor multiple player vs player and threshold bets
- 🎨 **Stunning UI**: Dark cyberpunk aesthetic with neon accents
- 🤖 **AI Tactical Generator**: Powered by Google Gemini AI
- 📊 **Detailed Analytics**: View bet criteria, void conditions, and participants
- 📱 **Fully Responsive**: Works beautifully on mobile and desktop

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
   
   Get your Gemini API key from: https://ai.google.dev/

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (via CDN for now)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **Database**: Prisma (configured for future use)

## Project Structure

```
topbins/
├── components/        # React components
│   ├── Hero.tsx      # Hero carousel with featured bets
│   ├── Dashboard.tsx # Main bet list view
│   ├── BetModal.tsx  # Detailed bet information
│   ├── TacticalAI.tsx # AI strategy generator
│   └── ...
├── services/         # API services
│   └── geminiService.ts
├── types.ts          # TypeScript type definitions
├── constants.ts      # Mock data and configuration
├── App.tsx           # Main app component
└── index.tsx         # Entry point
```

## Contributing

This is a personal project for tracking friendly bets. Feel free to fork and adapt for your own use!

## License

ISC
