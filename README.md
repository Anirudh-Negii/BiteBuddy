# 🍽️ BiteBuddy — AI Assisted Recipe Platform

BiteBuddy is a full-stack web application that demonstrates how AI-driven features can be integrated into a modern SaaS-style product workflow.
The platform enables users to generate recipes, manage a personal recipe collection, explore guided cooking content, and experience subscription-based feature gating.

This project was built to showcase **real-world full-stack engineering skills**, including AI orchestration, authentication flows, middleware security, relational data handling, and scalable UI architecture.

---

## 🚀 Key Features

### 🤖 AI Recipe Generation (Fetch-or-Generate Pattern)

* Users can request any recipe through a modal-driven entry point
* System first checks database for existing recipe to avoid redundant AI calls
* If not found, structured recipe data is generated and persisted
* Responses are normalized into consistent JSON and rendered into step-based cooking UI

---

### 📚 Personal Recipe Collection

* Save / remove recipes from a user-specific collection
* Dedicated **My Recipes** page with loading, grid display, and empty state UX
* Demonstrates relational data workflows and conditional rendering

---

### ⭐ Subscription-Based Feature Gating

* Premium insights like cooking tips, substitutions, and nutrition are gated
* Locked content uses blur overlays with upgrade call-to-action
* UI adapts dynamically based on authenticated subscription tier

---

### 🔐 Protected Routes & Middleware Security

* Dashboard, recipe flows, pantry tools, and collections require authentication
* Middleware applies global request shielding before auth enforcement
* Demonstrates layered route protection strategy

---

### 🧾 Recipe Utility Enhancements

* Ingredient grouping by category
* Step timeline layout with contextual tips
* Metadata badges (cuisine, category, duration, servings)
* Recipe PDF export capability

---

### 🎯 UX State Management

* Suspense-driven loading flows
* Error fallbacks
* Friendly empty states
* Modal-based navigation entry

---

## 🔄 High-Level Request Flow

```text
┌──────────────┐
│   Next.js    │
│   (Client)   │
└──────┬───────┘
       │
       │ User requests recipe
       ▼
┌──────────────┐
│ Server Action│
│ / API Layer  │
└──────┬───────┘
       │
       │ Check if recipe exists
       ▼
┌──────────────┐
│   Strapi DB  │
└──────┬───────┘
       │
       │ If not found → Generate
       ▼
┌──────────────┐
│   AI Layer   │
│ (Prompt Gen) │
└──────┬───────┘
       │
       │ Save structured recipe
       ▼
┌──────────────┐
│   Strapi DB  │
└──────┬───────┘
       │
       │ Return response
       ▼
┌──────────────┐
│   Next.js UI │
└──────────────┘
```

---

## 🔐 Route Protection Flow

```text
User Request
     ↓
Arcjet Middleware Shield
     ↓
Clerk Authentication Check
     ↓
Protected Page Access
```

---

## 🧱 Architecture Overview

The project follows a **decoupled frontend–backend architecture** designed for maintainability and feature scalability.

### Frontend Responsibilities

* State-driven UI rendering
* Subscription-aware component behavior
* Modal navigation workflows
* Route transitions and suspense boundaries

### Backend Responsibilities

* AI generation orchestration
* Recipe persistence and normalization
* User collection management
* Request validation and business rule enforcement

---

## 🧰 Technology Stack

### Frontend

* **Next.js (App Router)** — routing, server actions, suspense boundaries
* **React** — component architecture and client state management
* **shadcn/ui** — consistent and accessible design primitives
* **Lucide Icons** — UI iconography

### Backend & Data Layer

* **Strapi (Headless CMS)** — structured recipe storage, relational collections, content persistence
* **Custom server logic / actions** — AI workflow orchestration

### Authentication & Security

* **Clerk** — authentication, session handling, subscription awareness
* **Arcjet** — middleware-level request shielding and bot protection

### AI Integration

* Prompt-driven structured recipe generation
* JSON normalization pipeline
* Abstracted AI service layer enabling provider swapping or fallback strategies

---

## 🧠 Engineering Concepts Demonstrated

* Fetch-or-generate caching strategy
* Middleware-first security enforcement
* Subscription-aware UI gating patterns
* Decoupled AI integration layer
* Structured data rendering pipelines
* Relational persistence modeling
* Async UX state orchestration
* Modular route architecture

---

## 📌 Project Objective

BiteBuddy was built to demonstrate the ability to design and implement:

* realistic full-stack user workflows
* AI-powered feature integration
* protected application routing
* scalable component-driven UI systems
* backend persistence strategies for generated content

The project emphasizes **practical engineering decision-making** rather than tutorial-style implementation.

---

## 👨‍💻 Author

**Anirudh Negi**
