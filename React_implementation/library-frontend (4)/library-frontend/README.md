# LibrariumOS — React Frontend

A production-grade React frontend for the Library Management System Spring Boot API.

## Features

- **Dashboard** — Live stats (users, books, issues, notifications) + recent issues table
- **Users** — Full CRUD: create, view, edit, delete users with role management (ADMIN/LIBRARIAN/MEMBER)
- **Books (Stock)** — Full CRUD with search by title/author/subject, availability highlighting
- **Issues** — Full CRUD with status filtering (ISSUED/RETURNED/OVERDUE), fine tracking
- **Notifications** — Full CRUD with user-based filtering and issue references

## Prerequisites

- Node.js 16+
- Your Spring Boot backend running on `http://localhost:8080`
- CORS enabled on the backend for `http://localhost:3000`

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app runs at `http://localhost:3000`.

## Backend CORS Configuration

Add this to your Spring Boot main class or a `@Configuration` class:

```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
        }
    };
}
```

## API Endpoints Used

| Entity        | Endpoint                        |
|---------------|---------------------------------|
| Users         | `/api/users`                    |
| Books         | `/api/books`                    |
| Issues        | `/api/issues`                   |
| Notifications | `/api/notifications`            |

All standard REST operations (GET, POST, PUT, DELETE) are fully wired.

## Project Structure

```
src/
├── api/
│   ├── axios.js        # Axios instance (baseURL: localhost:8080/api)
│   └── services.js     # API calls for all 4 entities
├── pages/
│   ├── Dashboard.js
│   ├── UsersPage.js
│   ├── BooksPage.js
│   ├── IssuesPage.js
│   └── NotificationsPage.js
├── App.js              # Router + sidebar layout
├── App.css             # Global design system (dark editorial theme)
└── index.js
```
