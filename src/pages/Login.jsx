import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { toast } from "sonner";
import { assets } from "../assets/assets";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailValid = emailRef.current?.validate();
    const passwordValid = passwordRef.current?.validate();

    if (!emailValid || !passwordValid) return;

    try {
      setLoading(true);

      await login(formData.email, formData.password);

      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="mb-6 flex justify-center">
          <img
            src={assets.logo.mono}
            alt="Nexora Logo"
            className="h-8 w-auto object-contain"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={emailRef}
            type="email"
            name="email"
            label="Email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            requiredMessage="Email is required"
          />

          <Input
            ref={passwordRef}
            type="password"
            name="password"
            label="Password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            requiredMessage="Password is required"
          />

          <Button type="submit" fullWidth={true} isLoading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
