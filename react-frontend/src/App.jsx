import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./auth/Login";
import Logout from "./auth/Logout";
import PrivateRoute from "./auth/PrivateRoute"; // Your PrivateRoute

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Route */}
        <Route path="/dashboard" element={ <PrivateRoute> <Dashboard /> </PrivateRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
