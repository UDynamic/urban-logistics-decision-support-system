# <div align="center">🚛 Urban Logistics Decision Support System

A modern, web-based decision support system designed to help urban logistics professionals **optimize routes and manage service requests efficiently**. 

Built with scalable architecture and modern web technologies, it transforms raw logistics data into actionable insights.


---
## Who Is This For?

- **Cabs, bike couriers, and delivery riders** who juggle multiple service requests daily.  
- Anyone struggling to **decide the optimal set of services** to accept from a pool of requests.  
- Professionals looking to **maximize efficiency, reduce travel time, and increase daily earnings**.

---

## What Problem Does It Solve?

Urban logistics is complex: multiple service requests, changing priorities, and dynamic urban traffic patterns make decision-making hard. This system **targets a list of routs chosen by the client and demonstrates the live status plus historical patterns of those routes**.

---


## <div align="center">🌟 Features


- **Route Optimization:** Calculate the fastest and most efficient routes.  
- **Service Prioritization:** Automatically suggest the best services to accept.  
- **Real-time Data Collection**: Automated data collection from transportation services using Puppeteer
- **Route Enrichment**: Distance and travel time data from OSRM API
- **Interactive Frontend**: Modern React/Next.js interface with map visualization
- **Scalable Backend**: Next.js API with PostgreSQL and Redis
- **Background Processing**: Queue-based workers for data enrichment
- **Database Partitioning**: Optimized for large-scale data storage
- **Docker Support**: Complete containerization for easy deployment

## <div align="center">🏗️ Architecture
!!! . to be updated !!! 
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
---
# <div align="center">⚙️ Technical Stack ⚙️</div>

## 1. Frontend

### 1.1 Frontend Framework 

React + Next.js offers the best balance of **developer experience, scalability, performance, and ecosystem support**, making it the optimal choice for the frontend of this project.  

Available frontend frameworks considered for this project:  

1. **React** – Popular, component-based library with a large ecosystem and strong community support. Excellent for building dynamic UIs.  
2. **Vue.js** – Lightweight framework with reactive data binding and simple learning curve. Good for small-to-medium projects.  
3. **Angular** – Full-featured framework with built-in routing, forms, and dependency injection. Strong TypeScript support but steeper learning curve.  
4. **Svelte** – Compiler-based framework offering highly optimized output. Less mature ecosystem compared to React and Vue.  

Here’s why **React with Next.js** was chosen for the frontend:

- **Component-Based Architecture**  
  React’s modular components make UI development and maintenance scalable and reusable across the project.  

- **Performance & SEO (Next.js)**  
  Next.js provides server-side rendering (SSR) and static site generation (SSG), improving performance and SEO compared to plain React.  

- **Ecosystem & Community**  
  React has a massive ecosystem of libraries, tools, and developer support. Next.js enhances it with routing, API routes, and full-stack capabilities.  

- **Scalability & Flexibility**  
  The combination allows gradual adoption of advanced features like incremental static regeneration, API routes, and edge functions without locking into a rigid framework.  


### 1.2 State Management

While **Context API**, **SWR**, and **React Query** each serve specific use cases, for long-term scalability, maintainability, and consistency, **Redux Toolkit** provides the most robust and future-proof solution.  


Available strategies for managing client state:  

1. **Context API** – Built into React, good for simple state sharing, but scales poorly with complex applications.  
2. **SWR** – Lightweight library focused on data fetching and caching; lacks full global state control.  
3. **React Query** – Excellent for server state management, caching, and synchronization, but limited for broader application state.  
4. **Redux Toolkit (RTK)** – Centralized, predictable state container with rich ecosystem, DevTools, and middleware support.  

Here’s why **Redux Toolkit** was chosen over alternatives:

- **Unified State Management**  
  Manages both UI and server state in a single predictable store. No fragmentation between client and server logic.  

- **Team Scalability**  
  Standardized patterns, DevTools integration, and a mature ecosystem make onboarding and scaling smoother.  

- **Flexibility & Control**  
  Unlike Context API, SWR, or React Query, Redux gives full control over caching, normalization, and invalidation.  

- **Future-Proof**  
  Widely adopted, stable, and adaptable to evolving requirements — unlike niche-focused solutions.  

