# 🌿 FreshMart — Grocery Delivery Frontend

React frontend for the Grocery Delivery Spring Boot backend.

---

## 📋 Prerequisites

- Node.js v16+
- Your Spring Boot backend running on **http://localhost:8080**
- CORS must be enabled in your Spring Boot app

---

## 🚀 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

App runs at: **http://localhost:3000**

---

## ⚙️ Enable CORS in Spring Boot

Add this to your Spring Boot main class or a config class:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## 📄 Pages

| Page         | Route       | Description                                   |
|--------------|-------------|-----------------------------------------------|
| Login/Register | `/login`  | Auth with your backend `/users` & `/users/login` |
| Products     | `/products` | Browse products with category filters + add to cart |
| Cart         | `/cart`     | Review cart, apply discounts, place order, pay |
| Orders       | `/orders`   | View and cancel your orders                   |
| Delivery     | `/delivery` | Track delivery status with timeline           |

---

## 🔗 Backend API Endpoints Used

| Method | URL              | Purpose              |
|--------|------------------|----------------------|
| POST   | /users           | Register user        |
| POST   | /users/login     | Login                |
| GET    | /products        | Fetch all products   |
| POST   | /carts           | Create cart          |
| POST   | /orders          | Place order          |
| GET    | /orders          | Get all orders       |
| DELETE | /orders/{id}     | Cancel order         |
| POST   | /payments        | Make payment         |
| GET    | /deliveries      | Get deliveries       |
| GET    | /discounts       | Get discounts        |

---

## 🎨 Tech Stack

- React 18 + React Router v6
- Axios for API calls
- Context API for auth & cart state
- Google Fonts (Playfair Display + DM Sans)
- Pure CSS (no UI library)
