# real-time-chat

# Real-Time Chat Application

A full-stack real-time chat application built with Spring Boot and React, featuring WebSocket communication, JWT authentication, and a modern dark-themed UI.

![Chat Application](https://img.shields.io/badge/Status-Active-success)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-orange)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Project Structure](#project-structure)
- [Features in Detail](#features-in-detail)
- [Security](#security)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- **User Authentication** - Secure registration and login with JWT tokens
- **Real-Time Messaging** - Instant message delivery using WebSocket/STOMP
- **Chat Rooms** - Create, join, and manage public and private rooms
- **Password-Protected Rooms** - Secure private rooms with password authentication
- **Message Management** - Delete your own messages (soft delete)
- **Room Management** - Delete rooms (creator only)
- **User Status** - Real-time online/offline status indicators
- **Typing Indicators** - See when other users are typing
- **Message History** - Persistent message storage and retrieval
- **User Profiles** - Hover over usernames to see status and profile info

### UI/UX Features
- **Modern Dark Theme** - Beautiful, eye-friendly interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-Time Updates** - Instant UI updates via WebSocket
- **Search Functionality** - Search through available rooms
- **Confirmation Modals** - Prevent accidental deletions
- **Loading States** - Clear feedback during operations
- **Error Handling** - User-friendly error messages

---

## 🛠 Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring WebSocket** - Real-time communication (STOMP)
- **Spring Data JPA** - Data persistence layer
- **Hibernate** - ORM framework
- **H2 Database** - In-memory database (development)
- **PostgreSQL** - Production database (optional)
- **JWT (jjwt 0.11.5)** - Token-based authentication
- **Lombok** - Reduce boilerplate code
- **Maven** - Dependency management

### Frontend
- **React 18.2.0** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM 6** - Client-side routing
- **Axios** - HTTP client
- **STOMP.js** - WebSocket client library
- **SockJS** - WebSocket fallback support
- **Lucide React** - Icon library
- **CSS3** - Styling with CSS variables

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   React Client  │ ◄─────► │  Spring Boot    │
│                 │  HTTP   │   REST API      │
│  - WebSocket    │ WebSocket│  - WebSocket   │
│  - State Mgmt   │ ◄─────► │  - Security     │
│  - UI Components│         │  - Business     │
└─────────────────┘         │    Logic        │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   Database      │
                            │  (H2/PostgreSQL)│
                            └─────────────────┘
```

### Communication Flow

**REST API (HTTP):**
- User registration/login
- Room CRUD operations
- Message history retrieval
- User profile data

**WebSocket (STOMP):**
- Real-time message broadcasting
- Typing notifications
- User status updates
- Message deletion notifications

---

## 📋 Prerequisites

### Required
- **Java 17 or higher** - [Download](https://adoptium.net/)
- **Node.js 16+ and npm** - [Download](https://nodejs.org/)
- **Maven 3.6+** - [Download](https://maven.apache.org/)

### Optional
- **PostgreSQL 12+** - For production deployment
- **Git** - For version control

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nanaaddae/real-time-chat.git
cd chat-application
```

### 2. Backend Setup

```bash
cd chat-app-backend

# Install dependencies (Maven will download them)
mvn clean install

# This will:
# - Download all dependencies
# - Compile the code
# - Run tests
# - Create a JAR file in target/
```

### 3. Frontend Setup

```bash
cd chat-app-frontend

# Install dependencies
npm install

# This installs:
# - React and React DOM
# - React Router
# - Axios
# - WebSocket libraries
# - Icon library
# - All dev dependencies
```

---

## ⚙️ Configuration

### Backend Configuration

Edit `chat-app-backend/src/main/resources/application.properties`:

#### Development (H2 Database)
```properties
# Server
server.port=8080

# H2 In-Memory Database
spring.datasource.url=jdbc:h2:mem:chatdb
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=your-secret-key-change-this-in-production
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

#### Production (PostgreSQL)
```properties
# Server
server.port=8080

# PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/chatdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# CORS
cors.allowed-origins=${FRONTEND_URL}
```

### Frontend Configuration

Edit `chat-app-frontend/vite.config.js` if you need to change backend URL:

```javascript
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Change if backend is elsewhere
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
```

---

## 🚀 Running the Application

### Development Mode

#### Start Backend (Terminal 1)
```bash
cd chat-app-backend
mvn spring-boot:run

# Server starts at http://localhost:8080
# H2 Console at http://localhost:8080/h2-console
```

#### Start Frontend (Terminal 2)
```bash
cd chat-app-frontend
npm run dev

# App starts at http://localhost:3000
```

#### Access the Application
Open browser and navigate to: `http://localhost:3000`

### Production Build

#### Backend
```bash
cd chat-app-backend
mvn clean package

# Creates JAR file in target/
java -jar target/chat-app-backend-1.0.0.jar
```

#### Frontend
```bash
cd chat-app-frontend
npm run build

# Creates optimized build in dist/
# Serve with any static file server
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "displayName": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "displayName": "John Doe"
}
```

### Chat Room Endpoints

All room endpoints require `Authorization: Bearer <token>` header.

#### Create Room
```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "General Chat",
  "description": "General discussion",
  "type": "PUBLIC",
  "password": null
}

Response: 200 OK
{
  "id": 1,
  "name": "General Chat",
  "description": "General discussion",
  "type": "PUBLIC",
  "creatorUsername": "john_doe",
  "memberUsernames": ["john_doe"],
  "hasPassword": false,
  "createdAt": "2026-01-10T12:00:00"
}
```

#### Get All Rooms
```http
GET /api/rooms
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "General Chat",
    "type": "PUBLIC",
    ...
  }
]
```

#### Join Room
```http
POST /api/rooms/{roomId}/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "room_password"  // Only for private rooms
}

Response: 200 OK
```

#### Leave Room
```http
POST /api/rooms/{roomId}/leave
Authorization: Bearer <token>

Response: 200 OK
```

#### Delete Room
```http
DELETE /api/rooms/{roomId}
Authorization: Bearer <token>

Response: 200 OK
```

### Message Endpoints

#### Get Room Messages
```http
GET /api/messages/room/{roomId}?limit=50
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "content": "Hello!",
    "senderUsername": "john_doe",
    "senderDisplayName": "John Doe",
    "senderStatus": "ONLINE",
    "chatRoomId": 1,
    "type": "CHAT",
    "timestamp": "2026-01-10T12:00:00",
    "deleted": false
  }
]
```

#### Delete Message
```http
DELETE /api/messages/{messageId}
Authorization: Bearer <token>

Response: 200 OK
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/{username}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "username": "john_doe",
  "displayName": "John Doe",
  "avatarUrl": null,
  "status": "ONLINE",
  "createdAt": "2026-01-10T12:00:00"
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect(
  { Authorization: `Bearer ${token}` },
  (frame) => console.log('Connected:', frame)
);
```

### Subscriptions

#### Room Messages
```javascript
stompClient.subscribe('/topic/room/{roomId}', (message) => {
  const chatMessage = JSON.parse(message.body);
  // Handle message
});
```

#### Typing Notifications
```javascript
stompClient.subscribe('/topic/room/{roomId}/typing', (message) => {
  const typingNotification = JSON.parse(message.body);
  // Show typing indicator
});
```

#### Message Deletions
```javascript
stompClient.subscribe('/topic/room/{roomId}/delete', (message) => {
  const deletedMessage = JSON.parse(message.body);
  // Update UI to show deleted message
});
```

#### User Status Updates
```javascript
stompClient.subscribe('/topic/user-status', (message) => {
  const statusUpdate = JSON.parse(message.body);
  // statusUpdate: { username: "john_doe", status: "OFFLINE" }
});
```

### Publishing Messages

#### Send Chat Message
```javascript
stompClient.send(
  '/app/chat/{roomId}',
  {},
  JSON.stringify({
    content: 'Hello, World!',
    type: 'CHAT'
  })
);
```

#### Send Typing Notification
```javascript
stompClient.send('/app/chat/{roomId}/typing', {}, {});
```

#### Delete Message
```javascript
stompClient.send('/app/chat/{roomId}/delete/{messageId}', {}, {});
```

---

## 📁 Project Structure

### Backend Structure
```
chat-app-backend/
├── src/
│   ├── main/
│   │   ├── java/com/chatapp/
│   │   │   ├── ChatApplication.java          # Main entry point
│   │   │   ├── config/                       # Configuration classes
│   │   │   │   ├── CorsConfig.java           # CORS settings
│   │   │   │   ├── SecurityConfig.java       # Spring Security
│   │   │   │   └── WebSocketConfig.java      # WebSocket/STOMP
│   │   │   ├── controller/                   # REST controllers
│   │   │   │   ├── AuthController.java       # Auth endpoints
│   │   │   │   ├── ChatRoomController.java   # Room endpoints
│   │   │   │   ├── MessageController.java    # Message endpoints
│   │   │   │   └── UserController.java       # User endpoints
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── ChatMessageDTO.java
│   │   │   │   ├── ChatRoomDTO.java
│   │   │   │   ├── CreateRoomRequest.java
│   │   │   │   ├── JoinRoomRequest.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   └── UserDTO.java
│   │   │   ├── model/                        # JPA entities
│   │   │   │   ├── ChatRoom.java
│   │   │   │   ├── Message.java
│   │   │   │   ├── User.java
│   │   │   │   ├── MessageType.java          # Enum
│   │   │   │   ├── RoomType.java             # Enum
│   │   │   │   └── UserStatus.java           # Enum
│   │   │   ├── repository/                   # JPA repositories
│   │   │   │   ├── ChatRoomRepository.java
│   │   │   │   ├── MessageRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── security/                     # Security components
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtUtil.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   ├── service/                      # Business logic
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ChatRoomService.java
│   │   │   │   ├── MessageService.java
│   │   │   │   └── UserService.java
│   │   │   └── websocket/                    # WebSocket handlers
│   │   │       ├── WebSocketController.java
│   │   │       └── WebSocketEventListener.java
│   │   └── resources/
│   │       └── application.properties        # Configuration
│   └── test/                                 # Test files
├── pom.xml                                   # Maven configuration
└── README.md
```

### Frontend Structure
```
chat-app-frontend/
├── public/                                   # Static assets
├── src/
│   ├── components/                           # Reusable components
│   │   ├── ChatWindow.jsx                    # Chat interface
│   │   ├── ChatWindow.css
│   │   ├── CreateRoomModal.jsx               # Room creation modal
│   │   ├── CreateRoomModal.css
│   │   ├── DeleteRoomModal.jsx               # Deletion confirmation
│   │   ├── DeleteRoomModal.css
│   │   ├── PasswordPromptModal.jsx           # Private room password
│   │   ├── PasswordPromptModal.css
│   │   ├── ProtectedRoute.jsx                # Route guard
│   │   ├── RoomList.jsx                      # Room sidebar
│   │   ├── RoomList.css
│   │   ├── UserStatusTooltip.jsx             # Status hover tooltip
│   │   └── UserStatusTooltip.css
│   ├── contexts/                             # React contexts
│   │   ├── AuthContext.jsx                   # Auth state
│   │   └── UserStatusContext.jsx             # User statuses
│   ├── pages/                                # Page components
│   │   ├── Chat.jsx                          # Main chat page
│   │   ├── Chat.css
│   │   ├── Login.jsx                         # Login page
│   │   ├── Register.jsx                      # Registration page
│   │   ├── Auth.css                          # Shared auth styles
│   ├── services/                             # API services
│   │   ├── api.js                            # Axios config
│   │   ├── authService.js                    # Auth API calls
│   │   ├── chatRoomService.js                # Room API calls
│   │   ├── messageService.js                 # Message API calls
│   │   ├── userService.js                    # User API calls
│   │   └── websocketService.js               # WebSocket client
│   ├── App.jsx                               # Main app with routing
│   ├── main.jsx                              # React entry point
│   └── index.css                             # Global styles
├── .eslintrc.cjs                             # ESLint config
├── .gitignore
├── index.html                                # HTML entry point
├── package.json                              # Dependencies
├── vite.config.js                            # Vite config
└── README.md
```

---

## 🔍 Features in Detail

### Authentication System

**JWT Token Flow:**
1. User registers/logs in
2. Backend generates JWT token (24-hour expiration)
3. Frontend stores token in localStorage
4. Token automatically attached to all API requests
5. Token validated on each request
6. Auto-logout on token expiration

**Security Features:**
- Passwords hashed with BCrypt
- JWT signed with secret key
- Protected routes require authentication
- Token validation on every request
- CORS configured for allowed origins

### Real-Time Messaging

**Message Flow:**
1. User types message in input
2. Frontend sends via WebSocket (STOMP)
3. Backend saves to database
4. Backend broadcasts to all room subscribers
5. All clients receive and display message instantly

**Message Types:**
- **CHAT** - Regular chat messages
- **JOIN** - User joined room notification
- **LEAVE** - User left room notification
- **TYPING** - Typing indicator

### Chat Rooms

**Room Types:**
- **PUBLIC** - Anyone can join
- **PRIVATE** - Requires password to join

**Room Features:**
- Creator can delete room
- Members list with usernames
- Search functionality
- Join/leave functionality
- Password protection for private rooms
- Member count display

### Message Management

**Soft Delete System:**
- Message marked as `deleted: true` in database
- Original content preserved (for moderation/logs)
- Displayed as "[This message has been deleted]"
- Real-time broadcast of deletion to all users
- Only sender can delete their own messages

**Delete Button:**
- Only visible on hover
- Only shown for your own messages
- Confirmation dialog before deletion
- Instant update via WebSocket

### User Status System

**Status Types:**
- **ONLINE** - User is connected
- **OFFLINE** - User disconnected
- **AWAY** - User inactive (future feature)
- **BUSY** - User busy (future feature)

**Status Updates:**
- Automatic on WebSocket connect/disconnect
- Broadcast to all connected users
- Real-time updates in UI
- Visible in hover tooltip

### Room Password System

**Password Flow:**
1. Creator sets password when creating private room
2. Password hashed with BCrypt before storage
3. Non-members prompted for password when joining
4. Password validated against hash
5. Successful entry remembered in localStorage
6. No re-prompt needed on same browser

---

## 🔒 Security

### Backend Security

**Spring Security Configuration:**
- JWT-based stateless authentication
- BCrypt password hashing (strength 10)
- CORS configuration for specific origins
- Protected API endpoints
- WebSocket authentication via JWT

**Security Features:**
- SQL injection prevention (JPA/Hibernate)
- XSS protection (input validation)
- CSRF protection disabled (stateless API)
- Password strength validation
- Token expiration (24 hours)

**Protected Endpoints:**
```java
/api/auth/**        → Public (login, register)
/ws/**              → Public (WebSocket connection, but requires JWT)
/h2-console/**      → Public (development only)
/api/**             → Protected (requires JWT)
```

### Frontend Security

**Security Measures:**
- JWT stored in localStorage (consider httpOnly cookies for production)
- Token automatically included in requests
- Auto-logout on 401 responses
- No sensitive data in localStorage
- HTTPS recommended for production

**Security Best Practices:**
- Don't commit JWT secret to version control
- Use environment variables for secrets
- Enable HTTPS in production
- Implement rate limiting
- Add input sanitization

---

## 💾 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │  ChatRoom   │         │   Message   │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │────┐    │ id (PK)     │    ┌────│ id (PK)     │
│ username    │    │    │ name        │    │    │ content     │
│ email       │    │    │ description │    │    │ deleted     │
│ password    │    │    │ type        │    │    │ deleted_at  │
│ displayName │    │    │ password    │    │    │ type        │
│ avatarUrl   │    │    │ creator_id  │────┘    │ sender_id   │───┐
│ status      │    │    │ created_at  │         │ room_id     │───┤
│ created_at  │    │    └─────────────┘         │ timestamp   │   │
│ updated_at  │    │            │               └─────────────┘   │
└─────────────┘    │            │                       │         │
       │           │            │                       │         │
       └───────────┴────────────┴───────────────────────┴─────────┘
          Many-to-Many          One-to-Many        Many-to-One
       (chat_room_members)
```

### Tables

#### users
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'OFFLINE',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### chat_rooms
```sql
CREATE TABLE chat_rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    password VARCHAR(255),
    creator_id BIGINT NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);
```

#### messages
```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    type VARCHAR(20) NOT NULL,
    sender_id BIGINT NOT NULL,
    chat_room_id BIGINT NOT NULL,
    timestamp TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);
```

#### chat_room_members (Join Table)
```sql
CREATE TABLE chat_room_members (
    chat_room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (chat_room_id, user_id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

**Problem:** Port 8080 already in use
```
Solution: Change port in application.properties
server.port=8081
```

**Problem:** Database connection failed
```
Solution: Check database credentials in application.properties
Verify database is running (if using PostgreSQL)
```

**Problem:** Maven dependencies not downloading
```
Solution: 
mvn clean install -U
# Or delete ~/.m2/repository and retry
```

#### Frontend won't start

**Problem:** Port 3000 already in use
```
Solution: Change port in vite.config.js or kill process
lsof -ti:3000 | xargs kill -9  # Mac/Linux
```

**Problem:** Module not found errors
```
Solution:
rm -rf node_modules package-lock.json
npm install
```

#### WebSocket connection issues

**Problem:** WebSocket won't connect
```
Solution:
1. Check backend is running
2. Verify CORS settings in application.properties
3. Check browser console for errors
4. Ensure JWT token is valid
```

**Problem:** Messages not appearing
```
Solution:
1. Check WebSocket connection status
2. Verify you've joined the room
3. Check browser console for errors
4. Confirm backend is broadcasting (check logs)
```

#### Authentication issues

**Problem:** "Unauthorized" errors
```
Solution:
1. Check token exists: localStorage.getItem('token')
2. Verify token format: "Bearer eyJ..."
3. Token might be expired - login again
4. Check JWT secret matches in backend
```

**Problem:** Can't login after backend restart
```
Solution:
H2 database is in-memory - data is lost on restart
Register a new user or use PostgreSQL for persistence
```

#### CORS errors

**Problem:** "Access-Control-Allow-Origin" error
```
Solution:
1. Check cors.allowed-origins in application.properties
2. Verify SecurityConfig has CORS configured
3. Restart backend after changing CORS settings
```

### Debug Mode

**Enable verbose logging:**

Backend (`application.properties`):
```properties
logging.level.com.chatapp=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
```

Frontend (add to `main.jsx`):
```javascript
if (import.meta.env.DEV) {
  console.log('Running in development mode');
  window.DEBUG = true;
}
```

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Direct messaging between users
- [ ] File/image upload and sharing
- [ ] Message reactions (emoji)
- [ ] User profiles with avatars
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Message search
- [ ] Message editing
- [ ] Read receipts
- [ ] Push notifications
- [ ] Voice/video calls
- [ ] User blocking/reporting
- [ ] Room moderation (kick/ban users)
- [ ] Admin dashboard
- [ ] Message threads/replies
- [ ] Pinned messages
- [ ] Room categories
- [ ] User presence (last seen)
- [ ] Light theme option
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Redis for WebSocket scalability
- [ ] Message pagination (infinite scroll)
- [ ] Image optimization
- [ ] CDN for static assets
- [ ] Rate limiting
- [ ] API documentation (Swagger)
- [ ] Comprehensive test coverage
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Monitoring and logging (ELK stack)
- [ ] Performance optimization
- [ ] Code splitting (lazy loading)
- [ ] Service worker (PWA)
- [ ] WebSocket reconnection improvements

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

**Backend (Java):**
- Follow Java naming conventions
- Use Lombok for boilerplate reduction
- Write meaningful commit messages
- Add JavaDoc for public methods
- Follow SOLID principles

**Frontend (JavaScript/React):**
- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Keep components small and focused
- Add PropTypes or TypeScript (future)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Author

**Nana Addae**
- Email: nana_addae@yahoo.com
- LinkedIn: https://linkedin.com/in/nana-addae-4152781b2

---

## 🙏 Acknowledgments

- Spring Boot team for excellent documentation
- React team for the amazing framework
- STOMP protocol maintainers
- Lucide for beautiful icons
- The open-source community

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Troubleshooting](#troubleshooting) section**
2. **Search existing [GitHub Issues](https://github.com/yourusername/repo/issues)**
3. **Create a new issue** with:
   - Detailed description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Java version, Node version)

---

## 📊 Project Statistics

- **Lines of Code:** ~15,000+
- **Components:** 25+
- **API Endpoints:** 15+
- **WebSocket Events:** 6+
- **Database Tables:** 4
- **Technologies Used:** 20+

---

**Built with ❤️ using Spring Boot and React**

---

*Last Updated: January 2026*
