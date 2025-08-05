# Snapp Heatmap - Project Structure

## 📁 Complete Folder Structure

```
snapp-heatmap/
├── 📁 scraper/                    # Puppeteer scraping logic
│   ├── 📁 src/
│   │   ├── 📄 scraper.js         # Main scraper class
│   │   ├── 📄 selectors.js       # CSS selectors and constants
│   │   ├── 📄 auth.js            # Authentication logic
│   │   └── 📄 utils.js           # Helper functions
│   ├── 📁 config/
│   │   └── 📄 scraper.config.js  # Scraper configuration
│   ├── 📄 package.json
│   └── 📄 scraper.mjs            # Entry point
├── 📁 workers/                    # Background job processing
│   ├── 📁 src/
│   │   ├── 📄 distance-worker.js # Distance/time enrichment
│   │   ├── 📄 price-worker.js    # Price processing
│   │   └── 📄 queue.js           # Job queue management
│   ├── 📁 config/
│   │   └── 📄 worker.config.js   # Worker configuration
│   ├── 📄 package.json
│   └── 📄 worker.mjs             # Entry point
├── 📁 backend/                    # API server (Next.js)
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js 13+ app directory
│   │   │   ├── 📁 api/           # API routes
│   │   │   │   ├── 📄 routes/
│   │   │   │   │   └── 📄 [id]/
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📄 neighborhoods/
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 health/
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 lib/           # Shared utilities
│   │   │   │   ├── 📄 db.ts      # Database connection
│   │   │   │   ├── 📄 cache.ts   # Redis cache
│   │   │   │   └── 📄 auth.ts    # Authentication
│   │   │   ├── 📁 components/    # Shared components
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 types/             # TypeScript types
│   │   │   └── 📄 index.ts
│   │   └── 📁 middleware/        # Custom middleware
│   │       └── 📄 auth.ts
│   ├── 📄 package.json
│   ├── 📄 next.config.js
│   └── 📄 tsconfig.json
├── 📁 frontend/                   # React client (Next.js)
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js 13+ app directory
│   │   │   ├── 📁 components/    # React components
│   │   │   │   ├── 📄 RouteCard.tsx
│   │   │   │   ├── 📄 SearchForm.tsx
│   │   │   │   ├── 📄 Map.tsx
│   │   │   │   └── 📄 Header.tsx
│   │   │   ├── 📁 hooks/         # Custom React hooks
│   │   │   │   └── 📄 useRoutes.ts
│   │   │   ├── 📁 styles/        # CSS/SCSS files
│   │   │   │   └── 📄 globals.css
│   │   │   ├── 📄 page.tsx       # Home page
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   └── 📁 types/             # TypeScript types
│   │       └── 📄 index.ts
│   ├── 📄 package.json
│   ├── 📄 next.config.js
│   └── 📄 tsconfig.json
├── 📁 db/                         # Database management
│   ├── 📁 migrations/            # Database migrations
│   │   ├── 📄 001_create_routes_table.sql
│   │   ├── 📄 002_create_route_history_table.sql
│   │   ├── 📄 003_create_neighborhoods_table.sql
│   │   └── 📄 004_create_partitions.sql
│   ├── 📁 seeds/                 # Seed data
│   │   ├── 📄 districts.sql
│   │   ├── 📄 neighborhoods.sql
│   │   └── 📄 routes.sql
│   ├── 📁 queries/               # Reusable SQL queries
│   │   ├── 📄 routes.queries.sql
│   │   └── 📄 analytics.queries.sql
│   └── 📄 schema.sql             # Complete schema
├── 📁 config/                     # Configuration files
│   ├── 📄 .env.example           # Environment variables template
│   ├── 📄 database.config.js     # Database configuration
│   ├── 📄 redis.config.js        # Redis configuration
│   └── 📄 api.config.js          # API configuration
├── 📁 docs/                       # Documentation
│   ├── 📄 architecture.md        # System architecture
│   ├── 📄 api.md                 # API documentation
│   ├── 📄 deployment.md          # Deployment guide
│   └── 📄 development.md         # Development setup
├── 📁 scripts/                    # Utility scripts
│   ├── 📄 setup.sh               # Project setup
│   ├── 📄 migrate.sh             # Database migration
│   ├── 📄 seed.sh                # Database seeding
│   └── 📄 deploy.sh              # Deployment script
├── 📄 docker-compose.yml         # Docker services
├── 📄 package.json               # Root package.json
├── 📄 README.md                  # Project overview
└── 📄 .gitignore
```

## 🚀 Key Features of This Structure

### **Modularity**
- Each service (scraper, workers, backend, frontend) is self-contained
- Shared configurations and types are centralized
- Easy to scale individual components

### **Scalability**
- Queue system ready for background processing
- Caching layer with Redis
- Database partitioning support
- Microservices-ready architecture

### **Development Experience**
- TypeScript support throughout
- Hot reloading for development
- Comprehensive documentation
- Docker support for easy deployment

### **Production Ready**
- Environment-based configuration
- Health check endpoints
- Monitoring and logging ready
- Database migrations and seeding

## 🔧 Technology Stack

- **Scraper**: Puppeteer + Node.js
- **Workers**: Node.js + BullMQ (Redis-based queues)
- **Backend**: Next.js 13+ (App Router) + TypeScript
- **Frontend**: Next.js 13+ + React + TypeScript
- **Database**: PostgreSQL with partitioning
- **Cache**: Redis
- **Queue**: BullMQ
- **Deployment**: Docker + Docker Compose 