# DocTrack

<div align="center">

![DocTrack Logo](https://img.shields.io/badge/DocTrack-Document%20Management-7C3AED?style=for-the-badge&logo=files&logoColor=white)

**A modern, enterprise-grade document management system**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots) • [Author](#-author)

</div>

---

## 📋 Overview

DocTrack is a comprehensive document management solution designed for businesses that need to organize, track, and collaborate on documentation. Built with modern technologies and a focus on user experience, it provides a seamless workflow for document creation, versioning, and team collaboration.

## ✨ Features

### Document Management

- 📝 **Rich Text Editor** - Full-featured WYSIWYG editor with formatting tools
- 📂 **Smart Organization** - Categorize documents by type and client
- 🔄 **Version History** - Track all changes with complete revision history
- 🔍 **Version Comparison** - Visual diff between document versions

### Collaboration

- 💬 **Comments System** - Add contextual comments to documents
- 👥 **User Management** - Role-based access control (Admin, Editor, Reader)
- 📊 **Audit Logs** - Complete activity tracking for compliance

### User Experience

- 🌐 **Multi-language Support** - Available in English, Portuguese, and French
- 🎨 **Modern UI** - Clean, responsive interface built with shadcn/ui
- ⌨️ **Keyboard Shortcuts** - Command palette for power users (Ctrl+K)
- 📤 **PDF Export** - Export documents to PDF format

### Enterprise Ready

- 🔐 **Secure Authentication** - JWT-based session management
- 🏢 **Client Management** - Organize documents by client/company
- 📈 **Dashboard Analytics** - Overview of document statistics
- 🚀 **Next.js Optimized** - Built with Next.js App Router for optimal performance

## 🛠 Tech Stack

<table>
<tr>
<td valign="top">

### Frontend

| Technology    | Purpose              |
| ------------- | -------------------- |
| React 18      | UI Framework         |
| Next.js 16    | Full-stack Framework |
| TypeScript    | Type Safety          |
| Tailwind CSS  | Styling              |
| shadcn/ui     | Component Library    |
| TipTap        | Rich Text Editor     |
| Framer Motion | Animations           |
| React Query   | Data Fetching        |
| i18next       | Internationalization |

</td>
<td valign="top">

### Backend

| Technology  | Purpose          |
| ----------- | ---------------- |
| Next.js     | API Routes       |
| Node.js     | Runtime          |
| Drizzle ORM | Database ORM     |
| PostgreSQL  | Database (Neon.tech) |
| JWT (jose)  | Authentication   |
| bcrypt      | Password Hashing |

</td>
</tr>
</table>

## 📸 Screenshots

### Login Page

Clean and modern login interface.

![Login](docs/screenshots/login.png)

### Dashboard

Modern dashboard with document statistics and recent activity.

![Dashboard](docs/screenshots/dashboard.png)

### Document Editor

Full-featured rich text editor with client selection and category management.

![Document Editor](docs/screenshots/edit-document.png)

## 📁 Project Structure

```
doctrack/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Public routes (login)
│   ├── (protected)/        # Protected routes (dashboard, documents, etc.)
│   └── api/                # API Routes
│       ├── auth/           # Authentication endpoints
│       ├── documents/      # Document CRUD endpoints
│       └── users/          # User management endpoints
├── components/             # Reusable UI components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and helpers
│   ├── storage.ts          # Data access layer
│   ├── db.ts               # Database connection
│   ├── session.ts          # JWT session management
│   └── auth-helpers.ts     # Authentication helpers
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle ORM schemas
├── scripts/                # Utility scripts
│   └── seed.ts             # Database seeding script
├── locales/                # i18n translation files
├── middleware.ts           # Next.js middleware for route protection
└── package.json
```

## 📝 Available Scripts

- `npm run dev` - Start development server (runs on http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes to Neon.tech
- `npm run seed` - Seed database with test data

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Neon.tech account (for PostgreSQL database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mmancilha/DocTrack.git
   cd DocTrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   SESSION_SECRET=your-secret-key-minimum-32-characters-long
   NODE_ENV=development
   ```
   
   **Important**: 
   - Get your `DATABASE_URL` from your Neon.tech project dashboard
   - `SESSION_SECRET` must be at least 32 characters long for security

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string from Neon.tech | Yes |
| `SESSION_SECRET` | Secret key for JWT sessions (min 32 chars) | Yes |
| `NODE_ENV` | Environment mode (`development` or `production`) | No |

## 👤 Author

<div align="center">

**Maycon Mancilha**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mayconmancilha/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mmancilha)

</div>

## 📄 License

Copyright © 2024 Maycon Mancilha. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without express written permission from the author.

For licensing inquiries, please contact via [LinkedIn](https://www.linkedin.com/in/mayconmancilha/).

---

<div align="center">

Made with ❤️ by [Maycon Mancilha](https://www.linkedin.com/in/mayconmancilha/)

</div>
