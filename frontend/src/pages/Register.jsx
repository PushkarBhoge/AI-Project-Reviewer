import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import InteractiveBackground from "@/components/InteractiveBackground";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least one number");
      setIsSubmitting(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      setIsSubmitting(false);
      return;
    }
    try {
      await register({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(typeof err === "string" ? err : "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 pt-20 overflow-hidden">
      <InteractiveBackground />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative sm:w-[380px] w-full text-center border border-slate-200/80 dark:border-slate-800/80 rounded-3xl px-8 pb-8 pt-10 bg-white/95 dark:bg-slate-900/95 shadow-2xl shadow-purple-500/10 z-10 overflow-hidden"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-32 bg-purple-500/30 blur-2xl rounded-full pointer-events-none" />

        <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">
          Create Account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2.5 font-medium">
          Sign up to start auditing repositories
        </p>

        {error && (
          <div className="mt-5 flex gap-2.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-950/20 p-3 text-left text-xs font-medium text-rose-600 dark:text-rose-400 animate-slide-up">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-7 space-y-4">
          <div className="group flex items-center w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 h-12 rounded-xl overflow-hidden px-4 gap-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-purple-500 transition-colors"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>
            <input
              type="text"
              placeholder="Full Name"
              disabled={isSubmitting}
              className="border-none outline-none ring-0 w-full text-slate-800 dark:text-slate-100 bg-transparent text-sm font-medium placeholder:text-slate-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="group flex items-center w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 h-12 rounded-xl overflow-hidden px-4 gap-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-purple-500 transition-colors"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg>
            <input
              type="email"
              placeholder="Email Address"
              disabled={isSubmitting}
              className="border-none outline-none ring-0 w-full text-slate-800 dark:text-slate-100 bg-transparent text-sm font-medium placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="group flex items-center w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 h-12 rounded-xl overflow-hidden px-4 gap-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-focus-within:text-purple-500 transition-colors"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            <input
              type="password"
              placeholder="Password"
              disabled={isSubmitting}
              className="border-none outline-none ring-0 w-full text-slate-800 dark:text-slate-100 bg-transparent text-sm font-medium placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 w-full h-12 rounded-xl text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25 font-bold transition-all duration-200 cursor-pointer flex items-center justify-center hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-slate-500 dark:text-slate-400 text-sm mt-6 font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold transition"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
