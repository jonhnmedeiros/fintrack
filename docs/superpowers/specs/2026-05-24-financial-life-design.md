# Design Doc: Financial Life

## 1. Overview

"Financial Life" is a personal finance application for tracking expenses and managing investments. This document outlines the technical design for the application.

## 2. Architecture

The application will be a monolithic SSR application built with React, Vite, and Express. The frontend will be rendered on the server to provide a fast initial load time and good SEO.

## 3. Project Structure

The project will be organized into the following directories:

-   `src/`: Contains all the frontend code.
-   `src/components/`: Shared React components.
-   `src/features/`: Self-contained modules for each feature (e.g., `expense-tracking`, `investment-management`).
-   `src/pages/`: The main pages of the application.
-   `src/lib/`: Utility functions.
-   `src/store/`: Zustand store for global state management.
-   `src/types/`: TypeScript types.
-   `server.js`: The Express server for SSR.

## 4. Core Components

### Expense Tracking

-   `TransactionForm`: A form for adding and editing transactions.
-   `TransactionList`: A list of transactions.
-   `CategoryManager`: A component for managing spending categories.

### Investment Management

-   `PortfolioOverview`: An overview of the user's investment portfolio.
-   `HoldingList`: A list of individual investments.
-   `PerformanceChart`: A chart showing the performance of the portfolio over time.

## 5. Data Flow

TanStack Query will be used for all data fetching and caching. Each feature will have its own set of data hooks (e.g., `useTransactions`, `usePortfolio`).

## 6. Styling

Tailwind CSS will be used for styling. A simple design system will be created with reusable components.

## 7. SSR

An Express server will be used to render the application on the server. The `server.js` file will handle the SSR logic.
