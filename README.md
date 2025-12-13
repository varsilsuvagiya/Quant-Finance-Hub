# Quant Finance Hub

An AI-powered learning platform for quantitative trading strategies.

Built with Next.js 16 (App Router), TypeScript, MongoDB, NextAuth.js, Tailwind CSS + shadcn-ui, and Groq AI.

**Live Demo:** (will be added after deployment)  
**GitHub:** https://github.com/varsilsuvagiya/Quant-Finance-Hub

---

## Features

### Core Features

- ✅ **User Authentication** - Secure email/password authentication with NextAuth.js
- ✅ **Strategy Management** - Full CRUD operations on trading strategies
- ✅ **AI Strategy Generation** - Generate strategies using Groq AI
- ✅ **Search & Filter** - Search and filter strategies by risk, asset class, and tags
- ✅ **Responsive UI** - Modern, accessible UI with shadcn/ui components
- ✅ **Type Safety** - Full TypeScript with Zod validation

### Additional Features

- ✅ **Email Verification** - Verify user email addresses
- ✅ **Password Reset** - Reset forgotten passwords via email
- ✅ **Strategy Favorites/Bookmarks** - Save favorite strategies
- ✅ **Strategy Sharing/Copying** - Copy public strategies to your collection
- ✅ **Export Strategies** - Export strategies as JSON or CSV
- ✅ **Strategy Templates** - Pre-built strategy templates
- ✅ **Comments on Strategies** - Add and manage comments on public strategies
- ✅ **Ratings on Strategies** - Rate public strategies (1-5 stars)
- ✅ **Public Strategy Marketplace** - Browse and discover community strategies
- ✅ **User Profile** - View account information and statistics

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn-ui
- **Database:** MongoDB + Mongoose
- **Authentication:** NextAuth.js v5 (JWT)
- **Data Fetching:** Tanstack Query
- **AI:** Groq SDK (Llama 3.3 70B)
- **Forms:** React Hook Form + Zod
- **UI Components:** Radix UI + shadcn/ui

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or MongoDB Atlas)
- Groq API key ([Get one here](https://console.groq.com/))

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/varsilsuvagiya/Quant-Finance-Hub.git
   cd quant-finance-hub
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory:

   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/quant-finance-hub
   # Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/quant-finance-hub

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
   NEXTAUTH_URL=http://localhost:3000

   # Groq AI API Key
   GROQ_API_KEY=your-groq-api-key-here
   ```

   Generate `NEXTAUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Testing

### Unit Tests

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

### Integration Tests

Integration tests are included in the test suite and run with:

```bash
npm test
```

### E2E Tests

Run end-to-end tests with Playwright:

```bash
npm run test:e2e
```

Run E2E tests with UI:

```bash
npm run test:e2e:ui
```

---

## Documentation

- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](./docs/TESTING.md)** - Testing documentation and examples
- **[Code Comments Guide](./docs/CODE_COMMENTS.md)** - Code documentation standards
- **[Documentation Index](./docs/README.md)** - All documentation files

---

## Project Structure

```
quant-finance-hub/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # API endpoints
│   │   ├── dashboard/    # Dashboard page
│   │   ├── strategies/   # Strategy pages
│   │   └── templates/    # Templates page
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Custom components
│   ├── lib/              # Utility functions
│   ├── models/           # Mongoose models
│   └── types/            # TypeScript type definitions
├── e2e/                  # End-to-end tests
├── docs/                 # Documentation
└── src/__tests__/        # Unit and integration tests
```

---

## Environment Variables

| Variable          | Description                  | Required              |
| ----------------- | ---------------------------- | --------------------- |
| `MONGODB_URI`     | MongoDB connection string    | Yes                   |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js   | Yes                   |
| `NEXTAUTH_URL`    | Base URL of your application | Yes                   |
| `GROQ_API_KEY`    | API key for Groq AI          | Yes (for AI features) |

---

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage
- `npm run test:e2e` - Run E2E tests

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Developer

**Varsil Suvagiya**

- GitHub: [@varsilsuvagiya](https://github.com/varsilsuvagiya)
- LinkedIn: [varsil-suvagiya](https://www.linkedin.com/in/varsil-suvagiya/)

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Groq](https://groq.com/) - AI inference platform
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
