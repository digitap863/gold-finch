"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);
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
      if (!data.user.isVerified) {
        toast.info("Your account is not verified yet.");
        return;
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ identifier, password });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-primary">GF</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Login to your account</CardTitle>
          <CardDescription className="text-center">Enter your mobile number and password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-2">
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
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <CardFooter className="p-0">
              <Button type="submit" className="w-full mt-2" disabled={loginMutation.isPending}>
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
      <div className="mt-6 text-center">
        <span className="text-sm text-muted-foreground">Don&apos;t have an account? </span>
        <button
          className="text-sm text-primary font-medium hover:underline focus:outline-none cursor-pointer"
          onClick={() => setShowSignupModal(true)}
        >
          Sign up
        </button>
      </div>
      {/* Modal for sign up options */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col items-center gap-6 relative">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xl font-bold"
              onClick={() => setShowSignupModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-center">Sign Up</h2>
            <p className="text-sm text-muted-foreground text-center">Choose how you want to get started:</p>
            <div className="flex flex-col gap-3 w-full">
              <Button variant="secondary" className="w-full" onClick={() => router.push("/auth/salesman-request")}>Salesman? Request Access</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
