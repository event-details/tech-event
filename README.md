# Tech Meet Event Management System

A responsive React SPA for tech event management with chatbot and leaderboard features, built with React, Node.js, and Tailwind CSS.

## Project Structure

```
tech-meet-event/
├── client/                 # Frontend React application
│   ├── src/               # React source files
│   ├── public/            # Static assets
│   ├── package.json       # Client dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js  # PostCSS configuration
├── server/                # Backend Node.js server
│   ├── index.js           # Express server
│   ├── data/              # JSON data files
│   └── package.json       # Server dependencies
├── package.json           # Root package.json with scripts
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org) installed (version 16 or higher).

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tech-meet-event
```

2. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Install client dependencies
npm run install-client

# Install server dependencies  
npm run install-server
```

### Development

To run both client and server in development mode:
```bash
npm run dev
```

This will start:
- React development server on http://localhost:5173
- Express API server on http://localhost:3001

To run individually:
```bash
# Run only the client
npm run dev-client

# Run only the server
npm run dev-server
```

### Production Build

1. Build the client for production:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Deployment

#### For Render.com:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

#### Environment Variables Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `ADMIN_PASSWORD` - Admin authentication password

#### For other hosting providers:
```bash
npm run build && npm start
```

## Features

- **Event Management**: Display event details, agenda, and schedules
- **Interactive Chatbot**: AI-powered assistance for event information
- **Leaderboard System**: Track and display participant rankings
- **Responsive Design**: Works perfectly on all devices
- **Real-time Data**: Dynamic content updates

## API Endpoints

The server provides the following REST API endpoints:

- `GET /api/leaderboard` - Retrieve leaderboard data
- `POST /api/leaderboard` - Add new leaderboard entry
- `DELETE /api/leaderboard` - Clear leaderboard (password protected)

## Technology Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- React Hot Toast

**Backend:**
- Node.js
- Express.js
- CORS enabled
- JSON file storage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

You can always support this project and inspire us by **Starring🌟 This Repository**
and sharing with friends. If you like the the library consider purchasing [**⚡ TailGrids Pro**](https://tailgrids.com/pricing) to get access to all available premium components.

## 🎁 License

TailGrids React is **100% Free! and open-source** so you can use it with your personal or commercial projects also redistribute with your projects.
