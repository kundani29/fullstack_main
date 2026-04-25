import { Link, useLocation, useNavigate } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/notes", label: "Notes Feed" },
    { to: "/upload", label: "Upload" },
    { to: "/saved", label: "Saved" },
  ];

  return (
    <nav className="nav">
      <div className="nav-left">
        <span className="brand">Student Notes</span>
        {links.map((link) => (
          <Link
            key={link.to}
            className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
            to={link.to}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button className="logout-btn" type="button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default NavBar;
