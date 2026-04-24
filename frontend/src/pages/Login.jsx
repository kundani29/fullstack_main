import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const data = await loginUser(formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      navigate("/dashboard");
      return { message: "Login successful" };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
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
