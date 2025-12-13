# Code Comments Guide

This document explains the commenting standards used throughout the codebase.

## Comment Types

### JSDoc Comments

Used for functions, classes, and modules. Provides type information and usage examples.

```typescript
/**
 * Brief description of the function
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {Error} When this error occurs
 * @example
 * const result = myFunction('example');
 */
```

### Inline Comments

Used to explain complex logic or non-obvious code.

```typescript
// This comment explains why this code exists
const result = complexCalculation();
```

### Section Comments

Used to organize code into logical sections.

```typescript
// ============================================
// Authentication Helpers
// ============================================
```

## File Structure Comments

Each file should start with a module comment:

```typescript
/**
 * Brief description of what this module does
 * @module path/to/module
 */
```

## Function Documentation

All exported functions should have JSDoc comments:

```typescript
/**
 * Creates a new trading strategy
 * @param {Object} strategyData - Strategy data object
 * @param {string} strategyData.name - Strategy name
 * @param {string} strategyData.description - Strategy description
 * @returns {Promise<Object>} Created strategy object
 * @throws {Error} If validation fails or database error occurs
 */
```

## API Route Documentation

API routes should document:

- HTTP method and path
- Request body/query parameters
- Response format
- Status codes
- Authentication requirements

```typescript
/**
 * POST /api/strategies
 * Create a new trading strategy
 *
 * Request Body:
 * {
 *   "name": "string",
 *   "description": "string",
 *   ...
 * }
 *
 * @returns {Promise<NextResponse>} JSON response
 * @throws {401} Unauthorized
 * @throws {400} Validation error
 */
```

## Component Documentation

React components should document:

- Props interface
- Usage examples
- Special behaviors

```typescript
/**
 * StrategyCard Component
 * Displays a trading strategy in a card format
 *
 * @param {Object} props
 * @param {TradingStrategy} props.strategy - Strategy data
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @example
 * <StrategyCard
 *   strategy={strategy}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
```

## Comment Best Practices

1. **Be Clear and Concise**: Comments should explain "why", not "what"
2. **Keep Comments Updated**: Update comments when code changes
3. **Use JSDoc for Public APIs**: All exported functions should have JSDoc
4. **Explain Complex Logic**: Comment non-obvious algorithms or business logic
5. **Avoid Obvious Comments**: Don't comment self-explanatory code

## Examples

### Good Comments

```typescript
/**
 * Calculate average rating from ratings array
 * Handles edge cases like empty arrays and null values
 */
function calculateAverageRating(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 0;
  // Use reduce to sum all ratings, then divide by count
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}
```

### Bad Comments

```typescript
// Add 1 to count
count = count + 1; // Too obvious, comment not needed
```
