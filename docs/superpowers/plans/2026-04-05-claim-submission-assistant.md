# Claim Submission Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered multi-step claim submission wizard for internal insurance agents, with smart data extraction from free text and AI validation before submission.

**Architecture:** Turborepo monorepo with Next.js 14 (App Router) frontend, NestJS backend, shared Zod schemas package. PostgreSQL via Prisma ORM. OpenAI GPT-4o for structured extraction and validation.

**Tech Stack:** TypeScript, Next.js 14, NestJS 10, Turborepo, Prisma 6, PostgreSQL, OpenAI SDK, Zod, Tailwind CSS, Jest

**Spec:** `docs/superpowers/specs/2026-04-05-claim-submission-assistant-design.md`

---

## File Structure

```
claims-assistant/
├── package.json                          # Root workspace config
├── turbo.json                            # Turborepo pipeline config
├── tsconfig.json                         # Base TS config
├── .env.example                          # Env template
├── .gitignore
├── apps/
│   ├── api/                              # NestJS backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── nest-cli.json
│   │   ├── prisma/
│   │   │   └── schema.prisma            # Database schema
│   │   ├── src/
│   │   │   ├── main.ts                  # Bootstrap
│   │   │   ├── app.module.ts            # Root module
│   │   │   ├── prisma/
│   │   │   │   ├── prisma.service.ts    # Prisma client wrapper
│   │   │   │   └── prisma.module.ts     # Prisma module
│   │   │   ├── claims/
│   │   │   │   ├── claims.module.ts
│   │   │   │   ├── claims.controller.ts # CRUD + submit endpoints
│   │   │   │   ├── claims.service.ts    # Business logic
│   │   │   │   └── claims.controller.spec.ts
│   │   │   ├── ai/
│   │   │   │   ├── ai.module.ts
│   │   │   │   ├── ai.controller.ts     # /ai/extract, /ai/validate
│   │   │   │   ├── ai.service.ts        # OpenAI integration
│   │   │   │   └── ai.service.spec.ts
│   │   │   └── documents/
│   │   │       ├── documents.module.ts
│   │   │       ├── documents.controller.ts
│   │   │       └── documents.service.ts
│   │   └── test/
│   │       └── claims.e2e-spec.ts       # Integration tests
│   └── web/                              # Next.js frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── src/
│       │   └── app/
│       │       ├── layout.tsx           # Root layout
│       │       ├── page.tsx             # Home/dashboard
│       │       ├── globals.css          # Tailwind imports
│       │       └── claims/
│       │           └── new/
│       │               ├── page.tsx     # Wizard page
│       │               ├── components/
│       │               │   ├── ClaimWizard.tsx        # Wizard container
│       │               │   ├── StepIndicator.tsx      # Progress stepper
│       │               │   ├── Step1TypeDescription.tsx
│       │               │   ├── Step2ClaimantInfo.tsx
│       │               │   ├── Step3IncidentDetails.tsx
│       │               │   ├── Step4Documents.tsx
│       │               │   ├── Step5ReviewSubmit.tsx
│       │               │   └── AiBadge.tsx            # AI-filled indicator
│       │               ├── hooks/
│       │               │   └── useClaimWizard.ts      # Form state + API calls
│       │               └── types.ts                   # Frontend-specific types
│       └── public/
└── packages/
    └── shared/                           # Shared types + Zod schemas
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts                  # Barrel export
            ├── schemas/
            │   ├── claim.schema.ts       # Claim Zod schemas
            │   ├── claimant.schema.ts    # Claimant schemas
            │   ├── claim-details.schema.ts # Type-specific detail schemas
            │   └── ai.schema.ts          # AI request/response schemas
            ├── types/
            │   └── index.ts              # Inferred TypeScript types
            └── enums.ts                  # Shared enums
```

---

## Task 1: Turborepo Monorepo Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `turbo.json`
- Create: `tsconfig.json` (root base)
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Initialize git repository**

```bash
cd "D:/Apps/New folder"
git init
```

- [ ] **Step 2: Create root package.json**

Create `package.json`:
```json
{
  "name": "claims-assistant",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:migrate": "npm -w api run db:migrate",
    "db:generate": "npm -w api run db:generate",
    "db:studio": "npm -w api run db:studio"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 3: Create turbo.json**

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

- [ ] **Step 4: Create root tsconfig.json**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
.next/
.turbo/
*.tsbuildinfo
.env
.env.local
coverage/
uploads/
```

- [ ] **Step 6: Create .env.example**

Create `.env.example`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/claims_assistant?schema=public"
OPENAI_API_KEY="sk-your-key-here"
API_PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

- [ ] **Step 7: Commit**

```bash
git add package.json turbo.json tsconfig.json .gitignore .env.example
git commit -m "chore: scaffold turborepo monorepo root"
```

---

