# Positeasy Clone - Canteen Automation Ecosystem

## 🔐 Security Overhaul (Branch: krishna)

This branch represents a major security milestone for the Canteen Automation system, transitioning from open/unprotected endpoints to a robust **JWT-based Authentication** architecture.

### 🏗️ Ecosystem Architecture
- **Backend (Java/Spring Boot)**: Now fully protected by JWT guards. Includes `JwtAuthFilter`, `JwtUtil`, and enhanced `SecurityConfig`.
- **Frontend (Counter/Admin)**: Migrated to use an authenticated API wrapper (`src/api.ts`).
- **Ordering Site**: Also migrated to the shared security pattern.

### 🚀 Major Changes in this Branch

#### Backend Security
- **JWT Implementation**: Added token generation, validation, and filtering.
- **Role-Based Access**: Restricted sensitive endpoints (Orders, Wallets, Coupons) to authenticated users.
- **Rate Limiting**: Implemented `LoginRateLimiter` to prevent brute-force attacks.
- **CORS Configuration**: Updated to allow secure communication with frontend origins.

#### Frontend Hardening
- **API Wrapper**: Centralized all data fetching through a secure wrapper that injects authentication headers automatically.
- **Context Protection**: Updated `AuthContext` to persist tokens securely.
- **Screen Migration**: Every major page (POS, Inventory, Reports) has been refactored to use the new secure communication pattern.

### 🛠️ Developer Setup
1. **Backend**: Update `application.properties` with your `jwt.secret`.
2. **Frontend**: Ensure `.env` points to the correct backend URL.
3. **Migration**: See `migrate_fetch.ps1` in the `frontend` directory for details on how the transition was automated.

---
Developed by the Canteen Automation Team.
