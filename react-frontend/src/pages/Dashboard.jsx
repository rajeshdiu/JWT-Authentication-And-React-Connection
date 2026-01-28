import api from "../api/axios";
import { useEffect, useState } from "react";
const Dashboard = () => {
  const [message, setMessage] = useState("");
  useEffect(() => {
    api.get("protected/")
      .then((res) => setMessage(res.data.message))
      .catch(() => setMessage("Unauthorized"));
  }, []);
  return (
    <div className="container">
      <div className="card">
        <h1>Dashboard</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Dashboard;