- **RTK Query Advantage**  
  Integrates React Query–like features *inside Redux*, offering advanced server-state management without adding another library.  

### 1.3. Styling / UI Framework

By combining **Material UI, shadcn/ui, and Tailwind CSS**, the project achieves a **balance of speed, flexibility, and consistency**, enabling rapid development of both standard and custom UI components while maintaining a maintainable and scalable styling architecture.


Available frontend styling and component framework options considered:  

1. **Material UI (MUI)** – Comprehensive React component library with prebuilt components, responsive design, and strong theming support.  
2. **Tailwind CSS** – Utility-first CSS framework allowing fine-grained, low-level styling with high flexibility and low bundle overhead.  
3. **Bootstrap** – Popular component library with grid system, but heavier and less flexible for modern React projects.  
4. **Chakra UI** – Accessible, composable React component library with built-in theming; lighter alternative to MUI.  
5. **shadcn/ui** – Headless component primitives for React built with Tailwind, allowing custom design without losing accessibility.  


Here’s why the combination **Material UI, shadcn/ui, and Tailwind CSS** was chosen for the project:  

- **Rapid Development with Prebuilt Components (Material UI)**  
  MUI provides a rich set of prebuilt, customizable components that accelerate UI development while ensuring accessibility and responsiveness.  

- **Custom Design Flexibility (Tailwind + shadcn/ui)**  
  Tailwind CSS allows utility-based styling for pixel-perfect layouts, while shadcn/ui provides headless components that integrate seamlessly with Tailwind for full design control.  

- **Consistency and Theming**  
  MUI’s theming system ensures consistent colors, typography, and spacing across the application, while Tailwind and shadcn/ui enable fine-grained adjustments when needed.  

- **Developer Productivity**  
  The combination balances rapid prototyping with flexibility: MUI for standard components, Tailwind + shadcn/ui for custom components, reducing repetitive CSS writing.  

- **Community Support & Ecosystem**  
  All three technologies have strong community support, good documentation, and maintainable patterns for long-term project growth.  
  

---

## 2. Backend

### 2.1 Backend Framework 
Available backend frameworks considered for this project:  

1. **Express.js** – Minimal and flexible Node.js framework, widely adopted, integrates well with JavaScript/TypeScript stack.  
2. **NestJS** – Full-featured, structured Node.js framework with strong TypeScript support and modular architecture.  
3. **Django** – Python-based framework with built-in ORM, authentication, and admin panel. Powerful but requires switching language from frontend JS.  
4. **Flask** – Lightweight Python framework, simple to set up, but lacks batteries-included features of Django.  

Here’s why **Express.js** was chosen for the backend:

- **Unified Language Stack**  
  Using JavaScript/TypeScript on both frontend (React + Next.js) and backend simplifies development and reduces context switching for the team.  

- **Integration with Puppeteer**  
  The scrapper in this project is written in Puppeteer (Node.js). Express.js allows seamless integration without bridging different languages or environments.  

- **Simplicity & Flexibility**  
  Express.js is minimal and unopinionated, giving full control over routing, middleware, and API design without overhead.  

- **Performance & Ecosystem**  
  Node.js and Express.js are performant for I/O-heavy operations (like scraping, API requests) and have a mature ecosystem of packages for logging, authentication, and validation.  

- **Scalability & Community Support**  
  Widely adopted with strong community support, making it easy to maintain, scale, and onboard new developers.  

✅ **Summary**  
Express.js provides the **best balance of simplicity, performance, and language unification** for this project. Its native compatibility with Puppeteer and the JavaScript stack makes it the optimal choice for the backend.  

---
## 3. Databases
Available database options considered for this project:  

1. **MongoDB** – NoSQL document-oriented database, flexible schema, ideal for JSON-like, unstructured, or rapidly evolving data.  
2. **PostgreSQL** – Relational SQL database with ACID compliance, strong query capabilities, and support for complex relationships.  
3. **Redis** – In-memory key-value store, ideal for caching, session storage, and fast lookups.  
4. **MySQL** – Relational SQL database, reliable but less feature-rich than PostgreSQL for advanced queries.  
5. **SQLite** – Lightweight file-based SQL database, suited for prototyping or small projects.  

