# TopBins Setup Guide

## What Was Fixed

### ✅ Critical Issues Resolved

1. **Created missing `index.css`** - Tailwind CSS imports now working
2. **Updated `package.json`** - Added all required dependencies and proper scripts
3. **Fixed `tsconfig.json`** - Now properly configured for React + TypeScript + Vite
4. **Added `tsconfig.node.json`** - Required for Vite configuration
5. **Created Tailwind config** - `tailwind.config.js` and `postcss.config.js`
6. **Added TacticalAI component** - Now visible in the main app
7. **Created `.gitignore`** - Proper file exclusions for version control
8. **Updated README** - Comprehensive documentation

## Installation Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- React 19 and React DOM
- Vite (build tool)
- TypeScript and type definitions
- Tailwind CSS, PostCSS, Autoprefixer
- Lucide React (icons)
- Google Gemini AI SDK
- Prisma (database ORM)

### Step 2: Set Up Environment Variables

Create a file named `.env.local` in the root directory:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**To get your API key:**
1. Visit https://ai.google.dev/
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into `.env.local`

### Step 3: Run the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

## Features Now Available

### 🎯 Hero Section
- Auto-rotating carousel of featured bets
- Player vs Player visual comparisons
- Manual navigation controls
- Smooth scroll to dashboard

### 📊 Active Ledger (Dashboard)
- List view of all active bets
- Click any bet to see full details in modal
- Participant information
- Prize/bounty display
- Status indicators (ACTIVE/SETTLED/VOID)

### 🤖 Tactical AI Generator
- **NEW**: Now visible in the app!
- Select opponent type and team mentality
- Generate AI-powered tactical strategies
- Powered by Google Gemini API
- Futuristic terminal-style interface

### 🎨 Design Features
- Dark cyberpunk aesthetic
- Neon volt (#CCFF00) accent color
- Custom animations and transitions
- Fully responsive (mobile & desktop)
- Film grain noise overlay
- Scanline effects
- Chrome text styling

## Project Structure

```
topbins/
├── components/           # React components
│   ├── Hero.tsx         # Hero carousel with featured bets
│   ├── Dashboard.tsx    # Main bet list view
│   ├── BetModal.tsx     # Detailed bet modal overlay
│   ├── BetListRow.tsx   # Individual bet row component
│   ├── TacticalAI.tsx   # AI strategy generator (NOW IN APP!)
│   ├── LegacyBadge.tsx  # Branding logo
│   ├── Button.tsx       # Reusable button component
│   └── ...
├── services/
│   └── geminiService.ts # Google Gemini AI integration
├── prisma/
│   ├── schema.prisma    # Database schema (for future use)
│   └── seed.ts          # Database seeding
├── App.tsx              # Main app component
├── index.tsx            # Entry point
├── index.css            # Tailwind CSS imports (FIXED!)
├── index.html           # HTML template
├── types.ts             # TypeScript type definitions
├── constants.ts         # Mock data and configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config (FIXED!)
├── tsconfig.node.json   # TS config for Vite (NEW!)
├── tailwind.config.js   # Tailwind configuration (NEW!)
├── postcss.config.js    # PostCSS configuration (NEW!)
├── package.json         # Dependencies and scripts (FIXED!)
└── README.md            # Documentation (UPDATED!)
```

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (not yet implemented)
npm test
```

## Troubleshooting

### Port already in use?
If port 3000 is busy, Vite will automatically try 3001, 3002, etc.

### API errors?
Make sure your `.env.local` file has the correct `GEMINI_API_KEY`

### Module not found?
Run `npm install` again to ensure all dependencies are installed

### Build errors?
Clear the cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Run the app**: `npm run dev`
2. **Test the Hero carousel**: Should auto-rotate through bets
3. **Click on bets**: Opens detailed modal view
4. **Try the Tactical AI**: Scroll down to the new AI section
5. **Test on mobile**: Fully responsive design

## Future Enhancements

- [ ] Connect Prisma database (schema is ready)
- [ ] Add user authentication
- [ ] Real-time score updates via external API
- [ ] Push notifications for bet settlements
- [ ] Export bet history
- [ ] Add more bet types (team vs team, etc.)

## Support

For issues or questions, refer to the main README.md or check the Vite documentation: https://vitejs.dev/

---

**Enjoy TopBins! 🎯⚽**