## Task 2: Shared Package — Enums, Zod Schemas, Types

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/enums.ts`
- Create: `packages/shared/src/schemas/claim.schema.ts`
- Create: `packages/shared/src/schemas/claimant.schema.ts`
- Create: `packages/shared/src/schemas/claim-details.schema.ts`
- Create: `packages/shared/src/schemas/ai.schema.ts`
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create shared package.json**

Create `packages/shared/package.json`:
```json
{
  "name": "@claims-assistant/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "echo 'no lint configured'"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 2: Create shared tsconfig.json**

Create `packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 3: Create enums**

Create `packages/shared/src/enums.ts`:
```typescript
export enum ClaimType {
  AUTO = 'AUTO',
  PROPERTY = 'PROPERTY',
  HEALTH = 'HEALTH',
  OTHER = 'OTHER',
}

export enum ClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ClaimPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ValidationIssueType {
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
```

- [ ] **Step 4: Create claim schema**

Create `packages/shared/src/schemas/claim.schema.ts`:
```typescript
import { z } from 'zod';
import { ClaimType, ClaimStatus, ClaimPriority } from '../enums';

export const createClaimSchema = z.object({
  type: z.nativeEnum(ClaimType),
  description: z.string().min(1, 'Description is required'),
  incidentDate: z.string().datetime().optional(),
  estimatedAmount: z.number().min(0).optional(),
  priority: z.nativeEnum(ClaimPriority).optional().default(ClaimPriority.MEDIUM),
  createdBy: z.string().min(1, 'Agent ID is required'),
});

export const updateClaimSchema = z.object({
  type: z.nativeEnum(ClaimType).optional(),
  description: z.string().min(1).optional(),
  incidentDate: z.string().datetime().optional(),
  estimatedAmount: z.number().min(0).optional(),
  priority: z.nativeEnum(ClaimPriority).optional(),
});

export const claimResponseSchema = z.object({
  id: z.string().uuid(),
  claimNumber: z.string(),
  type: z.nativeEnum(ClaimType),
  status: z.nativeEnum(ClaimStatus),
  priority: z.nativeEnum(ClaimPriority),
  description: z.string(),
  incidentDate: z.string().datetime().nullable(),
  reportDate: z.string().datetime(),
  estimatedAmount: z.number().nullable(),
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

- [ ] **Step 5: Create claimant schema**

Create `packages/shared/src/schemas/claimant.schema.ts`:
```typescript
import { z } from 'zod';

export const claimantSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().default(''),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  policyNumber: z.string().min(1, 'Policy number is required'),
});

export const claimantResponseSchema = claimantSchema.extend({
  id: z.string().uuid(),
  claimId: z.string().uuid(),
});
```

- [ ] **Step 6: Create claim details schema**

Create `packages/shared/src/schemas/claim-details.schema.ts`:
```typescript
import { z } from 'zod';
import { ClaimType } from '../enums';

export const autoDetailsSchema = z.object({
  vehicleMake: z.string().optional().default(''),
  vehicleModel: z.string().optional().default(''),
  vehicleYear: z.string().optional().default(''),
  licensePlate: z.string().optional().default(''),
  otherPartyName: z.string().optional().default(''),
  otherPartyInsurance: z.string().optional().default(''),
  policeReportNumber: z.string().optional().default(''),
  accidentLocation: z.string().optional().default(''),
});

export const propertyDetailsSchema = z.object({
  propertyAddress: z.string().optional().default(''),
  damageType: z.string().optional().default(''),
  roomsAffected: z.string().optional().default(''),
  propertyType: z.string().optional().default(''),
  estimatedRepairCost: z.number().optional(),
});

export const healthDetailsSchema = z.object({
  providerName: z.string().optional().default(''),
  diagnosis: z.string().optional().default(''),
  treatmentDate: z.string().optional().default(''),
  treatmentType: z.string().optional().default(''),
  facilityName: z.string().optional().default(''),
});

export const otherDetailsSchema = z.object({
  category: z.string().optional().default(''),
  additionalInfo: z.string().optional().default(''),
});

export const claimDetailsSchema = z.object({
  detailType: z.nativeEnum(ClaimType),
  data: z.union([autoDetailsSchema, propertyDetailsSchema, healthDetailsSchema, otherDetailsSchema]),
});

export const claimDetailsDataMap = {
  [ClaimType.AUTO]: autoDetailsSchema,
  [ClaimType.PROPERTY]: propertyDetailsSchema,
  [ClaimType.HEALTH]: healthDetailsSchema,
  [ClaimType.OTHER]: otherDetailsSchema,
} as const;
```

- [ ] **Step 7: Create AI schemas**

Create `packages/shared/src/schemas/ai.schema.ts`:
```typescript
import { z } from 'zod';
import { ClaimType, ClaimPriority, ValidationIssueType } from '../enums';

export const aiExtractRequestSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  claimType: z.nativeEnum(ClaimType),
});

export const aiExtractedFieldSchema = z.object({
  value: z.unknown(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export const aiExtractionResponseSchema = z.object({
  claimant: z.object({
    firstName: aiExtractedFieldSchema.optional(),
    lastName: aiExtractedFieldSchema.optional(),
    email: aiExtractedFieldSchema.optional(),
    phone: aiExtractedFieldSchema.optional(),
    address: aiExtractedFieldSchema.optional(),
    policyNumber: aiExtractedFieldSchema.optional(),
  }),
  claim: z.object({
    incidentDate: aiExtractedFieldSchema.optional(),
    estimatedAmount: aiExtractedFieldSchema.optional(),
    priority: aiExtractedFieldSchema.optional(),
  }),
  details: z.record(z.string(), aiExtractedFieldSchema).optional(),
  overallConfidence: z.number().min(0).max(1),
});

export const aiValidateRequestSchema = z.object({
  claim: z.object({
    type: z.nativeEnum(ClaimType),
    description: z.string(),
    incidentDate: z.string().nullable().optional(),
    estimatedAmount: z.number().nullable().optional(),
    priority: z.nativeEnum(ClaimPriority).optional(),
  }),
  claimant: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    policyNumber: z.string(),
  }),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const validationIssueSchema = z.object({
  type: z.nativeEnum(ValidationIssueType),
  field: z.string(),
  message: z.string(),
});

export const aiValidationResponseSchema = z.object({
  issues: z.array(validationIssueSchema),
  summary: z.string(),
});
```

- [ ] **Step 8: Create types barrel export**

Create `packages/shared/src/types/index.ts`:
```typescript
import { z } from 'zod';
import { createClaimSchema, updateClaimSchema, claimResponseSchema } from '../schemas/claim.schema';
import { claimantSchema, claimantResponseSchema } from '../schemas/claimant.schema';
import {
  autoDetailsSchema,
  propertyDetailsSchema,
  healthDetailsSchema,
  otherDetailsSchema,
  claimDetailsSchema,
} from '../schemas/claim-details.schema';
import {
  aiExtractRequestSchema,
  aiExtractionResponseSchema,
  aiExtractedFieldSchema,
  aiValidateRequestSchema,
  aiValidationResponseSchema,
  validationIssueSchema,
} from '../schemas/ai.schema';

// Claim types
export type CreateClaimDto = z.infer<typeof createClaimSchema>;
export type UpdateClaimDto = z.infer<typeof updateClaimSchema>;
export type ClaimResponse = z.infer<typeof claimResponseSchema>;

// Claimant types
export type ClaimantDto = z.infer<typeof claimantSchema>;
export type ClaimantResponse = z.infer<typeof claimantResponseSchema>;

// Claim details types
export type AutoDetails = z.infer<typeof autoDetailsSchema>;
export type PropertyDetails = z.infer<typeof propertyDetailsSchema>;
export type HealthDetails = z.infer<typeof healthDetailsSchema>;
export type OtherDetails = z.infer<typeof otherDetailsSchema>;
export type ClaimDetailsDto = z.infer<typeof claimDetailsSchema>;

// AI types
export type AiExtractRequest = z.infer<typeof aiExtractRequestSchema>;
export type AiExtractionResponse = z.infer<typeof aiExtractionResponseSchema>;
export type AiExtractedField = z.infer<typeof aiExtractedFieldSchema>;
export type AiValidateRequest = z.infer<typeof aiValidateRequestSchema>;
export type AiValidationResponse = z.infer<typeof aiValidationResponseSchema>;
export type ValidationIssue = z.infer<typeof validationIssueSchema>;
```

- [ ] **Step 9: Create barrel index**

Create `packages/shared/src/index.ts`:
```typescript
// Enums
export * from './enums';

// Schemas
export * from './schemas/claim.schema';
export * from './schemas/claimant.schema';
export * from './schemas/claim-details.schema';
export * from './schemas/ai.schema';

// Types
export * from './types/index';
```

- [ ] **Step 10: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared package with Zod schemas, types, and enums"
```

---

## Task 3: NestJS API — Scaffolding + Prisma Setup

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.build.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Create API package.json**

Create `apps/api/package.json`:
```json
{
  "name": "api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "echo 'no lint configured'",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@claims-assistant/shared": "*",
    "@nestjs/common": "^10.4.15",
    "@nestjs/config": "^3.2.0",
    "@nestjs/core": "^10.4.15",
    "@nestjs/platform-express": "^10.4.15",
    "@prisma/client": "^6.19.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "multer": "^1.4.5-lts.1",
    "openai": "^4.70.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.2",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.1",
    "@nestjs/schematics": "^10.1.1",
    "@nestjs/testing": "^10.4.15",
    "@types/express": "^4.17.21",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.11.5",
    "jest": "^29.7.0",
    "prisma": "^6.19.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@claims-assistant/shared$": "<rootDir>/../../packages/shared/src"
    }
  }
}
```

- [ ] **Step 2: Create API tsconfig files**

Create `apps/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  }
}
```

Create `apps/api/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 3: Create nest-cli.json**

Create `apps/api/nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create Prisma schema**

Create `apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ClaimType {
  AUTO
  PROPERTY
  HEALTH
  OTHER
}

enum ClaimStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
}

