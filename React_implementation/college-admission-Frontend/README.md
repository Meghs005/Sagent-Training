# EduAdmit — College Admissions Frontend

React frontend for the College Admissions system. Connects to a Spring Boot backend running on `http://localhost:8080`.

## Setup

```bash
npm install
npm start
```

The app will run at **http://localhost:3000**.

## Backend Requirements

Make sure your Spring Boot backend is running on port 8080 with CORS enabled for `http://localhost:3000`.

Add this to your main Spring Boot application class or a config file:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

## User Roles

- **STUDENT**: Register → Fill Application → Upload Documents → Pay Fee → Submit → Track Status
- **OFFICER**: Login → View all applications → Update status (Under Review / Accepted / Rejected) → Manage Courses

## Pages & Flow

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/register` | Public | Create account |
| `/login` | Public | Sign in |
| `/dashboard` | Student | Overview with stats |
| `/apply` | Student | 4-step application form |
| `/my-applications` | Student | View & cancel applications |
| `/application/:id` | Both | Application detail view |
| `/officer` | Officer | Review & update all applications |
| `/courses` | Officer | Add / edit / delete courses |

## API Endpoints Used

- `GET/POST /users` — Registration & login (password matched client-side)
- `GET/POST/PUT/DELETE /applications`
- `GET/POST/PUT/DELETE /courses`
- `GET/POST/PUT/DELETE /documents`
- `GET/POST /payments`
