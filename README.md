# JWT Authentication Project

A full-stack web application implementing JWT (JSON Web Token) authentication with a Django REST API backend and a React frontend.

## Features

- User registration and login
- JWT token-based authentication
- Protected routes and API endpoints
- Secure token refresh mechanism
- CORS-enabled for frontend-backend communication
- SQLite database for development

## Tech Stack

### Backend
- **Django** - Web framework
- **Django REST Framework** - API development
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS handling
- **SQLite** - Database

### Frontend
- **React** - UI library
- **Vite** - Build tool and development server
- **Axios** - HTTP client for API calls
- **React Router DOM** - Client-side routing

## Prerequisites

Before running this project, make sure you have the following installed:

- **Python 3.8+** - For the Django backend
- **Node.js 16+** - For the React frontend
- **Git** - For version control

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/myProject
   ```

2. Activate the virtual environment:
   ```bash
   ../myEnv/Scripts/activate  # On Windows
   # or
   source ../myEnv/bin/activate  # On macOS/Linux
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. (Optional) Create a superuser for admin access:
   ```bash
   python manage.py createsuperuser
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd react-frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend

1. Ensure the virtual environment is activated:
   ```bash
   cd backend/myProject
   ../myEnv/Scripts/activate  # On Windows
   ```

2. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

   The backend will be available at `http://127.0.0.1:8000`

### Start the Frontend

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd react-frontend
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication Endpoints
- `POST /api/token/` - Obtain JWT token pair (access + refresh)
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/token/verify/` - Verify token validity

### Protected Endpoints
- `GET /api/protected/` - Example protected view (requires authentication)

### Django Admin
- `/admin/` - Django admin interface (if superuser created)

## JWT Authentication Flow

This application implements a complete JWT authentication system with the following flow:

### 1. User Registration/Login
- User provides username and password through the React frontend
- Frontend sends credentials to Django backend via POST request to `/api/token/`
- Django validates credentials and returns JWT token pair:
  - **Access Token**: Short-lived (60 minutes) for API authentication
  - **Refresh Token**: Long-lived (1 day) for obtaining new access tokens

### 2. Token Storage
- Tokens are stored in browser's localStorage for persistence
- Access token is included in Authorization header for API requests
- Refresh token is used to obtain new access tokens when they expire

### 3. Protected Route Access
- React Router guards protected routes using `PrivateRoute` component
- Component checks for valid access token in localStorage
- Redirects to login page if token is missing or invalid

### 4. Token Refresh
- When access token expires, frontend automatically requests new token using refresh token
- If refresh token is invalid/expired, user is redirected to login

### 5. Logout
- Removes both tokens from localStorage
- User is redirected to login page

## React Frontend Setup & Authentication

### Project Structure
```
react-frontend/src/
├── api/
│   └── auth.js          # Authentication API functions
├── auth/
│   ├── Login.jsx        # Login component
│   ├── Logout.jsx       # Logout component
│   └── PrivateRoute.jsx # Route protection component
├── components/
│   └── Navbar.jsx       # Navigation component
└── pages/
    ├── Home.jsx         # Public home page
    └── Dashboard.jsx    # Protected dashboard page
```

### Authentication Components

#### Login Component (`src/auth/Login.jsx`)
- Handles user login form
- Calls `loginUser()` API function
- Stores tokens in localStorage on success
- Redirects to dashboard on successful authentication

#### PrivateRoute Component (`src/auth/PrivateRoute.jsx`)
- Higher-order component for protecting routes
- Checks for access token in localStorage
- Renders protected component or redirects to login

#### Logout Component (`src/auth/Logout.jsx`)
- Calls `logoutUser()` to clear tokens
- Redirects to home/login page

### API Integration (`src/api/auth.js`)

The authentication API layer handles all backend communication:

```javascript
const BASE_URL = "http://127.0.0.1:8000/api/";

// Login function
export const loginUser = async (username, password) => {
  const response = await axios.post(`${BASE_URL}token/`, {
    username,
    password,
  });
  // Store tokens in localStorage
  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);
  return response.data;
};

// Logout function
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// Token refresh function
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  const response = await axios.post(`${BASE_URL}token/refresh/`, {
    refresh,
  });
  localStorage.setItem("access_token", response.data.access);
};
```

### Axios Configuration

For authenticated API calls, include the access token in headers:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        // Retry the original request with new token
        const token = localStorage.getItem("access_token");
        error.config.headers.Authorization = `Bearer ${token}`;
        return axios(error.config);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Usage

1. Start both backend and frontend servers as described above.

2. Open your browser and navigate to `http://localhost:5173` for the React frontend.

3. Register a new user account or login with existing credentials.

4. Upon successful authentication, you'll receive JWT tokens.

5. Access protected routes and API endpoints using the obtained tokens.

6. The frontend will automatically handle token storage and include them in API requests.

7. Tokens are automatically refreshed when they expire.

8. Logout clears all stored tokens and redirects to login.

## Project Structure

```
JWT Authentication/
├── backend/
│   ├── myEnv/          # Python virtual environment
│   └── myProject/      # Django project
│       ├── manage.py
│       ├── myApp/      # Main Django app
│       ├── myProject/  # Project settings
│       └── requirements.txt
└── react-frontend/     # React application
    ├── src/
    │   ├── api/        # API service functions
    │   ├── auth/       # Authentication components
    │   ├── components/ # Reusable UI components
    │   └── pages/      # Page components
    ├── package.json
    └── vite.config.js
```

## Development Notes

- The backend is configured to allow CORS from `http://localhost:5173` (Vite dev server).
- JWT access tokens expire after 60 minutes, refresh tokens after 1 day.
- Database is SQLite for development; consider PostgreSQL for production.
- Environment variables should be used for sensitive settings in production.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