enum ClaimPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Claim {
  id              String        @id @default(uuid())
  claimNumber     String        @unique
  type            ClaimType
  status          ClaimStatus   @default(DRAFT)
  priority        ClaimPriority @default(MEDIUM)
  description     String
  incidentDate    DateTime?
  reportDate      DateTime      @default(now())
  estimatedAmount Float?
  createdBy       String

  claimant        Claimant?
  claimDetails    ClaimDetails?
  documents       ClaimDocument[]
  aiLogs          AIExtractionLog[]

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("claims")
}

model Claimant {
  id           String @id @default(uuid())
  claimId      String @unique
  firstName    String
  lastName     String
  email        String @default("")
  phone        String @default("")
  address      String @default("")
  policyNumber String

  claim        Claim  @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@map("claimants")
}

model ClaimDetails {
  id         String    @id @default(uuid())
  claimId    String    @unique
  detailType ClaimType
  data       Json

  claim      Claim     @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@map("claim_details")
}

model ClaimDocument {
  id         String   @id @default(uuid())
  claimId    String
  fileName   String
  fileType   String
  filePath   String
  uploadedAt DateTime @default(now())

  claim      Claim    @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@map("claim_documents")
}

model AIExtractionLog {
  id            String   @id @default(uuid())
  claimId       String?
  inputText     String
  extractedData Json
  confidence    Float
  model         String
  createdAt     DateTime @default(now())

  claim         Claim?   @relation(fields: [claimId], references: [id], onDelete: SetNull)

  @@map("ai_extraction_logs")
}
```

- [ ] **Step 5: Create PrismaService**

Create `apps/api/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `apps/api/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 6: Create main.ts and app.module.ts**

Create `apps/api/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  });
  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
```

Create `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Install dependencies and generate Prisma client**

```bash
cd "D:/Apps/New folder"
npm install
cd apps/api
npx prisma generate
```

- [ ] **Step 8: Run initial migration**

```bash
cd "D:/Apps/New folder/apps/api"
npx prisma migrate dev --name init
```

Expected: Migration applied, Prisma client generated.

- [ ] **Step 9: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/api/
git commit -m "feat: scaffold NestJS API with Prisma and PostgreSQL schema"
```

---

## Task 4: Claims CRUD Module

**Files:**
- Create: `apps/api/src/claims/claims.module.ts`
- Create: `apps/api/src/claims/claims.service.ts`
- Create: `apps/api/src/claims/claims.controller.ts`
- Create: `apps/api/src/claims/claims.controller.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing test for claims service**

Create `apps/api/src/claims/claims.controller.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimType, ClaimPriority } from '@claims-assistant/shared';

describe('ClaimsController', () => {
  let controller: ClaimsController;
  let service: ClaimsService;

  const mockPrismaService = {
    claim: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    claimant: {
      upsert: jest.fn(),
    },
    claimDetails: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClaimsController],
      providers: [
        ClaimsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<ClaimsController>(ClaimsController);
    service = module.get<ClaimsService>(ClaimsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a draft claim', async () => {
      const dto = {
        type: ClaimType.AUTO,
        description: 'Car accident on highway',
        createdBy: 'agent-001',
      };

      const expected = {
        id: 'uuid-1',
        claimNumber: 'CLM-2026-00001',
        type: ClaimType.AUTO,
        status: 'DRAFT',
        priority: ClaimPriority.MEDIUM,
        description: dto.description,
        incidentDate: null,
        reportDate: new Date().toISOString(),
        estimatedAmount: null,
        createdBy: dto.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPrismaService.claim.create.mockResolvedValue(expected);
      mockPrismaService.claim.count.mockResolvedValue(0);

      const result = await controller.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrismaService.claim.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a claim by id', async () => {
      const expected = {
        id: 'uuid-1',
        claimNumber: 'CLM-2026-00001',
        type: ClaimType.AUTO,
        status: 'DRAFT',
        claimant: null,
        claimDetails: null,
        documents: [],
      };

      mockPrismaService.claim.findUnique.mockResolvedValue(expected);

      const result = await controller.findOne('uuid-1');
      expect(result).toEqual(expected);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "D:/Apps/New folder/apps/api"
npx jest src/claims/claims.controller.spec.ts --no-coverage
```

Expected: FAIL — ClaimsController and ClaimsService not found.

- [ ] **Step 3: Create ClaimsService**

Create `apps/api/src/claims/claims.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto, UpdateClaimDto, ClaimantDto, ClaimDetailsDto } from '@claims-assistant/shared';

@Injectable()
export class ClaimsService {
  constructor(private prisma: PrismaService) {}

  private async generateClaimNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.claim.count();
    const seq = String(count + 1).padStart(5, '0');
    return `CLM-${year}-${seq}`;
  }

  async create(dto: CreateClaimDto) {
    const claimNumber = await this.generateClaimNumber();
    return this.prisma.claim.create({
      data: {
        claimNumber,
        type: dto.type,
        description: dto.description,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : null,
        estimatedAmount: dto.estimatedAmount ?? null,
        priority: dto.priority,
        createdBy: dto.createdBy,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [claims, total] = await Promise.all([
      this.prisma.claim.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { claimant: true },
      }),
      this.prisma.claim.count(),
    ]);
    return { claims, total, page, limit };
  }

  async findOne(id: string) {
    const claim = await this.prisma.claim.findUnique({
      where: { id },
      include: {
        claimant: true,
        claimDetails: true,
        documents: true,
      },
    });
    if (!claim) throw new NotFoundException(`Claim ${id} not found`);
    return claim;
  }

  async update(id: string, dto: UpdateClaimDto) {
    await this.findOne(id);
    return this.prisma.claim.update({
      where: { id },
      data: {
        ...dto,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : undefined,
      },
      include: { claimant: true, claimDetails: true },
    });
  }

  async updateClaimant(claimId: string, dto: ClaimantDto) {
    await this.findOne(claimId);
    return this.prisma.claimant.upsert({
      where: { claimId },
      create: { claimId, ...dto },
      update: dto,
    });
  }

  async updateClaimDetails(claimId: string, dto: ClaimDetailsDto) {
    await this.findOne(claimId);
    return this.prisma.claimDetails.upsert({
      where: { claimId },
      create: { claimId, detailType: dto.detailType, data: dto.data as any },
      update: { detailType: dto.detailType, data: dto.data as any },
    });
  }

  async submit(id: string) {
    const claim = await this.findOne(id);
    if (claim.status !== 'DRAFT') {
      throw new Error(`Claim ${id} is not in DRAFT status`);
    }
    return this.prisma.claim.update({
      where: { id },
      data: { status: 'SUBMITTED' },
      include: { claimant: true, claimDetails: true, documents: true },
    });
  }
}
```

- [ ] **Step 4: Create ClaimsController**

Create `apps/api/src/claims/claims.controller.ts`:
```typescript
import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import {
  CreateClaimDto,
  UpdateClaimDto,
  ClaimantDto,
  ClaimDetailsDto,
  createClaimSchema,
  updateClaimSchema,
  claimantSchema,
  claimDetailsSchema,
} from '@claims-assistant/shared';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  async create(@Body() body: any) {
    const dto: CreateClaimDto = createClaimSchema.parse(body);
    return this.claimsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.claimsService.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.claimsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const dto: UpdateClaimDto = updateClaimSchema.parse(body);
    return this.claimsService.update(id, dto);
  }

  @Patch(':id/claimant')
  async updateClaimant(@Param('id') id: string, @Body() body: any) {
    const dto: ClaimantDto = claimantSchema.parse(body);
    return this.claimsService.updateClaimant(id, dto);
  }

  @Patch(':id/details')
  async updateDetails(@Param('id') id: string, @Body() body: any) {
    const dto: ClaimDetailsDto = claimDetailsSchema.parse(body);
    return this.claimsService.updateClaimDetails(id, dto);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.claimsService.submit(id);
  }
}
```

