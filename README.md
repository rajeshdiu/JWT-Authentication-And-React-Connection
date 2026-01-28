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

## Complete Setup from Scratch

If you're starting from scratch, follow these steps to set up the entire project.

### Django Backend Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv myEnv
   ```

2. **Activate the virtual environment:**
   ```bash
   myEnv\Scripts\activate  # On Windows
   # or
   source myEnv/bin/activate  # On macOS/Linux
   ```

3. **Install Django:**
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
   ```

4. **Create a new Django project:**
   ```bash
   django-admin startproject myProject
   cd myProject
   ```

5. **Create a Django app:**
   ```bash
   python manage.py startapp myApp
   ```

6. **Configure settings.py:**
   - Add the following to `INSTALLED_APPS`:
     ```python
     INSTALLED_APPS = [
         # ... existing apps
         'rest_framework',
         'corsheaders',
         'myApp',
     ]
     ```
   - Add CORS settings:
     ```python
     CORS_ALLOW_ALL_ORIGINS = False
     CORS_ALLOWED_ORIGINS = [
         "http://localhost:5173",
         "http://127.0.0.1:5173",
     ]
     ```
   - Configure REST Framework and JWT:
     ```python
     from datetime import timedelta

     REST_FRAMEWORK = {
         'DEFAULT_AUTHENTICATION_CLASSES': (
             'rest_framework_simplejwt.authentication.JWTAuthentication',
         ),
     }

     SIMPLE_JWT = {
         'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
         'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
         'AUTH_HEADER_TYPES': ('Bearer',),
     }
     ```
   - Add CORS middleware:
     ```python
     MIDDLEWARE = [
         'corsheaders.middleware.CorsMiddleware',
         'django.middleware.common.CommonMiddleware',
         # ... other middleware
     ]
     ```

7. **Create views and URLs:**
   - In `myApp/views.py`:
     ```python
     from rest_framework.views import APIView
     from rest_framework.response import Response
     from rest_framework.permissions import IsAuthenticated

     class ProtectedView(APIView):
         permission_classes = [IsAuthenticated]

         def get(self, request):
             return Response({"message": "JWT authentication successful"})
     ```
   - In `myApp/urls.py`:
     ```python
     from django.urls import path
     from myApp.views import ProtectedView

     urlpatterns = [
         path('protected/', ProtectedView.as_view()),
     ]
     ```
   - In `myProject/urls.py`:
     ```python
     from django.contrib import admin
     from django.urls import path, include
     from rest_framework_simplejwt.views import (
         TokenObtainPairView,
         TokenRefreshView,
         TokenVerifyView,
     )

     urlpatterns = [
         path('admin/', admin.site.urls),
         path('api/', include('myApp.urls')),
         path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
         path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
         path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
     ]
     ```

8. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

9. **Create requirements.txt:**
   ```bash
   pip freeze > requirements.txt
   ```

### React Frontend Setup

1. **Create a new React project with Vite:**
   ```bash
   npm create vite@latest react-frontend -- --template react
   cd react-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install axios react-router-dom
   ```

3. **Project Structure Setup:**
   - Create the following directories and files:
     ```
     src/
     ├── api/
     │   ├── auth.js
     │   └── axios.js
     ├── auth/
     │   ├── Login.jsx
     │   ├── Logout.jsx
     │   └── PrivateRoute.jsx
     ├── components/
     │   └── Navbar.jsx
     └── pages/
         ├── Home.jsx
         └── Dashboard.jsx
     ```

4. **Configure Axios (src/api/axios.js):**
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
           const refresh = localStorage.getItem("refresh_token");
           const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
             refresh,
           });
           localStorage.setItem("access_token", response.data.access);
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

5. **Authentication API (src/api/auth.js):**
   ```javascript
   import axios from "./axios";

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

6. **Authentication Components:**
   - **Login.jsx:**
     ```javascript
     import { useState } from "react";
     import { loginUser } from "../api/auth";

     const Login = () => {
       const [username, setUsername] = useState("");
       const [password, setPassword] = useState("");

       const handleSubmit = async (e) => {
         e.preventDefault();
         try {
           await loginUser(username, password);
           window.location.href = "/dashboard";
         } catch (error) {
           alert("Login failed");
         }
       };

       return (
         <form onSubmit={handleSubmit}>
           <input
             type="text"
             placeholder="Username"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
           />
           <input
             type="password"
             placeholder="Password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
           />
           <button type="submit">Login</button>
         </form>
       );
     };

     export default Login;
     ```
   - **PrivateRoute.jsx:**
     ```javascript
     import { Navigate } from "react-router-dom";

     const PrivateRoute = ({ children }) => {
       const token = localStorage.getItem("access_token");
       return token ? children : <Navigate to="/login" />;
     };

     export default PrivateRoute;
     ```
   - **Logout.jsx:**
     ```javascript
     import { logoutUser } from "../api/auth";

     const Logout = () => {
       const handleLogout = () => {
         logoutUser();
         window.location.href = "/";
       };

       return <button onClick={handleLogout}>Logout</button>;
     };

     export default Logout;
     ```

7. **Pages:**
   - **Home.jsx:**
     ```javascript
     const Home = () => <h1>Welcome to the Home Page</h1>;
     export default Home;
     ```
   - **Dashboard.jsx:**
     ```javascript
     import api from "../api/axios";

     const Dashboard = () => {
       const [data, setData] = useState(null);

       useEffect(() => {
         api.get("protected/").then((response) => setData(response.data));
       }, []);

       return (
         <div>
           <h1>Dashboard</h1>
           {data && <p>{data.message}</p>}
         </div>
       );
     };

     export default Dashboard;
     ```

8. **App.jsx (Routing Setup):**
   ```javascript
   import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
   import Home from "./pages/Home";
   import Dashboard from "./pages/Dashboard";
   import Login from "./auth/Login";
   import PrivateRoute from "./auth/PrivateRoute";
   import Navbar from "./components/Navbar";

   function App() {
     return (
       <Router>
         <Navbar />
         <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/login" element={<Login />} />
           <Route
             path="/dashboard"
             element={
               <PrivateRoute>
                 <Dashboard />
               </PrivateRoute>
             }
           />
         </Routes>
       </Router>
     );
   }

   export default App;
   ```

9. **Navbar.jsx:**
   ```javascript
   import { Link } from "react-router-dom";
   import Logout from "../auth/Logout";

   const Navbar = () => (
     <nav>
       <Link to="/">Home</Link>
       <Link to="/dashboard">Dashboard</Link>
       <Logout />
     </nav>
   );

   export default Navbar;
   ```

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