Here’s why the combination of **MongoDB, PostgreSQL, and Redis** was chosen:

- **Flexible & Rapidly Changing Data (MongoDB)**  
  MongoDB stores **scraped price data**, which may have varying fields, frequent updates, and semi-structured JSON objects. Its flexible schema allows rapid iteration without migration overhead.  

- **Structured & Transactional Data (PostgreSQL)**  
  PostgreSQL stores **critical user data, roles, permissions, and relational entities**. Its ACID compliance ensures data integrity for authentication, access control, and transactional operations.  

- **High-Performance Caching (Redis)**  
  Redis caches **frequently accessed data**, such as latest price snapshots, aggregated queries, or session information, enabling **fast response times** for the frontend.  

- **Optimized Data Access per Use Case**  
  - MongoDB → raw price data from the scraper  
  - PostgreSQL → structured, relational data for user management and application rules  
  - Redis → ephemeral, high-speed cache for hot data and computed aggregations  

- **Scalability & Reliability**  
  This combination leverages **the strengths of each database**: MongoDB for flexible, high-write data, PostgreSQL for transactional reliability, and Redis for ultra-fast in-memory access. All three have mature ecosystems and horizontal scaling capabilities.  

✅ **Summary**  
By combining **MongoDB, PostgreSQL, and Redis**, the project achieves **optimal performance, flexibility, and reliability**. Each database is used where it’s most effective: MongoDB for evolving scraped data, PostgreSQL for structured user and transactional data, and Redis for high-speed caching and session management, ensuring a fast and robust full-stack architecture.  

---

## 4. Scrapers & Crawlers
Available tools and strategies for web scraping:  

1. **BeautifulSoup (Python)** – Lightweight HTML/XML parser, good for static pages, but limited for modern JavaScript-heavy sites.  
2. **Scrapy (Python)** – Powerful, scalable crawling framework, but requires Python stack and extra setup.  
3. **Selenium (Multi-language)** – Browser automation tool, versatile but slower for large-scale scraping.  
4. **Cheerio (Node.js)** – Fast HTML parser for static content, but lacks full browser simulation.  
5. **Puppeteer (Node.js)** – Headless Chrome/Chromium automation tool, excellent for dynamic and JavaScript-rendered pages.  
6. **Playwright (Multi-language)** – Modern browser automation library, supports multiple browsers, good alternative to Puppeteer.  

Here’s why **Puppeteer** was chosen and later **upgraded to Puppeteer Cluster**:

- **Lack of Direct API Access**  
  Service providers do not expose official APIs for price data. Scraping is necessary to **extract structured information** from their web interfaces.  

- **Same Language as Backend (Node.js)**  
  Puppeteer integrates seamlessly with the **Express.js backend** since both are JavaScript-based. This avoids the overhead of running a separate Python stack (Scrapy, BeautifulSoup).  

- **Dynamic Content Handling**  
  Puppeteer renders **JavaScript-heavy pages**, clicks through navigation, and extracts data from sites that do not expose their data in static HTML.  

- **🚀 Initial Implementation with Vanilla Puppeteer**  
  A **basic Puppeteer script** was first implemented to prove feasibility and validate data extraction.  
  - ✅ Successfully scraped required information.  
  - ⚠️ However, performance was limited — running sequentially on a single browser instance made it **too slow for larger datasets**.  

- **Upgrade to Puppeteer Cluster**  
  To address performance bottlenecks, the scraper was upgraded to **Puppeteer Cluster**, which enables **concurrent browser instances**.  
  - Parallel scraping tasks improve throughput significantly.  
  - Automatic task queue and error handling.  
  - Optimized resource usage for large-scale scraping.  

- **Scalability for Future Loads**  
  With Puppeteer Cluster, the scraper can scale horizontally, handling multiple sites, user roles, or price sources simultaneously.  

✅ **Summary**  
The project uses **Puppeteer** because of its seamless integration with the Node.js backend and ability to handle dynamic websites. After confirming functionality with **vanilla Puppeteer**, the implementation was **upgraded to Puppeteer Cluster** for concurrency, efficiency, and performance, ensuring scalable and reliable large-scale data extraction.  

---

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
