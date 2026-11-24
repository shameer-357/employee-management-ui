# Employee Portal - Frontend SPA

A modern, responsive, enterprise-grade Employee Management Single Page Application (SPA) built with **React 19**, **TypeScript**, and **Vite**. Features Role-Based Access Control (RBAC), secure JWT authentication, paginated & searchable data views, inline editing, user management, and multi-stage Docker deployment.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Core Framework** | [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Routing & Protection** | [React Router v7](https://reactrouter.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) (with Request & Response Interceptors) |
| **Authentication** | JWT Decode (`jwt-decode`), Bearer Token, Auto-Expiry Detection |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Custom CSS (Glassmorphism Dark Theme) |
| **Production Server** | [Nginx Alpine](https://hub.docker.com/_/nginx) with SPA Fallback |
| **Containerization** | Docker Multi-Stage Build |

---

## Key Features

### 1. Role-Based Access Control (RBAC) & Navigation
- **Dynamic UI Adapting to Roles**: Non-admin users (`USER`) have read-only access to employee records and their own profile. Administrative users (`ADMIN`) receive exclusive access to:
  - Add new employees (`/dashboard/register`)
  - Edit existing employee inline records
  - Delete employees with confirmation dialogs
  - Access system user management (`/dashboard/users`)
- **Active Navigation Indicator**: Sidebar dynamically highlights the active route using React Router `NavLink`. Restricted routes are automatically hidden from unauthorized users.

### 2. Comprehensive Route Protection
- **`ProtectedRoute`**: Inspects `localStorage` for a JWT token, decodes payload using `jwt-decode`, and validates expiration (`exp`). Redirects unauthenticated or expired visitors to `/`.
- **`AdminRoute`**: Enforces strict privilege checks, redirecting non-admin users to `/dashboard/employees`.
- **Index Auto-Redirect**: Automatically redirects `/dashboard` to `/dashboard/employees` to eliminate blank dashboard states.

### 3. Paginated & Searchable Employee Directory
- **Spring Data Pagination Integration**: Connects to `GET /employees/page?page={page}&size=5` with reactive Previous/Next controls, total element count, and dynamic page indicator.
- **Multi-Field Instant Search**: Filters records on the fly by employee name, email, or department.
- **Inline Editing**: Allows administrators to update employee information in place with strict client-side validation.
- **Delete Confirmation Modal**: Replaces basic browser popups with an accessible, dedicated confirmation modal wired to `DELETE /employees/{id}`.

### 4. User Profile & Password Management
- **User Profile Details**: Fetches authenticated user information from `GET /users/me` (Username, User ID, Role badge).
- **Password Update Form**: Secure change password flow via `PUT /users/change-password` with current password verification, 6+ character constraints, confirmation matching, and clear feedback banners.

### 5. Admin User Management
- **User Directory**: Lists all registered portal accounts (`GET /users`) with role badges.
- **User Provisioning**: Form to create new user accounts (`POST /users`) with customizable role assignment (`ADMIN` or `USER`).

### 6. Resilient API Client & Error Handling
- **Environment-Driven Base URL**: Loads `baseURL` from `import.meta.env.VITE_API_URL` with a sensible fallback.
- **Authorization Interceptor**: Automatically attaches `Bearer <token>` to all outgoing requests.
- **Session Auto-Logout**: Response interceptor intercepts `401 Unauthorized` responses, flushes `localStorage`, and redirects to `/`.

---

## Screenshots

> *Drop your application screenshots into a `/screenshots` folder or replace the placeholders below with your PNG files.*

### 1. Login & Registration
| Login Page | Sign Up Page |
|:---:|:---:|
| ![Login Screen](./screenshots/login.png) | ![Sign Up Screen](./screenshots/signup.png) |
| *Secure login with credentials validation & loading state* | *User registration with validation & redirect* |

### 2. Employee Dashboard & Management
| Employee Directory (Search & Pagination) | Inline Edit & Delete Confirmation Modal |
|:---:|:---:|
| ![Employee Dashboard](./screenshots/dashboard.png) | ![Delete Modal](./screenshots/delete-modal.png) |
| *Paginated employee table with search filter* | *Safe deletion modal and inline editing* |

### 3. Administration & Profile
| Admin User Management | User Profile & Change Password |
|:---:|:---:|
| ![Manage Users](./screenshots/admin-users.png) | ![Profile](./screenshots/profile.png) |
| *User listing and account provisioning with role selection* | *Account details and password change with validation* |

---

## Project Structure

```text
employee-management-ui/
├── .env.example              # Environment variables template
├── .dockerignore             # Docker build exclusions
├── Dockerfile                # Multi-stage production container build
├── nginx.conf                # Nginx configuration with SPA routing fallback
├── package.json              # NPM dependencies and build scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── src/
    ├── api/
    │   └── api.ts            # Axios instance with request/response interceptors
    ├── components/
    │   ├── AdminRoute.tsx    # Route guard for ADMIN role
    │   ├── ProtectedRoute.tsx# Route guard for authenticated JWT sessions
    │   ├── Header.tsx        # Dashboard header with user info & role badge
    │   ├── Sidebar.tsx       # Dynamic navigation sidebar with RBAC visibility
    │   └── Footer.tsx        # App footer
    ├── layouts/
    │   └── DashboardLayout.tsx # Layout shell with sidebar, header, and outlet
    ├── pages/
    │   ├── Login.tsx         # Sign In page
    │   ├── SignUp.tsx        # Account registration page
    │   ├── Employees.tsx     # Paginated employee directory & delete modal
    │   ├── RegisterEmployee.tsx # Employee registration form (ADMIN)
    │   ├── Profile.tsx       # Current user profile & change password
    │   └── ManageUsers.tsx   # User directory & user provisioning (ADMIN)
    ├── styles/
    │   ├── commonStyles.css  # Global buttons, inputs, and card styles
    │   ├── dashboard.css     # Tables, pagination, modal, badges, and layout
    │   └── login.css         # Auth card and alert banner styles
    ├── utils/
    │   └── auth.ts           # JWT decoding, expiration check, and role helpers
    ├── App.tsx               # Route definitions & router tree
    └── main.tsx              # Application entry point
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend API**: Running Spring Boot backend (default: `http://localhost:8080`)

### 1. Environment Setup
Copy the example environment file and configure the backend API URL:

```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
VITE_API_URL=http://localhost:8080
```

### 2. Local Development

Install project dependencies:
```bash
npm install
```

Start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

### 3. Production Build & Linting

Run TypeScript type check and compile production bundle:
```bash
npm run build
```

Run ESLint to verify code quality:
```bash
npm run lint
```

Preview the production build locally:
```bash
npm run preview
```

---

## Docker Setup

The application includes a production-ready **multi-stage Docker build**:
- **Stage 1 (Build)**: Uses `node:20-alpine` to install dependencies and compile the production bundle (`dist/`).
- **Stage 2 (Serve)**: Uses lightweight `nginx:alpine` to serve static assets with gzip compression and React Router SPA fallback (`try_files $uri $uri/ /index.html;`).

### Build Docker Image
```bash
docker build -t employee-ui .
```

### Run Docker Container
```bash
docker run -d -p 80:80 --name employee-portal employee-ui
```

Access the application in your browser at `http://localhost`.

---

## API Integration Overview

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/auth/login` | `POST` | Public | Authenticates user and returns JWT token |
| `/auth/register` | `POST` | Public | Registers a new user account |
| `/employees/page` | `GET` | Authenticated | Paginated employee list (`page`, `size`) |
| `/employees` | `POST` | ADMIN | Creates a new employee |
| `/employees/{id}` | `PUT` | ADMIN | Updates an existing employee |
| `/employees/{id}` | `DELETE` | ADMIN | Deletes an employee |
| `/users/me` | `GET` | Authenticated | Returns current authenticated user profile |
| `/users/change-password` | `PUT` | Authenticated | Updates current user password |
| `/users` | `GET` | ADMIN | Lists all registered system users |
| `/users` | `POST` | ADMIN | Creates a new user with `ADMIN` or `USER` role |

---

## License

This project is licensed under the MIT License.
