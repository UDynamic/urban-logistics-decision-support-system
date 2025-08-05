# 🚛 Urban Logistics Decision Support System

A comprehensive urban logistics decision support system for route optimization and analysis, built with modern web technologies and scalable architecture.

## 🌟 Features

- **Real-time Data Collection**: Automated data collection from transportation services using Puppeteer
- **Route Enrichment**: Distance and travel time data from OSRM API
- **Interactive Frontend**: Modern React/Next.js interface with map visualization
- **Scalable Backend**: Next.js API with PostgreSQL and Redis
- **Background Processing**: Queue-based workers for data enrichment
- **Database Partitioning**: Optimized for large-scale data storage
- **Docker Support**: Complete containerization for easy deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Scraper       │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (Puppeteer)   │
│   Port: 3000    │    │   Port: 3001    │    │   Background    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis         │    │   Workers       │
│   Database      │    │   Cache/Queue   │    │   (BullMQ)      │
│   Partitioned   │    │   Port: 6379    │    │   Background    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose (optional)
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd urban-logistics-decision-support-system

# Run the setup script (Linux/Mac)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or run setup manually (Windows)
npm install
npm run docker:up
npm run db:migrate
npm run db:seed
```

### 2. Configure Environment

```bash
# Copy and edit environment variables
cp config/env.example .env
# Edit .env with your configuration
```

### 3. Start Development

```bash
# Start all services
npm run dev

# Or start individual services
npm run dev:scraper   # Start scraper only
npm run dev:workers   # Start workers only
npm run dev:backend   # Start backend API only
npm run dev:frontend  # Start frontend only
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
docker-compose logs -f scraper
```

### Production Deployment

```bash
# Build and start production services
docker-compose --profile production up -d

# Scale workers
docker-compose up -d --scale worker=3
```

## 🛠️ Utility Scripts

### Data Generation

```bash
# Generate neighborhood codes for districts
npm run generate:neighborhood-codes

# Generate routes from districts data
npm run generate:routes
```

### Database Operations

```bash
# Run database migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

## 📁 Project Structure

```
urban-logistics-decision-support-system/
├── scraper/                 # Puppeteer data collection logic
│   ├── src/
│   │   ├── scraper.js      # Main scraper class
│   │   ├── selectors.js    # CSS selectors
│   │   ├── auth.js         # Authentication
│   │   └── utils.js        # Helper functions
│   └── scraper.mjs         # Entry point
├── workers/                 # Background job processing
│   ├── src/
│   │   ├── distance-worker.js
│   │   └── queue.js
│   └── worker.mjs
├── backend/                 # Next.js API
│   ├── src/app/api/        # API routes
│   ├── src/lib/            # Database & utilities
│   └── src/types/          # TypeScript types
├── frontend/                # React client
│   ├── src/app/            # Next.js app directory
│   ├── src/components/     # React components
│   └── src/hooks/          # Custom hooks
├── db/                      # Database management
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Seed data
│   └── schema.sql          # Complete schema
├── config/                  # Configuration files
├── scripts/                 # Utility scripts
│   ├── setup.sh            # Project setup script
│   ├── generate-routes.mjs # Generate routes from districts
│   └── generate-neighborhood-codes.mjs
├── data/                    # Data files
│   ├── Districts.json      # Tehran districts data
│   └── routes.json         # Generated routes
└── docker-compose.yml       # Docker services
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/urban_logistics

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Scraper
SCRAPER_PHONE_NUMBER=your_phone_number
SCRAPER_HEADLESS=true
SCRAPER_MAX_CONCURRENT_BROWSERS=3

# API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_key
OSRM_BASE_URL=https://router.project-osrm.org/route/v1
```

### Database Schema

The application uses a partitioned PostgreSQL database:

- **districts**: Urban district information
- **neighborhoods**: Neighborhood data with coordinates
- **routes**: Route definitions
- **route_history**: Partitioned table for historical data

## 📊 API Endpoints

### Routes API

```bash
# Get latest routes
GET /api/routes

# Get routes by origin
GET /api/routes?origin=D01_N01&limit=50

# Get route history
GET /api/routes/[routeId]?days=7
```

### Neighborhoods API

```bash
# Get all neighborhoods
GET /api/neighborhoods

# Search neighborhoods
GET /api/neighborhoods?search=تهران
```

### Health Check

```bash
GET /api/health
```

## 🔄 Data Pipeline

1. **Data Collection**: Puppeteer collects data from transportation services
2. **Storage**: Data saved to partitioned PostgreSQL table
3. **Enrichment**: Workers fetch distance/time data from OSRM
4. **API**: Backend serves data to frontend
5. **Visualization**: Frontend displays routes with interactive map

## 🚀 Performance Optimizations

- **Database Partitioning**: Monthly partitions for route_history
- **Connection Pooling**: Optimized PostgreSQL connections
- **Redis Caching**: API response caching
- **Concurrent Scraping**: Multiple browser instances
- **Queue Processing**: Background job processing with BullMQ

## 🛠️ Development

### Adding New Features

1. **API Routes**: Add to `backend/src/app/api/`
2. **Components**: Add to `frontend/src/components/`
3. **Database**: Add migrations in `db/migrations/`
4. **Workers**: Add to `workers/src/`

### Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Migrations

```bash
# Create new migration
npm run db:migrate:create

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

## 📈 Monitoring

### Logs

```bash
# View scraper logs
tail -f logs/scraper-combined.log

# View worker logs
tail -f logs/worker-combined.log

# View Docker logs
docker-compose logs -f
```

### Health Checks

- API Health: `GET /api/health`
- Database: Connection pool monitoring
- Redis: Queue status monitoring

## 🔒 Security

- Environment-based configuration
- Input validation with Zod
- Rate limiting on API endpoints
- CORS configuration
- SQL injection prevention

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Configure load balancing

### Scaling

- **Horizontal**: Add more worker instances
- **Vertical**: Increase database resources
- **Caching**: Add Redis cluster
- **CDN**: Add content delivery network

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

- **Issues**: Create GitHub issues
- **Documentation**: Check `/docs` folder
- **API Docs**: Available at `/api/health`

---

**Built with ❤️ for urban logistics optimization**
