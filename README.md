# urban-logistics-heatmap-extraxter

> 🚦 Real-time demand zone intelligence engine for Uber-like platforms using Puppeteer automation.

## 🧭 Overview

**urban-logistics-heatmap-extraxter** is a browser automation tool built with Puppeteer that identifies, maps, and extracts high-demand zones from ride-hailing or delivery apps. Designed for applications in **urban logistics**, **mobility pricing analysis**, and **infrastructure planning**, this tool enables professionals and researchers to gain actionable insights from dynamic marketplaces.

Whether you're an industrial engineer, data analyst, or logistics strategist, this extractor helps you track where and when demand surges — empowering smarter decisions in fleet deployment, pricing, and resource optimization.

---

## 📌 Key Features

- 🧠 **Headless browser automation** via Puppeteer  
- 🗺️ **Demand heatmap extraction** from Uber-like web platforms  
- 💼 **Session persistence** using `userDataDir` (for avoiding OTP/logins repeatedly)  
- 🌡️ **Zone-level demand tracking** for fare prediction & market research  
- 🧪 **Modular design** for extending to different platforms and data types  

---

## ⚙️ Tech Stack

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/)
- Optional: [2Captcha](https://2captcha.com/) or manual login for OTP/CAPTCHA-based sites

---

## 🛠️ Installation

```bash
git clone https://github.com/yourusername/urban-logistics-heatmap-extraxter.git
cd urban-logistics-heatmap-extraxter
npm install
```

---

## 🚀 Usage

1. **Initial login session (manual)** — solves CAPTCHA/OTP once:

```bash
node login.js
```

2. **Extract heatmap data from high-demand zones**:

```bash
node extract.js
```

3. **Optional:** Configure locations, intervals, or platform-specific selectors in `/config.js`.

---

## 🔒 Authentication Handling

This tool supports login workflows requiring:

- OTP-based phone verification  
- CAPTCHA-solving (manual or via 2Captcha)  
- Session reuse via persistent `./tmp` Chrome profile  

---

## 📂 Project Structure

```
urban-logistics-heatmap-extraxter/
├── config.js              # Platform-specific selectors and URLs
├── login.js               # Handles login/OTP/CAPTCHA
├── extract.js             # Main script to scrape heatmap/demand data
├── utils/
│   └── parser.js          # Extracts coordinates, price zones, or surge data
├── tmp/                   # Saved Chrome session (via userDataDir)
└── README.md              # This file right here
```

---

## 📈 Potential Applications

- Real-time **pricing intelligence** for ride-hailing/delivery services  
- **Fleet optimization** for logistics providers  
- **Urban mobility research** and heatmap visualization  
- **Demand-aware dispatching** and surge response  
- **Infrastructure planning** in smart cities  

---

## 📖 License

MIT License — Use it, modify it, extend it. Commercial use welcome, attribution appreciated.

---

## ✍️ Author

**Mahriar Gharaghani**  
Industrial Engineering Enthusiast • Software Engineer • Mobility Data Nerd  
[LinkedIn](https://linkedin.com/) | [GitHub](https://github.com/yourusername)

---

## 🧠 Side Note

> “You can't optimize what you don't understand. This project helps you understand the urban chaos — one heatmap at a time.”