- [ ] **Step 5: Create ClaimsModule and register in AppModule**

Create `apps/api/src/claims/claims.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';

@Module({
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
```

Update `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ClaimsModule } from './claims/claims.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClaimsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd "D:/Apps/New folder/apps/api"
npx jest src/claims/claims.controller.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/api/src/claims/ apps/api/src/app.module.ts
git commit -m "feat: add claims CRUD module with service, controller, and tests"
```

---

## Task 5: AI Module — Extraction + Validation

**Files:**
- Create: `apps/api/src/ai/ai.module.ts`
- Create: `apps/api/src/ai/ai.service.ts`
- Create: `apps/api/src/ai/ai.controller.ts`
- Create: `apps/api/src/ai/ai.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing test for AI service**

Create `apps/api/src/ai/ai.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClaimType } from '@claims-assistant/shared';

// Mock the openai module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('AiService', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-key';
      return null;
    }),
  };

  const mockPrismaService = {
    aIExtractionLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extract', () => {
    it('should return extracted data from a description', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              claimant: {
                firstName: { value: 'John', confidence: 'high' },
                lastName: { value: 'Smith', confidence: 'high' },
              },
              claim: {
                incidentDate: { value: '2026-03-15T00:00:00Z', confidence: 'medium' },
                estimatedAmount: { value: 5000, confidence: 'low' },
              },
              details: {},
              overallConfidence: 0.75,
            }),
          },
        }],
      };

      // Access the mocked OpenAI instance
      const openaiInstance = (service as any).openai;
      openaiInstance.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.extract({
        description: 'John Smith had a car accident on March 15th. Estimated damage around $5000.',
        claimType: ClaimType.AUTO,
      });

      expect(result.claimant.firstName).toBeDefined();
      expect(result.overallConfidence).toBeGreaterThan(0);
    });
  });

  describe('validate', () => {
    it('should return validation issues', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              issues: [
                { type: 'WARNING', field: 'estimatedAmount', message: 'Amount seems unusually high for this claim type' },
              ],
              summary: 'One warning found. Review estimated amount.',
            }),
          },
        }],
      };

      const openaiInstance = (service as any).openai;
      openaiInstance.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.validate({
        claim: {
          type: ClaimType.AUTO,
          description: 'Car accident',
          incidentDate: '2026-03-15T00:00:00Z',
          estimatedAmount: 500000,
        },
        claimant: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          phone: '555-0100',
          address: '123 Main St',
          policyNumber: 'POL-12345',
        },
      });

      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('WARNING');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "D:/Apps/New folder/apps/api"
npx jest src/ai/ai.service.spec.ts --no-coverage
```

Expected: FAIL — AiService not found.

- [ ] **Step 3: Create AiService**

Create `apps/api/src/ai/ai.service.ts`:
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import {
  AiExtractRequest,
  AiExtractionResponse,
  AiValidateRequest,
  AiValidationResponse,
  aiExtractionResponseSchema,
  aiValidationResponseSchema,
} from '@claims-assistant/shared';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private readonly model = 'gpt-4o';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extract(request: AiExtractRequest): Promise<AiExtractionResponse> {
    const systemPrompt = `You are a claims data extraction specialist for an insurance company.
