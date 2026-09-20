# SPARQ — Light Up Every Celebration

SPARQ is a production-ready festive fireworks catalogue and WhatsApp-ordering web platform designed specifically for the Indian festive market. Built with high-contrast Deep Maroon (`#2B060B`) and Rich Gold (`#E5B869`) styling inspired by traditional sparklers and crackers.

## Architecture Highlights
- **Zero Customer Authentication Overhead**: Customers add items to cart and check out seamlessly. The final snapshot is formatted into an auto-populated WhatsApp order message with clipboard fallback.
- **Defensive Error Boundaries**: Malformed historical data or missing fields will never produce a blank screen in either the customer or admin interface.
- **Strict Price & Schema Validation**: Selling price can never exceed actual price, and category references are strictly enforced as valid MongoDB ObjectIds.
- **Isolated Admin Authentication**: Protected with secure HttpOnly JWT cookies and password hashing (bcryptjs).
- **Two Delivery Tiers**:
  1. Direct Depot Delivery with Cash on Delivery (COD) for configured local pincodes (`562114`, `563130`).
  2. Standard Courier delivery across configured serviceable pincodes.

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB instance running locally or a MongoDB Atlas URI

### Installation
From the root directory:
```bash
# 1. Install root, server, and client dependencies
npm run install:all
