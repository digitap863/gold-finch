"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import logo from "../../public/logoo.png";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async ({ identifier, password }: { identifier: string; password: string }) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (!data.user.isApproved) {
        toast.info("Your account is not verified yet.");
        return;
      }
      
      // Store token in localStorage for API calls
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "salesman") router.push("/salesman");
      else router.push("/");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (identifier: string) => {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send reset link");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("OTP sent to your mobile number");
      setShowForgotPasswordModal(false);
      // Redirect to reset password page with mobile parameter
      router.push(`/reset-password?mobile=${forgotPasswordEmail}`);
      setForgotPasswordEmail("");
      // In development, show the OTP in console
      if (data.otpCode) {
        console.log("OTP Code:", data.otpCode);
        toast.info("Check console for OTP (development only)");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to send OTP");
      } else {
        toast.error("Failed to send OTP");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ identifier, password });
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email or mobile number");
      return;
    }
    forgotPasswordMutation.mutate(forgotPasswordEmail);
  };

  return (
    <div className="flex min-h-screen flex-col md:items-center md:justify-center bg-gradient-to-br from-background to-muted px-4 sm:px-0 md:pt-0 pt-5">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-6 py-7 sm:px-8 sm:py-10 rounded-2xl shadow-lg border border-border bg-card/90 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2">
          {/* <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-primary">G</span>
          </div> */}
          <Image src={logo} alt="Logo" className="md:w-[55%] w-[60%] h-[25%]"/>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Login to your account</CardTitle>
          <CardDescription className="text-center">Enter your mobile number and password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="w-full flex flex-col md:gap-5 gap-3 mt-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="identifier" className="text-sm font-medium text-foreground">Email or Mobile</label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Enter your email or mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="text-base placeholder:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10 text-base  placeholder:text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-primary hover:underline focus:outline-none"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Forgot Password?
              </button>
            </div>
            <CardFooter className="p-0">
              <Button type="submit" className="w-full mt-2" disabled={loginMutation.isPending} size="lg">
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
          {loginMutation.isError && (
            <div className="text-center text-destructive mt-4">
              {loginMutation.error instanceof Error ? loginMutation.error.message : "Login failed"}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="md:mt-6 mt-1 text-center w-full max-w-md">
        <span className="text-sm text-muted-foreground">Don&apos;t have an account? </span>
        <button
          className="text-sm text-primary font-medium hover:underline focus:outline-none cursor-pointer"
          onClick={() => router.push("/auth/salesman-request")}
        >
          Sign up
        </button>
      </div>

      {/* Contact Information */}
      <div className="mt-8 text-center w-full max-w-md px-4 absolute md:bottom-4 bottom-0 right-0create new ">
        <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm  shadow-lg border border-border/50">
          <p className="text-sm mb-2 font-medium text-gray-800">Contact Us</p>
          <div className="space-y-1">
            <p className="text-xs text-foreground/80">
              Vii 304/2, Martha Bhavan Road, Martha Bhavan P.O
            </p>
            <p className="text-xs text-foreground/80">Thrissur - 680005</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2 pt-2 border-t border-border/30">
              <a href="tel:9947033312" className="text-xs text-primary hover:underline">
                9947033312
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a href="mailto:hijodavis79@gmail.com" className="text-xs text-primary hover:underline">
                hijodavis79@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-6 relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xl font-bold"
              onClick={() => setShowForgotPasswordModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-center">Forgot Password?</h2>
            <p className="text-sm text-muted-foreground text-center">Enter your mobile number to receive an OTP for password reset.</p>
            <form onSubmit={handleForgotPasswordSubmit} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="forgotEmail" className="text-sm font-medium text-foreground">Mobile Number</label>
                <Input
                  id="forgotEmail"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  className="text-base placeholder:text-sm"
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                {forgotPasswordMutation.isPending ? "Checking..." : "Send OTP"}
              </Button>
            </form>
            {forgotPasswordMutation.isError && (
              <div className="text-center text-destructive text-sm">
                {forgotPasswordMutation.error instanceof Error ? forgotPasswordMutation.error.message : "Failed to send OTP"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