Given a free-text incident description and claim type, extract structured data.
For each field you extract, assign a confidence level: "high", "medium", or "low".
If you cannot determine a field, omit it entirely.
Respond with valid JSON matching this structure:
{
  "claimant": {
    "firstName": { "value": "string", "confidence": "high|medium|low" },
    "lastName": { "value": "string", "confidence": "high|medium|low" },
    "email": { "value": "string", "confidence": "high|medium|low" },
    "phone": { "value": "string", "confidence": "high|medium|low" },
    "address": { "value": "string", "confidence": "high|medium|low" },
    "policyNumber": { "value": "string", "confidence": "high|medium|low" }
  },
  "claim": {
    "incidentDate": { "value": "ISO datetime string", "confidence": "high|medium|low" },
    "estimatedAmount": { "value": number, "confidence": "high|medium|low" },
    "priority": { "value": "LOW|MEDIUM|HIGH|URGENT", "confidence": "high|medium|low" }
  },
  "details": {
    "fieldName": { "value": "any", "confidence": "high|medium|low" }
  },
  "overallConfidence": 0.0 to 1.0
}
Only include fields you can extract. The claim type is: ${request.claimType}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.description },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(content);
      const validated = aiExtractionResponseSchema.parse(parsed);

      // Log extraction for audit
      await this.prisma.aIExtractionLog.create({
        data: {
          inputText: request.description,
          extractedData: validated as any,
          confidence: validated.overallConfidence,
          model: this.model,
        },
      });

      return validated;
    } catch (error) {
      this.logger.error('AI extraction failed', error);
      throw error;
    }
  }

  async validate(request: AiValidateRequest): Promise<AiValidationResponse> {
    const systemPrompt = `You are a claims validation specialist for an insurance company.
Review the submitted claim data for completeness and anomalies.
Check for:
- Missing required fields (firstName, lastName, policyNumber, description, claim type)
- Logical inconsistencies (incident date in the future, claim type doesn't match details)
- Unusual amounts (extremely high or low for the claim type)
- Potential duplicate indicators
For each issue, classify as "WARNING" (can override) or "ERROR" (must fix).
Respond with valid JSON:
{
  "issues": [
    { "type": "WARNING" or "ERROR", "field": "fieldPath", "message": "human-readable explanation" }
  ],
  "summary": "brief overall assessment"
}
If everything looks good, return empty issues array with a positive summary.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(request, null, 2) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const parsed = JSON.parse(content);
      return aiValidationResponseSchema.parse(parsed);
    } catch (error) {
      this.logger.error('AI validation failed', error);
      throw error;
    }
  }
}
```

- [ ] **Step 4: Create AiController**

Create `apps/api/src/ai/ai.controller.ts`:
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { AiService } from './ai.service';
import { aiExtractRequestSchema, aiValidateRequestSchema } from '@claims-assistant/shared';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  async extract(@Body() body: any) {
    const dto = aiExtractRequestSchema.parse(body);
    try {
      return await this.aiService.extract(dto);
    } catch {
      throw new HttpException(
        'AI extraction is currently unavailable. Please fill the form manually.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate(@Body() body: any) {
    const dto = aiValidateRequestSchema.parse(body);
    try {
      return await this.aiService.validate(dto);
    } catch {
      throw new HttpException(
        'AI validation is currently unavailable. You may submit without validation.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
```

- [ ] **Step 5: Create AiModule and register in AppModule**

Create `apps/api/src/ai/ai.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
```

Update `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ClaimsModule } from './claims/claims.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClaimsModule,
    AiModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd "D:/Apps/New folder/apps/api"
npx jest src/ai/ai.service.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/api/src/ai/ apps/api/src/app.module.ts
git commit -m "feat: add AI module with extraction and validation via OpenAI"
```

---

## Task 6: Documents Module

**Files:**
- Create: `apps/api/src/documents/documents.module.ts`
- Create: `apps/api/src/documents/documents.service.ts`
- Create: `apps/api/src/documents/documents.controller.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create DocumentsService**

Create `apps/api/src/documents/documents.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async upload(claimId: string, file: Express.Multer.File) {
    const claimDir = path.join(this.uploadsDir, claimId);
    if (!fs.existsSync(claimDir)) {
      fs.mkdirSync(claimDir, { recursive: true });
    }

    const filePath = path.join(claimDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    return this.prisma.claimDocument.create({
      data: {
        claimId,
        fileName: file.originalname,
        fileType: file.mimetype,
        filePath: `uploads/${claimId}/${file.originalname}`,
      },
    });
  }

  async findByClaimId(claimId: string) {
    return this.prisma.claimDocument.findMany({
      where: { claimId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}
```

- [ ] **Step 2: Create DocumentsController**

Create `apps/api/src/documents/documents.controller.ts`:
```typescript
import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('claims/:claimId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @Param('claimId') claimId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.upload(claimId, file);
  }

  @Get()
  async findByClaimId(@Param('claimId') claimId: string) {
    return this.documentsService.findByClaimId(claimId);
  }
}
```

- [ ] **Step 3: Create DocumentsModule and register in AppModule**

Create `apps/api/src/documents/documents.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
```

Update `apps/api/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ClaimsModule } from './claims/claims.module';
import { AiModule } from './ai/ai.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClaimsModule,
    AiModule,
    DocumentsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Verify API compiles and starts**

```bash
cd "D:/Apps/New folder/apps/api"
npx nest build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/api/src/documents/ apps/api/src/app.module.ts
git commit -m "feat: add documents module with file upload support"
```

---

## Task 7: Next.js Frontend — Scaffolding + Layout

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Create web package.json**

Create `apps/web/package.json`:
```json
{
  "name": "web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "echo 'no lint configured'",
    "test": "echo 'no tests yet'"
  },
  "dependencies": {
    "@claims-assistant/shared": "*",
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

- [ ] **Step 2: Create web tsconfig.json**

Create `apps/web/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.js**

Create `apps/web/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@claims-assistant/shared'],
};

module.exports = nextConfig;
```

- [ ] **Step 4: Create Tailwind config**

Create `apps/web/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

Create `apps/web/postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 5: Create root layout and globals.css**

Create `apps/web/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Create `apps/web/src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Claims Assistant',
  description: 'AI-powered claim submission assistant for insurance agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-blue-700">Claims Assistant</h1>
            <span className="text-sm text-gray-500">Agent Portal</span>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create home page**

Create `apps/web/src/app/page.tsx`:
```tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/claims/new"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">New Claim</h3>
          <p className="text-gray-600 text-sm">
            Submit a new insurance claim with AI-assisted data extraction and validation.
          </p>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Install dependencies and verify build**

```bash
cd "D:/Apps/New folder"
npm install
cd apps/web
npx next build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/web/
git commit -m "feat: scaffold Next.js frontend with Tailwind and layout"
```

---

## Task 8: Wizard Hook + API Client

**Files:**
- Create: `apps/web/src/app/claims/new/hooks/useClaimWizard.ts`
- Create: `apps/web/src/app/claims/new/types.ts`

- [ ] **Step 1: Create frontend types**

Create `apps/web/src/app/claims/new/types.ts`:
```typescript
import {
  ClaimType,
  ClaimPriority,
  ClaimantDto,
  AutoDetails,
  PropertyDetails,
  HealthDetails,
  OtherDetails,
  AiExtractionResponse,
  AiValidationResponse,
} from '@claims-assistant/shared';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface AiFilledField {
  value: unknown;
  confidence: 'high' | 'medium' | 'low';
}

export interface WizardFormData {
  // Step 1
  claimType: ClaimType;
  description: string;

  // Step 2
  claimant: ClaimantDto;

  // Step 3
  incidentDate: string;
  estimatedAmount: number | null;
  priority: ClaimPriority;
  details: AutoDetails | PropertyDetails | HealthDetails | OtherDetails;

  // Step 4 — tracked separately via uploads

  // AI state
  aiExtraction: AiExtractionResponse | null;
  aiValidation: AiValidationResponse | null;
  aiFilledFields: Set<string>;
}

export const initialFormData: WizardFormData = {
  claimType: ClaimType.AUTO,
  description: '',
  claimant: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    policyNumber: '',
  },
  incidentDate: '',
  estimatedAmount: null,
  priority: ClaimPriority.MEDIUM,
  details: {
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    otherPartyName: '',
    otherPartyInsurance: '',
    policeReportNumber: '',
    accidentLocation: '',
  },
  aiExtraction: null,
  aiValidation: null,
  aiFilledFields: new Set(),
};
```

- [ ] **Step 2: Create wizard hook**

Create `apps/web/src/app/claims/new/hooks/useClaimWizard.ts`:
```typescript
'use client';

import { useState, useCallback } from 'react';
import {
  ClaimType,
  AiExtractionResponse,
  AiValidationResponse,
  ClaimantDto,
} from '@claims-assistant/shared';
import { WizardStep, WizardFormData, initialFormData } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useClaimWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 5) as WizardStep);
  }, []);

  const goBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1) as WizardStep);
  }, []);

  const goToStep = useCallback((s: WizardStep) => {
    setStep(s);
  }, []);

  const extractWithAi = useCallback(async () => {
    setIsLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_URL}/ai/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          claimType: formData.claimType,
        }),
      });

      if (!res.ok) {
        throw new Error('AI extraction unavailable');
      }

      const extraction: AiExtractionResponse = await res.json();
      const aiFilledFields = new Set<string>();
      const claimantUpdates: Partial<ClaimantDto> = {};

      // Apply extracted claimant fields (only high/medium confidence)
      if (extraction.claimant) {
        for (const [key, field] of Object.entries(extraction.claimant)) {
          if (field && field.confidence !== 'low') {
            (claimantUpdates as any)[key] = String(field.value);
            aiFilledFields.add(`claimant.${key}`);
          }
        }
      }

      const claimUpdates: Partial<WizardFormData> = {};

      // Apply extracted claim fields
      if (extraction.claim?.incidentDate?.confidence !== 'low' && extraction.claim?.incidentDate) {
        claimUpdates.incidentDate = String(extraction.claim.incidentDate.value);
        aiFilledFields.add('incidentDate');
      }
      if (extraction.claim?.estimatedAmount?.confidence !== 'low' && extraction.claim?.estimatedAmount) {
        claimUpdates.estimatedAmount = Number(extraction.claim.estimatedAmount.value);
        aiFilledFields.add('estimatedAmount');
      }

      updateFormData({
        ...claimUpdates,
        claimant: { ...formData.claimant, ...claimantUpdates },
        aiExtraction: extraction,
        aiFilledFields,
      });
    } catch (err) {
      setAiError('AI extraction is currently unavailable. Please fill the form manually.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.description, formData.claimType, formData.claimant, updateFormData]);

  const createDraftClaim = useCallback(async () => {
    if (claimId) return claimId;

    const res = await fetch(`${API_URL}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: formData.claimType,
        description: formData.description,
        createdBy: 'agent-001', // In production, from auth context
      }),
    });

    const claim = await res.json();
    setClaimId(claim.id);
    return claim.id;
  }, [claimId, formData.claimType, formData.description]);

  const validateWithAi = useCallback(async () => {
    setIsLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_URL}/ai/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: {
            type: formData.claimType,
            description: formData.description,
            incidentDate: formData.incidentDate || null,
            estimatedAmount: formData.estimatedAmount,
            priority: formData.priority,
          },
          claimant: formData.claimant,
          details: formData.details,
        }),
      });

      if (!res.ok) throw new Error('Validation unavailable');

      const validation: AiValidationResponse = await res.json();
      updateFormData({ aiValidation: validation });
      return validation;
    } catch {
      setAiError('AI validation unavailable. You may submit without validation.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateFormData]);

  const submitClaim = useCallback(async () => {
    setIsLoading(true);
    try {
      const id = await createDraftClaim();

      // Save claimant data
      await fetch(`${API_URL}/claims/${id}/claimant`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.claimant),
      });

      // Save claim details
      await fetch(`${API_URL}/claims/${id}/details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detailType: formData.claimType,
          data: formData.details,
        }),
      });

      // Update claim fields
      await fetch(`${API_URL}/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentDate: formData.incidentDate || undefined,
          estimatedAmount: formData.estimatedAmount || undefined,
          priority: formData.priority,
        }),
      });

      // Submit
      await fetch(`${API_URL}/claims/${id}/submit`, {
        method: 'POST',
      });

      setSubmitSuccess(true);
    } catch (err) {
      setAiError('Failed to submit claim. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, createDraftClaim]);

  return {
    step,
    formData,
    claimId,
    isLoading,
    aiError,
    submitSuccess,
    updateFormData,
    goNext,
    goBack,
    goToStep,
    extractWithAi,
    validateWithAi,
    submitClaim,
    createDraftClaim,
  };
}
```

- [ ] **Step 3: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/web/src/app/claims/
git commit -m "feat: add wizard hook with AI extraction, validation, and form state"
```

---

## Task 9: Wizard UI Components — Steps 1-3

**Files:**
- Create: `apps/web/src/app/claims/new/components/StepIndicator.tsx`
- Create: `apps/web/src/app/claims/new/components/AiBadge.tsx`
- Create: `apps/web/src/app/claims/new/components/Step1TypeDescription.tsx`
- Create: `apps/web/src/app/claims/new/components/Step2ClaimantInfo.tsx`
- Create: `apps/web/src/app/claims/new/components/Step3IncidentDetails.tsx`

- [ ] **Step 1: Create StepIndicator**

Create `apps/web/src/app/claims/new/components/StepIndicator.tsx`:
```tsx
'use client';

import { WizardStep } from '../types';

const steps = [
  { num: 1, label: 'Type & Description' },
  { num: 2, label: 'Claimant Info' },
  { num: 3, label: 'Incident Details' },
  { num: 4, label: 'Documents' },
  { num: 5, label: 'Review & Submit' },
] as const;

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-between mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1">
          <button
            onClick={() => onStepClick(s.num as WizardStep)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              s.num === currentStep
                ? 'text-blue-700'
                : s.num < currentStep
                  ? 'text-green-600 cursor-pointer'
                  : 'text-gray-400'
            }`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                s.num === currentStep
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : s.num < currentStep
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
              }`}
            >
              {s.num < currentStep ? '✓' : s.num}
            </span>
            <span className="hidden md:inline">{s.label}</span>
          </button>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                s.num < currentStep ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Create AiBadge**

Create `apps/web/src/app/claims/new/components/AiBadge.tsx`:
```tsx
'use client';

