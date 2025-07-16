"use client";
import { useState } from "react";
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
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Mobile:", mobile);
    console.log("Password:", password);
    // Add authentication logic here
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
              <label htmlFor="mobile" className="text-sm font-medium text-foreground">Mobile Number</label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
            </div>
            <CardFooter className="p-0">
              <Button type="submit" className="w-full mt-2">Login</Button>
            </CardFooter>
          </form>
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
              <Button variant="outline" className="w-full" onClick={() => router.push("/auth/register")}>Register your Shop</Button>
              <Button variant="secondary" className="w-full" onClick={() => router.push("/auth/salesman-request")}>Salesman? Request Access</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
