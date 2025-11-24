# Sarthi API Documentation

This documentation details the RESTful API endpoints for the Sarthi microservices ecosystem.

---

## Table of Contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Auth Service](#1-auth-service)
- [Ride Service](#2-ride-service)
- [Marketplace Service](#3-marketplace-service)

---

## Base URLs

The Base URL depends on the service you are accessing:

- **Auth Service**: `/api` (Port 5001 / 5002)
- **Ride Service**: `/api` (Port 5003)
- **Marketplace Service**: `/api` (Port 5000)

---

## Authentication

Most endpoints require a JWT token. Pass it in the header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Auth Service

### Authentication

#### `POST /api/auth/google`

Authenticates a user via Google OAuth. Creates a new user if one doesn't exist.

**Body:**

```json
{
  "tokenId": "google_id_token_string",
  "role": "student" // Options: "student", "faculty", "staff"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "_id": "user_id",
    "email": "user@iiitg.ac.in",
    "role": "student",
    "fullName": "John Doe"
  }
}
```

**Notes:**
- Restricts login to `@iiitg.ac.in` domains (except for admins).
- Maps "staff" role to "admin" internally.

---

### User Profile

#### `GET /api/user/me`

Fetches the currently logged-in user's profile.

**Headers:** Authorization required.

**Response:**

```json
{
  "success": true,
  "user": { ...user_details }
}
```

---

#### `PUT /api/user/me`

Updates the current user's profile. Allowed fields depend on the user's role.

**Headers:** Authorization required.

**Body (Student):**

```json
{
  "fullName": "...",
  "rollNumber": "...",
  "course": "...",
  "department": "..."
}
```

**Body (Faculty):**

```json
{
  "fullName": "...",
  "department": "...",
  "employeeId": "..."
}
```

**Body (Admin/Staff):**

```json
{
  "fullName": "...",
  "role": "...",
  "staffId": "..."
}
```

**Response:**

```json
{
  "success": true,
  "user": { ...updated_user_details }
}
```

---

## 2. Ride Service

### Rides

#### `GET /api/rides`

Fetches all available rides.

**Response:** Array of ride objects.

---

#### `POST /api/rides`

Creates a new ride.

**Headers:** Authorization optional (Anonymous rides allowed, but owner info attached if token present).

**Body:**

```json
{
  "rideTitle": "Guwahati to IIITG",
  "pickupLocation": "Paltan Bazar",
  "dropoffLocation": "IIITG Campus",
  "rideDate": "2023-11-25T10:00:00.000Z",
  "availableSeats": 3,
  "price": 500,
  "description": "Leaving at 10 AM sharp."
}
```

---

#### `POST /api/rides/:id/join`

Sends a request to join a specific ride.

**Headers:** Authorization required.

**Response:** Returns the created request object.

---

### Ride Requests (User)

#### `GET /api/user/requests`

Fetches incoming join requests for rides owned by the current user.

**Headers:** Authorization required.

---

#### `GET /api/user/requests/outgoing`

Fetches outgoing join requests made by the current user.

**Headers:** Authorization required.

---

#### `GET /api/user/accepted`

Fetches all requests with status `accepted` where the user is either the requester or the owner.

**Headers:** Authorization required.

---

#### `PATCH /api/user/requests/:id`

Accept or reject a ride request.

**Headers:** Authorization required.

**Body:**

```json
{ 
  "status": "accepted" // or "rejected"
}
```

**Note:** Accepting a request automatically creates a chat room between the two users and decrements available seats.

---

### Chat

#### `GET /api/chats/:id`

Fetches chat history for a specific chat room.

**Headers:** Authorization required.

---

#### `POST /api/chats/:id/messages`

Sends a message to a chat room.

**Headers:** Authorization required.

**Body:**

```json
{ 
  "text": "Hello!" 
}
```

**Note:** Emits real-time socket events (`message`) to the room.

---

## 3. Marketplace Service

### Listings

#### `GET /api/listings`

Fetches all marketplace listings.

**Headers:** Authorization required.

**Query Params:** Optional filters (category, price, etc.) depending on controller implementation.

---

#### `POST /api/listings`

Creates a new marketplace listing.

**Headers:** Authorization required.

**Body:**

```json
{
  "title": "Bicycle",
  "description": "Good condition",
  "price": 3000,
  "category": "Vehicles",
  "condition": "Used",
  "images": ["url1", "url2"],
  "contactInfo": "9876543210"
}
```

---

#### `GET /api/listings/my-listings`

Fetches listings created by the current user.

**Headers:** Authorization required.

---

#### `GET /api/listings/:id`

Fetches a single listing details.

**Headers:** Authorization required.

---

#### `PUT /api/listings/:id`

Updates a listing.

**Headers:** Authorization required.

---

#### `DELETE /api/listings/:id`

Deletes a listing.

**Headers:** Authorization required.

---

#### `PATCH /api/listings/:id/sold`

Marks a listing as sold.

**Headers:** Authorization required.

---

### Marketplace User Data

#### `GET /api/user/profile`

Fetches the user's profile by proxying the request to the Auth Service.

**Headers:** Authorization required.

---

#### `GET /api/user/history/sold`

Fetches a history of items sold (listings created) by the user.

**Headers:** Authorization required.

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## WebSocket Events (Ride Service)

The Ride Service includes a Socket.IO server for real-time features.

### Connection

Connect to the Socket.IO server:

```javascript
const socket = io('http://localhost:5003', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

**Client → Server:**

- `join-chat`: Join a specific chat room
  ```javascript
  socket.emit('join-chat', { chatId: 'chat_room_id' });
  ```

- `send-message`: Send a message to a chat room
  ```javascript
  socket.emit('send-message', { 
    chatId: 'chat_room_id', 
    text: 'Hello!' 
  });
  ```

**Server → Client:**

- `message`: Receive a new message
  ```javascript
  socket.on('message', (data) => {
    console.log('New message:', data);
  });
  ```

- `ride-request-update`: Notification when a ride request is accepted/rejected
  ```javascript
  socket.on('ride-request-update', (data) => {
    console.log('Request status:', data.status);
  });
  ```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

---

## Support

For issues or questions about the API, please open an issue on the [GitHub repository](https://github.com/ringerH/IIITG_sarthi) or contact the development team.