# Testing Guide

## Overview

This project includes comprehensive testing at three levels:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API routes and database interactions
- **E2E Tests**: Test complete user flows

---

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## Test Structure

```
src/
├── __tests__/
│   ├── lib/              # Utility function tests
│   ├── components/       # Component tests
│   ├── api/              # API route tests
│   └── integration/      # Integration tests
e2e/
├── auth.spec.ts          # Authentication E2E tests
└── strategies.spec.ts    # Strategy management E2E tests
```

---

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
import { POST } from "@/app/api/strategies/route";

describe("POST /api/strategies", () => {
  it("creates a strategy", async () => {
    const request = new Request("http://localhost/api/strategies", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("user can create strategy", async ({ page }) => {
  await page.goto("/dashboard");
  await page.click('button:has-text("Create Strategy")');
  // ... test steps
});
```

---

## Test Coverage Goals

- **Unit Tests**: 70%+ coverage
- **Integration Tests**: All API routes
- **E2E Tests**: Critical user flows

---

## Mocking

### Mocking Next.js

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
```

### Mocking NextAuth

```typescript
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "1" } } }),
}));
```

---

## Best Practices

1. **Test Behavior, Not Implementation**: Test what the code does, not how
2. **Use Descriptive Test Names**: Test names should describe what is being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Mock External Dependencies**: Mock API calls, database, etc.

---

## Continuous Integration

Tests run automatically on:

- Pull requests
- Commits to main branch
- Before deployment

---

## Troubleshooting

### Tests Failing

1. Clear Jest cache: `npm test -- --clearCache`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check environment variables are set

### E2E Tests Failing

1. Ensure dev server is running: `npm run dev`
2. Check Playwright is installed: `npx playwright install`
3. Verify test selectors are correct
