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
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const [step, setStep] = useState<'mobile' | 'otp' | 'password'>('mobile');
  const [mobile, setMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if mobile is passed from forgot password flow
    const mobileParam = searchParams.get("mobile");
    if (mobileParam) {
      setMobile(mobileParam);
      setStep('otp');
    }
  }, [searchParams]);

  const sendOtpMutation = useMutation({
    mutationFn: async (mobile: string) => {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: mobile }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("OTP sent to your mobile number");
      setStep('otp');
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to send OTP");
      } else {
        toast.error("Failed to send OTP");
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ mobile, otpCode }: { mobile: string; otpCode: string }) => {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otpCode }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "OTP verification failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("OTP verified successfully!");
      setStep('password');
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "OTP verification failed");
      } else {
        toast.error("OTP verification failed");
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ mobile, password }: { mobile: string; password: string }) => {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Password reset failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password has been reset successfully!");
      router.push("/");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Password reset failed");
      } else {
        toast.error("Password reset failed");
      }
    },
  });

  const handleMobileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mobile) {
      toast.error("Please enter your mobile number");
      return;
    }
    sendOtpMutation.mutate(mobile);
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the OTP code");
      return;
    }
    verifyOtpMutation.mutate({ mobile, otpCode });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    resetPasswordMutation.mutate({ mobile, password });
  };

  const renderStepContent = () => {
    switch (step) {
      case 'mobile':
        return (
          <>
            <CardHeader className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">GF</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-center">Reset Your Password</CardTitle>
              <CardDescription className="text-center">Enter your mobile number to receive an OTP</CardDescription>
              <p className="text-xs text-muted-foreground text-center">You can enter with or without country code (e.g., 7561880381 or +917561880381)</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMobileSubmit} className="w-full flex flex-col gap-5 mt-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="mobile" className="text-sm font-medium text-foreground">Mobile Number</label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="text-base placeholder:text-sm"
                  />
                </div>
                <CardFooter className="p-0">
                  <Button type="submit" className="w-full mt-2" disabled={sendOtpMutation.isPending} size="lg">
                    {sendOtpMutation.isPending ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </CardFooter>
              </form>
              {sendOtpMutation.isError && (
                <div className="text-center text-destructive mt-4">
                  {sendOtpMutation.error instanceof Error ? sendOtpMutation.error.message : "Failed to send OTP"}
                </div>
              )}
            </CardContent>
          </>
        );

      case 'otp':
        return (
          <>
            <CardHeader className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">GF</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-center">Verify OTP</CardTitle>
              <CardDescription className="text-center">Enter the 6-digit OTP sent to {mobile}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-5 mt-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="otpCode" className="text-sm font-medium text-foreground">OTP Code</label>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="placeholder:text-sm text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('mobile')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={verifyOtpMutation.isPending} size="lg">
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </form>
              {verifyOtpMutation.isError && (
                <div className="text-center text-destructive mt-4">
                  {verifyOtpMutation.error instanceof Error ? verifyOtpMutation.error.message : "OTP verification failed"}
                </div>
              )}
            </CardContent>
          </>
        );

      case 'password':
        return (
          <>
            <CardHeader className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">GF</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-center">Set New Password</CardTitle>
              <CardDescription className="text-center">Enter your new password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-5 mt-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="pr-10 text-base placeholder:text-sm"
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
                <div className="flex flex-col gap-1">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="pr-10 text-base placeholder:text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('otp')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={resetPasswordMutation.isPending} size="lg">
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              </form>
              {resetPasswordMutation.isError && (
                <div className="text-center text-destructive mt-4">
                  {resetPasswordMutation.error instanceof Error ? resetPasswordMutation.error.message : "Password reset failed"}
                </div>
              )}
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 sm:px-0">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-6 py-8 sm:px-8 sm:py-10 rounded-2xl shadow-lg border border-border bg-card/90 backdrop-blur-md">
        {renderStepContent()}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4 sm:px-0">
        <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-6 py-8 sm:px-8 sm:py-10 rounded-2xl shadow-lg border border-border bg-card/90 backdrop-blur-md">
          <CardHeader className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2 animate-pulse">
              <span className="text-2xl font-bold text-primary">GF</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-center">Loading...</CardTitle>
            <CardDescription className="text-center">Please wait</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