interface AiBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

export function AiBadge({ confidence }: AiBadgeProps) {
  const colors = {
    high: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border ${colors[confidence]}`}>
      AI · {confidence}
    </span>
  );
}
```

- [ ] **Step 3: Create Step1TypeDescription**

Create `apps/web/src/app/claims/new/components/Step1TypeDescription.tsx`:
```tsx
'use client';

import { ClaimType } from '@claims-assistant/shared';
import { WizardFormData } from '../types';

interface Step1Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onExtract: () => void;
  isLoading: boolean;
  aiError: string | null;
  onNext: () => void;
}

const claimTypes = [
  { value: ClaimType.AUTO, label: 'Auto / Vehicle' },
  { value: ClaimType.PROPERTY, label: 'Property / Home' },
  { value: ClaimType.HEALTH, label: 'Health / Medical' },
  { value: ClaimType.OTHER, label: 'Other' },
];

export function Step1TypeDescription({ formData, onUpdate, onExtract, isLoading, aiError, onNext }: Step1Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 1: Claim Type & Description</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Claim Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {claimTypes.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => onUpdate({ claimType: ct.value })}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                formData.claimType === ct.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Incident Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={6}
          placeholder="Describe the incident in detail. Include names, dates, amounts, and any relevant information. The AI will extract structured data from this text."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {aiError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {aiError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExtract}
          disabled={isLoading || !formData.description.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Extracting...' : '✨ Extract with AI'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.description.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {formData.aiExtraction && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          AI extracted data with {Math.round(formData.aiExtraction.overallConfidence * 100)}% overall confidence. Fields have been pre-filled in the next steps.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create Step2ClaimantInfo**

Create `apps/web/src/app/claims/new/components/Step2ClaimantInfo.tsx`:
```tsx
'use client';

import { WizardFormData } from '../types';
import { AiBadge } from './AiBadge';

interface Step2Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2ClaimantInfo({ formData, onUpdate, onNext, onBack }: Step2Props) {
  const updateClaimant = (field: string, value: string) => {
    onUpdate({
      claimant: { ...formData.claimant, [field]: value },
    });
  };

  const isAiFilled = (field: string) => formData.aiFilledFields.has(`claimant.${field}`);
  const getConfidence = (field: string) => {
    const extraction = formData.aiExtraction?.claimant;
    if (!extraction) return null;
    const f = (extraction as any)[field];
    return f?.confidence || null;
  };

  const fields = [
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name', required: true },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Phone' },
    { name: 'address', label: 'Address' },
    { name: 'policyNumber', label: 'Policy Number', required: true },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 2: Claimant Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
              {isAiFilled(field.name) && getConfidence(field.name) && (
                <AiBadge confidence={getConfidence(field.name)!} />
              )}
            </label>
            <input
              type="text"
              value={(formData.claimant as any)[field.name] || ''}
              onChange={(e) => updateClaimant(field.name, e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
                isAiFilled(field.name)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-300'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!formData.claimant.firstName || !formData.claimant.lastName || !formData.claimant.policyNumber}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create Step3IncidentDetails**

Create `apps/web/src/app/claims/new/components/Step3IncidentDetails.tsx`:
```tsx
'use client';

import { ClaimType, ClaimPriority } from '@claims-assistant/shared';
import { WizardFormData } from '../types';
import { AiBadge } from './AiBadge';

interface Step3Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function AutoFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  const fields = [
    { name: 'vehicleMake', label: 'Vehicle Make' },
    { name: 'vehicleModel', label: 'Vehicle Model' },
    { name: 'vehicleYear', label: 'Vehicle Year' },
    { name: 'licensePlate', label: 'License Plate' },
    { name: 'otherPartyName', label: 'Other Party Name' },
    { name: 'otherPartyInsurance', label: 'Other Party Insurance' },
    { name: 'policeReportNumber', label: 'Police Report Number' },
    { name: 'accidentLocation', label: 'Accident Location' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

function PropertyFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  const fields = [
    { name: 'propertyAddress', label: 'Property Address' },
    { name: 'damageType', label: 'Damage Type' },
    { name: 'roomsAffected', label: 'Rooms Affected' },
    { name: 'propertyType', label: 'Property Type' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

function HealthFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  const fields = [
    { name: 'providerName', label: 'Provider Name' },
    { name: 'diagnosis', label: 'Diagnosis' },
    { name: 'treatmentDate', label: 'Treatment Date' },
    { name: 'treatmentType', label: 'Treatment Type' },
    { name: 'facilityName', label: 'Facility Name' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

function OtherFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          value={details.category || ''}
          onChange={(e) => onUpdateDetail('category', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
        <textarea
          value={details.additionalInfo || ''}
          onChange={(e) => onUpdateDetail('additionalInfo', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export function Step3IncidentDetails({ formData, onUpdate, onNext, onBack }: Step3Props) {
  const onUpdateDetail = (key: string, value: string) => {
    onUpdate({ details: { ...formData.details, [key]: value } as any });
  };

  const isAiFilled = (field: string) => formData.aiFilledFields.has(field);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 3: Incident Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            Incident Date
            {isAiFilled('incidentDate') && <AiBadge confidence="medium" />}
          </label>
          <input
            type="datetime-local"
            value={formData.incidentDate ? formData.incidentDate.slice(0, 16) : ''}
            onChange={(e) => onUpdate({ incidentDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
              isAiFilled('incidentDate') ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            Estimated Amount ($)
            {isAiFilled('estimatedAmount') && <AiBadge confidence="low" />}
          </label>
          <input
            type="number"
            value={formData.estimatedAmount ?? ''}
            onChange={(e) => onUpdate({ estimatedAmount: e.target.value ? Number(e.target.value) : null })}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
              isAiFilled('estimatedAmount') ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => onUpdate({ priority: e.target.value as ClaimPriority })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.values(ClaimPriority).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {formData.claimType} Details
        </h4>
        {formData.claimType === ClaimType.AUTO && <AutoFields formData={formData} onUpdateDetail={onUpdateDetail} />}
        {formData.claimType === ClaimType.PROPERTY && <PropertyFields formData={formData} onUpdateDetail={onUpdateDetail} />}
        {formData.claimType === ClaimType.HEALTH && <HealthFields formData={formData} onUpdateDetail={onUpdateDetail} />}
        {formData.claimType === ClaimType.OTHER && <OtherFields formData={formData} onUpdateDetail={onUpdateDetail} />}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/web/src/app/claims/new/components/
git commit -m "feat: add wizard Steps 1-3 UI components with AI badge indicators"
```

---

## Task 10: Wizard UI Components — Steps 4-5 + Wizard Container

**Files:**
- Create: `apps/web/src/app/claims/new/components/Step4Documents.tsx`
- Create: `apps/web/src/app/claims/new/components/Step5ReviewSubmit.tsx`
- Create: `apps/web/src/app/claims/new/components/ClaimWizard.tsx`
- Create: `apps/web/src/app/claims/new/page.tsx`

- [ ] **Step 1: Create Step4Documents**

Create `apps/web/src/app/claims/new/components/Step4Documents.tsx`:
```tsx
'use client';

import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Step4Props {
  claimId: string | null;
  createDraftClaim: () => Promise<string>;
  onNext: () => void;
  onBack: () => void;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

export function Step4Documents({ claimId, createDraftClaim, onNext, onBack }: Step4Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const id = await createDraftClaim();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/claims/${id}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const doc = await res.json();
        setFiles((prev) => [...prev, doc]);
      }
    } finally {
      setIsUploading(false);
    }
  }, [createDraftClaim]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(uploadFile);
  }, [uploadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadFile);
  }, [uploadFile]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 4: Supporting Documents</h3>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-gray-600 mb-2">
          {isUploading ? 'Uploading...' : 'Drag and drop files here, or click to browse'}
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
        >
          Browse Files
        </label>
        <p className="text-xs text-gray-400 mt-2">Max 10MB per file. Supports images, PDFs, and common document formats.</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{f.fileName}</span>
              <span className="text-xs text-gray-400">{f.fileType}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Next: Review →
        </button>
        <span className="text-xs text-gray-400">Documents are optional. You can skip this step.</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Step5ReviewSubmit**

Create `apps/web/src/app/claims/new/components/Step5ReviewSubmit.tsx`:
```tsx
'use client';

import { useEffect } from 'react';
import { ValidationIssueType } from '@claims-assistant/shared';
import { WizardFormData } from '../types';

interface Step5Props {
  formData: WizardFormData;
  isLoading: boolean;
  aiError: string | null;
  submitSuccess: boolean;
  onValidate: () => Promise<any>;
  onSubmit: () => void;
  onBack: () => void;
  onGoToStep: (step: any) => void;
}

export function Step5ReviewSubmit({
  formData,
  isLoading,
  aiError,
  submitSuccess,
  onValidate,
  onSubmit,
  onBack,
  onGoToStep,
}: Step5Props) {
  useEffect(() => {
    if (!formData.aiValidation) {
      onValidate();
    }
  }, []);

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">&#10003;</div>
        <h3 className="text-xl font-semibold text-green-700 mb-2">Claim Submitted Successfully</h3>
        <p className="text-gray-600">The claim has been submitted and is now under review.</p>
        <a href="/" className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Back to Dashboard
        </a>
      </div>
    );
  }

  const validation = formData.aiValidation;
  const errors = validation?.issues.filter((i) => i.type === ValidationIssueType.ERROR) || [];
  const warnings = validation?.issues.filter((i) => i.type === ValidationIssueType.WARNING) || [];
  const hasErrors = errors.length > 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 5: Review & Submit</h3>

      {/* Validation Results */}
      {isLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Running AI validation...
        </div>
      )}

      {validation && !isLoading && (
        <div className="space-y-3">
          {errors.length === 0 && warnings.length === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {validation.summary}
            </div>
          )}

          {errors.map((e, i) => (
            <div key={`err-${i}`} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <span className="font-bold">ERROR:</span>
              <span>{e.message} (field: {e.field})</span>
            </div>
          ))}

          {warnings.map((w, i) => (
            <div key={`warn-${i}`} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-start gap-2">
              <span className="font-bold">WARNING:</span>
              <span>{w.message} (field: {w.field})</span>
            </div>
          ))}
        </div>
      )}

      {aiError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {aiError}
        </div>
      )}

      {/* Claim Summary */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Claim Info</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Type:</dt>
            <dd className="font-medium">{formData.claimType}</dd>
            <dt className="text-gray-500">Priority:</dt>
            <dd className="font-medium">{formData.priority}</dd>
            <dt className="text-gray-500">Incident Date:</dt>
            <dd className="font-medium">{formData.incidentDate ? new Date(formData.incidentDate).toLocaleDateString() : 'Not specified'}</dd>
            <dt className="text-gray-500">Estimated Amount:</dt>
            <dd className="font-medium">{formData.estimatedAmount ? `$${formData.estimatedAmount.toLocaleString()}` : 'Not specified'}</dd>
          </dl>
        </div>

        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Claimant</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Name:</dt>
            <dd className="font-medium">{formData.claimant.firstName} {formData.claimant.lastName}</dd>
            <dt className="text-gray-500">Policy:</dt>
            <dd className="font-medium">{formData.claimant.policyNumber}</dd>
            <dt className="text-gray-500">Email:</dt>
            <dd className="font-medium">{formData.claimant.email || '—'}</dd>
            <dt className="text-gray-500">Phone:</dt>
            <dd className="font-medium">{formData.claimant.phone || '—'}</dd>
          </dl>
        </div>

        <div className="p-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || hasErrors}
          className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Submitting...' : 'Submit Claim'}
        </button>
        {hasErrors && (
          <span className="text-xs text-red-600">Fix all errors before submitting.</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ClaimWizard container**

Create `apps/web/src/app/claims/new/components/ClaimWizard.tsx`:
```tsx
'use client';

import { useClaimWizard } from '../hooks/useClaimWizard';
import { StepIndicator } from './StepIndicator';
import { Step1TypeDescription } from './Step1TypeDescription';
import { Step2ClaimantInfo } from './Step2ClaimantInfo';
import { Step3IncidentDetails } from './Step3IncidentDetails';
import { Step4Documents } from './Step4Documents';
import { Step5ReviewSubmit } from './Step5ReviewSubmit';

export function ClaimWizard() {
  const wizard = useClaimWizard();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
      <StepIndicator currentStep={wizard.step} onStepClick={wizard.goToStep} />

      {wizard.step === 1 && (
        <Step1TypeDescription
          formData={wizard.formData}
          onUpdate={wizard.updateFormData}
          onExtract={wizard.extractWithAi}
          isLoading={wizard.isLoading}
          aiError={wizard.aiError}
          onNext={wizard.goNext}
        />
      )}

      {wizard.step === 2 && (
        <Step2ClaimantInfo
          formData={wizard.formData}
          onUpdate={wizard.updateFormData}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.step === 3 && (
        <Step3IncidentDetails
          formData={wizard.formData}
          onUpdate={wizard.updateFormData}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.step === 4 && (
        <Step4Documents
          claimId={wizard.claimId}
          createDraftClaim={wizard.createDraftClaim}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.step === 5 && (
        <Step5ReviewSubmit
          formData={wizard.formData}
          isLoading={wizard.isLoading}
          aiError={wizard.aiError}
          submitSuccess={wizard.submitSuccess}
          onValidate={wizard.validateWithAi}
          onSubmit={wizard.submitClaim}
          onBack={wizard.goBack}
          onGoToStep={wizard.goToStep}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create wizard page**

Create `apps/web/src/app/claims/new/page.tsx`:
```tsx
import { ClaimWizard } from './components/ClaimWizard';

export default function NewClaimPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">New Claim</h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the claim details or use AI to extract information from a description.
        </p>
      </div>
      <ClaimWizard />
    </div>
  );
}
```

- [ ] **Step 5: Verify frontend builds**

```bash
cd "D:/Apps/New folder"
npm install
cd apps/web
npx next build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/web/
git commit -m "feat: add complete wizard UI with Steps 4-5, container, and page"
```

---

## Task 11: Integration Test

**Files:**
- Create: `apps/api/test/jest-e2e.json`
- Create: `apps/api/test/claims.e2e-spec.ts`

- [ ] **Step 1: Create e2e jest config**

Create `apps/api/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@claims-assistant/shared$": "<rootDir>/../../../packages/shared/src"
  }
}
```

- [ ] **Step 2: Create integration test**

Create `apps/api/test/claims.e2e-spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Claims API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.aIExtractionLog.deleteMany();
    await prisma.claimDocument.deleteMany();
    await prisma.claimDetails.deleteMany();
    await prisma.claimant.deleteMany();
    await prisma.claim.deleteMany();
    await app.close();
  });

  let claimId: string;

  it('POST /claims - should create a draft claim', async () => {
    const res = await request(app.getHttpServer())
      .post('/claims')
      .send({
        type: 'AUTO',
        description: 'Car accident on highway 101',
        createdBy: 'agent-test-001',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.claimNumber).toMatch(/^CLM-/);
    expect(res.body.status).toBe('DRAFT');
    claimId = res.body.id;
  });

  it('GET /claims/:id - should return the claim', async () => {
    const res = await request(app.getHttpServer())
      .get(`/claims/${claimId}`)
      .expect(200);

    expect(res.body.id).toBe(claimId);
    expect(res.body.description).toBe('Car accident on highway 101');
  });

  it('PATCH /claims/:id/claimant - should save claimant info', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/claims/${claimId}/claimant`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-0100',
        address: '123 Main St',
        policyNumber: 'POL-12345',
      })
      .expect(200);

    expect(res.body.firstName).toBe('John');
    expect(res.body.claimId).toBe(claimId);
  });

  it('PATCH /claims/:id/details - should save claim details', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/claims/${claimId}/details`)
      .send({
        detailType: 'AUTO',
        data: {
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleYear: '2024',
          licensePlate: 'ABC123',
        },
      })
      .expect(200);

    expect(res.body.detailType).toBe('AUTO');
  });

  it('POST /claims/:id/submit - should submit the claim', async () => {
    const res = await request(app.getHttpServer())
      .post(`/claims/${claimId}/submit`)
      .expect(201);

    expect(res.body.status).toBe('SUBMITTED');
  });

  it('GET /claims - should list claims', async () => {
    const res = await request(app.getHttpServer())
      .get('/claims')
      .expect(200);

    expect(res.body.claims.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run integration tests (requires running PostgreSQL)**

```bash
cd "D:/Apps/New folder/apps/api"
npx jest --config test/jest-e2e.json --no-coverage
```

Expected: All tests pass (requires PostgreSQL running with DATABASE_URL configured in .env).

- [ ] **Step 4: Commit**

```bash
cd "D:/Apps/New folder"
git add apps/api/test/
git commit -m "test: add e2e integration tests for claims API"
```

---

## Task 12: Final Wiring + Verification

**Files:**
- Modify: `.env.example` (already done)
- No new files — this is verification.

- [ ] **Step 1: Create .env file from template**

```bash
cd "D:/Apps/New folder"
cp .env.example .env
```

Then edit `.env` with real values (PostgreSQL connection string, OpenAI API key).

- [ ] **Step 2: Run database migration**

```bash
cd "D:/Apps/New folder/apps/api"
npx prisma migrate dev --name init
```

Expected: Migration applied successfully.

- [ ] **Step 3: Start the full stack**

```bash
cd "D:/Apps/New folder"
npx turbo dev
```

Expected: Both `web` (port 3000) and `api` (port 3001) start successfully.

- [ ] **Step 4: Manual verification**

1. Open `http://localhost:3000` — should see dashboard with "New Claim" card
2. Click "New Claim" — should see wizard at Step 1
3. Select "Auto / Vehicle", enter a description like: "John Smith, policy POL-99887, was involved in a rear-end collision on March 20th, 2026 on Interstate 5 near Portland. His 2023 Honda Civic (plate XYZ-789) was struck by another vehicle. Police report #PR-2026-4455 was filed. Estimated damage is around $8,500."
4. Click "Extract with AI" — should see fields pre-filled in Steps 2 and 3
5. Navigate through all steps, upload a test document
6. On Step 5, observe AI validation results
7. Submit the claim

- [ ] **Step 5: Test graceful degradation**

Remove OPENAI_API_KEY from .env, restart API. Verify "Extract with AI" shows unavailable message but manual flow works.

- [ ] **Step 6: Run all tests**

```bash
cd "D:/Apps/New folder"
npx turbo test
```

Expected: All unit and integration tests pass.

- [ ] **Step 7: Final commit**

```bash
cd "D:/Apps/New folder"
git add -A
git commit -m "chore: final wiring and verification complete"
```
