# MVPLaptopAI Backend

Backend API for a laptop comparison platform.

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB Atlas
- Mongoose
- Zod

## Features

- CRUD operations for laptops
- Advanced filtering (RAM, price, brand)
- Pagination
- Sorting with whitelist validation
- Input validation with Zod

## Endpoints

### Get all laptops
GET /laptops

### Search laptops
GET /laptops/search

Query params:
- brand
- minRam
- maxPriceUSD
- page
- limit
- sortBy
- order

## Run locally

```bash
npm install
npm run dev
