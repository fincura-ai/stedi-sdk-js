# Stedi SDK for JavaScript/TypeScript

TypeScript SDK for [Stedi's EDI Platform and Healthcare APIs](https://www.stedi.com/docs/). This library provides type-safe wrappers for Stedi's REST APIs, including eligibility checks, transaction management, provider enrollment, and payer lookups.

> [!NOTE]
> This is an unofficial third-party SDK for integrating with Stedi's EDI Platform and Healthcare APIs. It is not affiliated with or endorsed by Stedi. Learn more [about us](#about-us).

[![npm version](https://img.shields.io/npm/v/@fincuratech/stedi-sdk-js.svg)](https://www.npmjs.com/package/@fincuratech/stedi-sdk-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Features

- Complete TypeScript definitions for most API methods and responses
- Transaction management for X12/EDI documents
- Flexible logging with support for custom loggers (Winston, Pino, etc.)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Eligibility](#eligibility)
  - [Payers](#payers)
  - [Providers](#providers)
  - [Enrollment](#enrollment)
  - [Transactions](#transactions)
  - [File Downloads](#file-downloads)
- [TypeScript Support](#typescript-support)
- [Logging](#logging)
- [Contributing](#contributing)
- [License](#license)
- [Resources](#resources)
- [Support](#support)
- [About Us](#about-us)

## Requirements

- Node.js >= 20.x
- TypeScript >= 5.0 (for development)

## Installation

```bash
npm install @fincuratech/stedi-sdk-js
```

or with yarn:

```bash
yarn add @fincuratech/stedi-sdk-js
```

or with pnpm:

```bash
pnpm add @fincuratech/stedi-sdk-js
```

## Quick Start

```typescript
import { createStediClient } from '@fincuratech/stedi-sdk-js';

// Initialize the client with your Stedi API key
const stedi = createStediClient('your-stedi-api-key');

// Check insurance eligibility
const eligibilityResult = await stedi.eligibility.check({
  controlNumber: '123456789',
  tradingPartnerName: 'BCBS',
  tradingPartnerServiceId: 'service-id',
  provider: {
    npi: '1234567890',
    organizationName: 'Example Healthcare',
  },
  subscriber: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-01',
    memberId: 'ABC123456',
  },
});

console.log(eligibilityResult.benefitsInformation);
```

## API Reference

### Eligibility

Check real-time insurance eligibility and benefits with healthcare payers.

#### `eligibility.check(input)`

Sends a real-time eligibility check to payers to verify patient coverage and benefits.

**Parameters:**

```typescript
interface StediEligibilityInput {
  controlNumber: string;
  tradingPartnerName: string;
  tradingPartnerServiceId: string;
  provider: {
    npi: string;
    organizationName: string;
  };
  subscriber?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    memberId: string;
  };
  dependents?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    memberId: string;
  }>;
  encounter?: {
    dateOfService: string;
  };
}
```

**Returns:** `Promise<StediEligibilityResponse>`

**Example:**

```typescript
const eligibility = await stedi.eligibility.check({
  controlNumber: '123456789',
  tradingPartnerName: 'BCBS',
  tradingPartnerServiceId: 'service-id-123',
  provider: {
    npi: '1234567890',
    organizationName: 'Main Street Clinic',
  },
  subscriber: {
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1985-06-15',
    memberId: 'XYZ987654',
  },
  encounter: {
    dateOfService: '2024-01-15',
  },
});

// Access benefits information
eligibility.benefitsInformation.forEach((benefit) => {
  console.log(`Service: ${benefit.serviceTypes?.join(', ')}`);
  console.log(`Coverage Level: ${benefit.coverageLevel}`);
  console.log(`Benefit Amount: ${benefit.benefitAmount}`);
});
```

**Response includes:**
- Benefits information (coverage details, amounts, percentages)
- Plan information (eligibility dates, group numbers)
- Payer contact information
- Provider details
- Subscriber information
- Plan status
- X12 raw response (optional)

[📖 API Documentation](https://www.stedi.com/docs/api-reference/healthcare/post-healthcare-eligibility)

### Payers

Retrieve and search healthcare payers supported by Stedi.

#### `payers.get()`

Get all supported payers.

**Returns:** `Promise<StediPayerItem[]>`

**Example:**

```typescript
const allPayers = await stedi.payers.get();

allPayers.forEach((payer) => {
  console.log(`Payer: ${payer.displayName}`);
  console.log(`Stedi ID: ${payer.stediId}`);
  console.log(`Primary Payer ID: ${payer.primaryPayerId}`);
  console.log('Transaction Support:', payer.transactionSupport);
});
```

#### `payers.search(queryParameters)`

Search for specific payers using query parameters.

**Parameters:**

```typescript
interface SearchParams {
  name?: string;
  state?: string;
  [key: string]: string | number | string[];
}
```

**Returns:** `Promise<StediPayerItem[]>`

**Example:**

```typescript
// Search by name
const bcbsPayers = await stedi.payers.search({
  name: 'Blue Cross',
});

// Search with multiple parameters
const floridaPayers = await stedi.payers.search({
  state: 'FL',
  name: 'Aetna',
});

bcbsPayers.forEach((payer) => {
  console.log(`${payer.displayName} - ${payer.stediId}`);
  console.log(`Eligibility: ${payer.transactionSupport.eligibilityCheck}`);
  console.log(`Claims: ${payer.transactionSupport.professionalClaimSubmission}`);
});
```

**Response includes:**
- Display name and aliases
- Stedi payer ID
- Primary payer ID
- Coverage types
- Transaction support (eligibility, claims, payment, etc.)

[📖 API Documentation](https://www.stedi.com/docs/api-reference/healthcare/get-payers)

### Providers

Create and manage healthcare provider profiles.

#### `provider.create(input)`

Create a new provider profile in Stedi.

**Parameters:**

Each contact must include either `organizationName` **or** `firstName` + `lastName`, but not both.

```typescript
interface StediProviderInput {
  name: string;
  npi: string;
  taxId: string;
  taxIdType: string;
  contacts: StediContact[];
}

// Each contact is one of:
// - Organization: { organizationName, email, phone, streetAddress1, city, state, zipCode, streetAddress2? }
// - Individual:   { firstName, lastName, email, phone, streetAddress1, city, state, zipCode, streetAddress2? }
```

**Returns:** `Promise<StediProviderResponse>`

**Example (individual contact):**

```typescript
const provider = await stedi.provider.create({
  name: 'Main Street Medical Clinic',
  npi: '1234567890',
  taxId: '123456789',
  taxIdType: 'EIN',
  contacts: [
    {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sjohnson@mainstreetmedical.com',
      phone: '555-123-4567',
      streetAddress1: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
  ],
});

console.log(`Provider created with ID: ${provider.id}`);
console.log(`Created at: ${provider.createdAt}`);
```

**Example (organization contact):**

```typescript
const provider = await stedi.provider.create({
  name: 'Main Street Medical Clinic',
  npi: '1234567890',
  taxId: '123456789',
  taxIdType: 'EIN',
  contacts: [
    {
      organizationName: 'Main Street Medical Clinic',
      email: 'admin@mainstreetmedical.com',
      phone: '555-123-4567',
      streetAddress1: '123 Main St',
      streetAddress2: 'Suite 100',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
    },
  ],
});
```

**Response includes:**
- Provider ID
- Name, NPI, Tax ID
- Contact information
- Creation and update timestamps

[📖 API Documentation](https://www.stedi.com/docs/api-reference/healthcare/post-enrollment-create-provider)

### Enrollment

Enroll providers with payers for EDI transactions.

#### `enrollment.create(input)`

Create a provider enrollment with a payer.

**Parameters:**

```typescript
interface StediEnrollmentInput {
  provider: {
    id: string;
  };
  payer: {
    idOrAlias: string;
  };
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  transactions: {
    claimPayment: {
      enroll: boolean;
    };
  };
  source: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PROVISIONING' | 'LIVE' | 'REJECTED' | 'CANCELED';
  userEmail: string;
}
```

**Returns:** `Promise<StediEnrollmentResponse>`

**Example:**

```typescript
const enrollment = await stedi.enrollment.create({
  provider: {
    id: 'provider-123',
  },
  payer: {
    idOrAlias: 'bcbs-florida',
  },
  primaryContact: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@clinic.com',
    phone: '555-987-6543',
    streetAddress1: '456 Oak Ave',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
  },
  transactions: {
    claimPayment: {
      enroll: true,
    },
  },
  source: 'web_portal',
  status: 'SUBMITTED',
  userEmail: 'admin@clinic.com',
});

console.log(`Enrollment ID: ${enrollment.id}`);
console.log(`Status: ${enrollment.status}`);
console.log(`Payer: ${enrollment.payer.name}`);
```

**Response includes:**
- Enrollment ID
- Provider and payer information
- Primary contact details
- Transaction configuration
- Status and timestamps

[📖 API Documentation](https://www.stedi.com/docs/api-reference/healthcare/post-enrollment-create-enrollment)

### Transactions

Manage and retrieve X12/EDI transactions.

#### `transactions.get(transactionId)`

Retrieve a specific transaction by ID.

**Parameters:**
- `transactionId` (string): The unique transaction identifier

**Returns:** `Promise<StediTransactionGetResponse>`

**Example:**

```typescript
const transaction = await stedi.transactions.get('txn_abc123xyz');

console.log(`Transaction ID: ${transaction.transactionId}`);
console.log(`Status: ${transaction.status}`);
console.log(`Direction: ${transaction.direction}`);
console.log(`Processed At: ${transaction.processedAt}`);

// Access artifacts (X12, JSON, PDF, etc.)
transaction.artifacts.forEach((artifact) => {
  console.log(`${artifact.artifactType} - ${artifact.usage}: ${artifact.url}`);
});

// Check for X12 metadata
if (transaction.x12) {
  console.log('Transaction Set:', transaction.x12.metadata.transaction.transactionSetIdentifier);
  console.log('Control Number:', transaction.x12.metadata.transaction.controlNumber);
}
```

#### `transactions.list(params?)`

List transactions with optional pagination.

**Parameters:**

```typescript
interface ListParams {
  pageSize?: number;
  pageToken?: string;
}
```

**Returns:** `Promise<StediTransactionListResponse>`

**Example:**

```typescript
// Get first page of transactions
const firstPage = await stedi.transactions.list({
  pageSize: 50,
});

console.log(`Found ${firstPage.items.length} transactions`);

// Get next page if available
if (firstPage.nextPageToken) {
  const nextPage = await stedi.transactions.list({
    pageSize: 50,
    pageToken: firstPage.nextPageToken,
  });
}
```

#### `transactions.search(params?)`

Search for transactions by business identifiers.

**Parameters:**

```typescript
interface SearchParams {
  businessIdentifier?: string;
}
```

**Returns:** `Promise<StediTransactionListResponse>`

**Example:**

```typescript
const transactions = await stedi.transactions.search({
  businessIdentifier: 'PO-2024-001',
});

transactions.items.forEach((txn) => {
  console.log(`Transaction: ${txn.transactionId}`);
  
  // View business identifiers
  txn.businessIdentifiers?.forEach((id) => {
    console.log(`${id.name}: ${id.value} (${id.element})`);
  });
});
```

**Response includes:**
- Transaction ID and status
- Direction (INBOUND/OUTBOUND)
- Partnership information
- Artifacts (X12, JSON, PDF files)
- Business identifiers
- X12 metadata
- Translation errors (if any)
- Processing timestamps

[📖 API Documentation](https://www.stedi.com/docs/api-reference/edi-platform/core/get-transactions)

### File Downloads

Download files from the Stedi platform.

#### `downloadFile(url)`

Download a file from a Stedi URL.

**Parameters:**
- `url` (string): A valid Stedi URL (must be from `stedi.com` or its subdomains)

**Returns:** `Promise<string>`

**Example:**

```typescript
// Download an artifact from a transaction
const transaction = await stedi.transactions.get('txn_abc123');
const x12Artifact = transaction.artifacts.find(
  (a) => a.artifactType === 'application/edi-x12' && a.usage === 'input'
);

if (x12Artifact) {
  const fileContent = await stedi.downloadFile(x12Artifact.url);
  console.log('X12 Content:', fileContent);
}
```

**Security Note:** The `downloadFile` method validates that URLs are from `stedi.com` or its subdomains to prevent unauthorized access to external resources.

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions.

### Available Types

All request and response types are exported:

```typescript
import type {
  // Eligibility
  StediEligibilityInput,
  StediEligibilityResponse,
  BenefitsInformation,
  
  // Payers
  StediPayerItem,
  StediPayerResponse,
  StediPayerSearchResponse,
  
  // Contact
  StediContact,
  StediContactResponse,

  // Providers
  StediProviderInput,
  StediProviderResponse,
  
  // Enrollment
  StediEnrollmentInput,
  StediEnrollmentResponse,
  StediEnrollmentStatus,
  
  // Transactions
  StediTransactionItem,
  StediTransactionGetResponse,
  StediTransactionListResponse,
  StediX12Metadata,
  
  // Client
  StediClient,
} from '@fincuratech/stedi-sdk-js';
```

### Type-Safe Usage

```typescript
import { createStediClient, type StediEligibilityInput } from '@fincuratech/stedi-sdk-js';

const stedi = createStediClient(process.env.STEDI_API_KEY!);

// TypeScript will validate your input
const input: StediEligibilityInput = {
  controlNumber: '123456789',
  tradingPartnerName: 'BCBS',
  tradingPartnerServiceId: 'service-123',
  provider: {
    npi: '1234567890',
    organizationName: 'Clinic Name',
  },
  subscriber: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1980-01-01',
    memberId: 'ABC123',
  },
};

const result = await stedi.eligibility.check(input);
// TypeScript knows the exact structure of 'result'
```

## Logging

The SDK is **silent by default** in production to avoid cluttering your application logs. However, you can enable logging for debugging or integrate your own logging solution.

### Default Behavior

By default, the SDK uses a no-op logger that doesn't output anything:

```typescript
import { createStediClient } from '@fincuratech/stedi-sdk-js';

const stedi = createStediClient('your-api-key');
// No logging output - silent by default
```

### Enable Console Logging

For development and debugging, you can enable console logging:

```typescript
import { createStediClient, setLogger, createConsoleLogger } from '@fincuratech/stedi-sdk-js';

// Enable console logging at 'debug' level
setLogger(createConsoleLogger('debug'));

const stedi = createStediClient('your-api-key');

// Now you'll see debug logs in the console:
// [stedi-sdk] DEBUG: Stedi API request { method: 'POST', path: '/eligibility', ... }
// [stedi-sdk] DEBUG: Stedi API response { status: 200, ... }
```

Available log levels (from most to least verbose):
- `'debug'` - Shows all logs including request/response details
- `'info'` - Shows informational messages
- `'warn'` - Shows warnings only
- `'error'` - Shows errors only

### Custom Logger Integration

You can integrate any logging framework (Winston, Pino, Bunyan, etc.) by implementing the `Logger` interface:

#### Winston Example

```typescript
import { createStediClient, setLogger, type Logger } from '@fincuratech/stedi-sdk-js';
import winston from 'winston';

// Create your Winston logger
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'stedi-sdk.log' }),
  ],
});

// Adapt Winston to the Logger interface
const stediLogger: Logger = {
  debug: (message, meta) => winstonLogger.debug(message, meta),
  info: (message, meta) => winstonLogger.info(message, meta),
  warn: (message, meta) => winstonLogger.warn(message, meta),
  error: (message, meta) => winstonLogger.error(message, meta),
};

// Set the custom logger
setLogger(stediLogger);

const stedi = createStediClient('your-api-key');
// All SDK logs now go through Winston
```

#### Pino Example

```typescript
import { createStediClient, setLogger, type Logger } from '@fincuratech/stedi-sdk-js';
import pino from 'pino';

const pinoLogger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
  },
});

const stediLogger: Logger = {
  debug: (message, meta) => pinoLogger.debug(meta, message),
  info: (message, meta) => pinoLogger.info(meta, message),
  warn: (message, meta) => pinoLogger.warn(meta, message),
  error: (message, meta) => pinoLogger.error(meta, message),
};

setLogger(stediLogger);

const stedi = createStediClient('your-api-key');
```

### Logger Interface

The SDK defines a simple logger interface that any logging solution can implement:

```typescript
interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}
```

## Contributing

Contributions are welcome. Please follow these guidelines:

### Development Setup

**Use pnpm** - npm has issues with platform-specific native bindings (especially on macOS). Install pnpm globally:

```bash
npm install -g pnpm
# or with Corepack (Node.js 16.9+)
corepack enable
```

Then:

```bash
# Clone
git clone https://github.com/fincura-ai/stedi-sdk-js.git
cd stedi-sdk-js

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linter
pnpm run lint

# Build
pnpm run build
```

### Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation for API changes
- Ensure all tests pass before submitting PRs
- Use conventional commit messages

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for full details.

Copyright (c) 2024 Fincura Technologies, Inc.

## Resources

- [Stedi Documentation](https://www.stedi.com/docs)
- [Stedi Healthcare API Reference](https://www.stedi.com/docs/api-reference/healthcare)
- [Stedi EDI Platform API Reference](https://www.stedi.com/docs/api-reference/edi-platform)

## Support

For issues and questions:

- Open an issue on [GitHub](https://github.com/fincura-ai/stedi-sdk-js/issues)
- Contact Us at [tech@fincura.ai](mailto:tech@fincura.ai)
- Check [Stedi's Support](https://www.stedi.com/support)

## About Us

Developed by [Fincura Technologies, Inc.](https://fincura.ai)

We provide healthcare practices and providers with automated insurance payment reconciliation and posting software, enabling provider staff to get paid 2.5x faster by payers and automate 40 hours per month in payment reconciliations.

Our platform leverages multiple sources to access ERA 835 payment remittance details of health insurance claims, including direct payer integrations and clearinghouse partners like Stedi. This SDK powers our payment reconciliation product by integrating with Stedi's insurance claim and payment remittance APIs.
