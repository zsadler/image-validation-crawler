# Image Validation Crawler
A web application that crawls product pages and validates images against e-commerce best practices. The tool checks image dimensions, file sizes, and aspect ratios for both listing and detail pages.

## Features

- 🔍 Crawls entire web pages for product images
- ✅ Validates image dimensions and file sizes
- 📊 Provides detailed analysis reports
- 🖼️ Supports both listing (800x800px) and detail (1500x1500px) page requirements
- 🎯 Detects both <img> tags and CSS background images
- 💻 Modern Vue.js frontend with TypeScript

## Project Structure
```
image-validation-crawler/
├── index.html           # in root directory
├── public/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── style.css
│   ├── components/
│   │   └── ImageCrawler.vue
│   └── server/
│       ├── index.ts
│       ├── api/
│          └── crawler.ts
│       └── services/
│          └── imageCrawler.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.server.json
└── vite.config.ts
```

### Vite
[Vite](https://vite.dev/guide/) is a modern build tool that serves your code via native ES modules, providing near-instant cold server start and hot module replacement (HMR) during development. It is a great alternative to Webpack and is recommended for Vue.js projects.

#### Compatibility Note
Vite requires Node.js version 18+ or 20+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.

### Setup:

1. Create a new Vite Vue TypeScript project:
```bash
npm create vite@latest image-validation-crawler -- --template vue-ts
cd image-validation-crawler
```

2. Install dependencies:
```bash
npm install
```

To run the project:
```bash
# Development (runs both frontend and backend)
npm run dev

# Or run frontend and backend separately
npm run dev:client
npm run dev:server

# Build for production
npm run build

# Preview production build
npm run preview
```
#### To test the API endpoints, you can use curl or a browser:
```bash
# Test the health endpoint
curl http://localhost:3000/health

# Test the API
curl http://localhost:3000/api/test

# Test the crawler (using curl)
curl -X POST http://localhost:3000/api/crawl \
-H "Content-Type: application/json" \
-d '{"url":"https://example.com","type":"listing"}'
```

## Image Requirements
### Listing Pages

- Dimensions: 800x800 pixels (minimum)
- Aspect ratio: 1:1 (square)
- Maximum file size: 200KB
- Format: JPG, PNG, or WebP recommended

### Detail Pages

- Dimensions: 1500x1500 pixels (minimum)
- Aspect ratio: 1:1 (square)
- Maximum file size: 500KB
- Format: JPG, PNG, or WebP recommended