# LibraryOS — React Frontend

A full-featured Library Management System frontend built with React, connecting to your Spring Boot backend.

## Setup & Run

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

> Make sure your Spring Boot backend is running on `http://localhost:8080`

## Features

### Student Portal
- **Login / Register** — Role-based authentication (Student / Librarian)
- **Browse Books** — Search by title, author, or subject with genre tag filters
- **Cart System** — Add books to cart and issue with a chosen return date
- **My Issues** — View all issued books with due dates and status
- **Notifications** — Library messages and alerts
- **Payment Page** — Pay outstanding fines with a card form

### Librarian Portal
- **Dashboard** — Stats overview (total books, users, issued, overdue)
- **Book Inventory** — Add, edit, delete books with full CRUD
- **Issued Books** — Track all issues, mark books as returned
- **Fine Management** — View overdue books, impose fines (late/lost/damaged), auto-notifies students
- **User Management** — View all users with their issue history and fines

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST/PUT/DELETE | `/api/users` | User CRUD |
| GET/POST/PUT/DELETE | `/api/books` | Book stock CRUD |
| GET/POST/PUT/DELETE | `/api/issues` | Book issue CRUD |
| GET/POST/PUT/DELETE | `/api/notifications` | Notification CRUD |

## Notes
- Authentication is username/password matched against the backend (no JWT currently)
- Fine imposition automatically sends a notification to the student
- The payment page marks fines as PAID on the backend
- Cart data is stored in React state (resets on refresh by design)
