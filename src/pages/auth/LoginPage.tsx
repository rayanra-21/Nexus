import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  CircleDollarSign,
  Building2,
  LogIn,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { UserRole } from "../../types";

// Password Strength Helper
const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let label = "Weak";
  let color = "bg-red-500";

  if (score >= 4) {
    label = "Strong";
    color = "bg-green-500";
  } else if (score >= 3) {
    label = "Medium";
    color = "bg-yellow-500";
  }

  return { score, label, color };
};

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("entrepreneur");

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // STEP 1 SUBMIT (Generate OTP)
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // Generate OTP (mock)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otpCode);

      // Move to OTP step
      setStep(2);

      console.log("Generated OTP (demo):", otpCode);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 SUBMIT (Verify OTP + Login)
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, role);

      navigate(role === "entrepreneur"
        ? "/dashboard/entrepreneur"
        : "/dashboard/investor"
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === "entrepreneur") {
      setEmail("sarah@techwave.io");
      setPassword("password123");
    } else {
      setEmail("michael@vcinnovate.com");
      setPassword("password123");
    }

    setRole(userRole);
    setStep(1);
    setOtp("");
    setGeneratedOtp(null);
    setError(null);
  };

  const resetLogin = () => {
    setStep(1);
    setOtp("");
    setGeneratedOtp(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Business Nexus
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          Secure login with 2FA verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 FORM */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleStep1}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I am a
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === "entrepreneur"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setRole("entrepreneur")}
                  >
                    <Building2 size={18} className="mr-2" />
                    Entrepreneur
                  </button>

                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === "investor"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setRole("investor")}
                  >
                    <CircleDollarSign size={18} className="mr-2" />
                    Investor
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />

                {/* PASSWORD STRENGTH */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Password strength</span>
                    <span className="font-semibold">{strength.label}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<ShieldCheck size={18} />}
              >
                Continue (2FA)
              </Button>
            </form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleStep2}>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Enter OTP Verification
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  We sent a 6-digit OTP to your email.
                </p>

                {/* DEMO OTP SHOW */}
                <p className="text-xs text-gray-500 mt-2">
                  Demo OTP:{" "}
                  <span className="font-semibold text-primary-600">
                    {generatedOtp}
                  </span>
                </p>
              </div>

              <Input
                label="6-digit OTP"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                fullWidth
                maxLength={6}
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                leftIcon={<LogIn size={18} />}
              >
                Verify & Login
              </Button>

              <Button
                type="button"
                fullWidth
                variant="outline"
                onClick={resetLogin}
              >
                Back
              </Button>
            </form>
          )}

          {/* DEMO ACCOUNTS */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => fillDemoCredentials("entrepreneur")}
                leftIcon={<Building2 size={16} />}
              >
                Entrepreneur Demo
              </Button>

              <Button
                variant="outline"
                onClick={() => fillDemoCredentials("investor")}
                leftIcon={<CircleDollarSign size={16} />}
              >
                Investor Demo
              </Button>
            </div>
          </div>

          {/* REGISTER */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
