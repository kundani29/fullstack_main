import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    try {
      await registerUser(formData);
      navigate("/login");
      return { message: "Signup successful. Please login." };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      return { message };
    }
  };

  return (
    <div className="page">
      <AuthForm
        title="Signup"
        buttonText="Create Account"
        onSubmit={handleSignup}
        showNameField
        alternateText="Already have an account?"
        alternateLinkText="Login"
        onAlternateClick={() => navigate("/login")}
      />
    </div>
  );
}

export default Signup;
