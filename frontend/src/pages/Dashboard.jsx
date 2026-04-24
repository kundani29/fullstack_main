import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Dashboard</h2>
        <p>Welcome, {userEmail || "User"}!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;
