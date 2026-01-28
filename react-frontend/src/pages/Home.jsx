import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Welcome to JWT Authentication</h1>
        <p>Please login to access the dashboard.</p>
        <Link to="/login" className="btn">Login</Link>
      </div>
    </div>
  );
};

export default Home;
