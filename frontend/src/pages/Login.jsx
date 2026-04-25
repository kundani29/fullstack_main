import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const data = await loginUser(formData);
      const token = data?.token || data?.accessToken || data?.data?.token;
      const email = data?.user?.email || data?.data?.user?.email || formData.email;
      const name = data?.user?.name || data?.data?.user?.name || "";
      const role = data?.user?.role || data?.data?.user?.role || "student";

      if (!token) {
        return { message: data?.message || "Login failed" };
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);
      localStorage.setItem("userRole", role);
      navigate("/dashboard", { replace: true });
      return { message: "Login successful" };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed";
      return { message };
    }
  };

  return (
    <div className="page">
      <AuthForm
        title="Login"
        buttonText="Login"
        onSubmit={handleLogin}
        alternateText="Don't have an account?"
        alternateLinkText="Sign up"
        onAlternateClick={() => navigate("/signup")}
      />
    </div>
  );
}

export default Login;
