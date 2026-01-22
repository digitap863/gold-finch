"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState as useReactState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  mobile: Yup.string().required("Mobile is required"),
  email: Yup.string().email("Invalid email address"),
  password: Yup.string().min(6, "Minimum length of password is 6").required("Password is required"),
  shopName: Yup.string().required("Shop name is required"),
  shopAddress: Yup.string().required("Shop address is required"),
  shopMobile: Yup.string().required("Shop mobile is required"),
});

export default function SalesmanRequestPage() {
  const [submitted, setSubmitted] = useReactState(false);
  const [showPassword, setShowPassword] = useReactState(false);
  const [otpSent, setOtpSent] = useReactState(false);
  const [otpCode, setOtpCode] = useReactState("");
  const [otpVerified, setOtpVerified] = useReactState(false);

  const mutation = useMutation({
    mutationFn: async (values: typeof formik.initialValues) => {
      const res = await fetch("/api/salesman/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Registration submitted! Pending approval by admin.");
      formik.resetForm();
      setSubmitted(true);
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode("");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Registration failed");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      email: "",
      password: "",
      shopName: "",
      shopAddress: "",
      shopMobile: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (!otpVerified) {
        toast.error("Please verify the OTP sent to your mobile number");
        return;
      }
      mutation.mutate(values);
    },
  });

  // Send OTP to mobile
  const sendOtpMutation = useMutation({
    mutationFn: async (mobile: string) => {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, context: "signup" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      setOtpVerified(false);
      toast.success("OTP sent to your mobile number");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Failed to send OTP");
    },
  });

  // Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ mobile, code }: { mobile: string; code: string }) => {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, code }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Invalid OTP");
      }
      return res.json();
    },
    onSuccess: () => {
      setOtpVerified(true);
      toast.success("Mobile number verified");
    },
    onError: (error: unknown) => {
      setOtpVerified(false);
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Invalid OTP");
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-2 sm:px-4 md:px-8">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-xl  mx-auto px-6 py-8 sm:px-8 sm:py-10 rounded-2xl shadow-lg border border-border bg-card/90 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Salesman Registration</CardTitle>
          <CardDescription className="text-center">Fill in your details to register as a salesman.</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold mb-2">Registration Submitted!</div>
              <div className="text-muted-foreground text-sm">Your registration is pending approval by admin.</div>
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6 mt-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  placeholder="Your name"
                  aria-invalid={formik.touched.name && !!formik.errors.name}
                  className="text-base  placeholder:text-sm"
                />
                {formik.touched.name && formik.errors.name && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.name}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="mobile" className="text-sm font-medium text-foreground">Mobile</label>
                <div className="flex gap-2">
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={(e) => {
                      setOtpVerified(false);
                      setOtpSent(false);
                      formik.handleChange(e);
                    }}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Mobile number"
                    type="tel"
                    aria-invalid={formik.touched.mobile && !!formik.errors.mobile}
                    className="text-base  placeholder:text-sm"
                  />
                  <Button
                    type="button"
                    // variant="secondary"
                    disabled={!formik.values.mobile || sendOtpMutation.isPending}
                    onClick={() => sendOtpMutation.mutate(formik.values.mobile)}
                  >
                    {sendOtpMutation.isPending ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">Enter 10-digit Indian number or with +91</span>
                {formik.touched.mobile && formik.errors.mobile && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.mobile}</span>
                )}
                {otpSent && (
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      id="otp"
                      name="otp"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      inputMode="numeric"
                      maxLength={6}
                      className="text-base placeholder:text-sm"
                    />
                    <Button
                      type="button"
                      onClick={() => verifyOtpMutation.mutate({ mobile: formik.values.mobile, code: otpCode })}
                      disabled={!otpCode || verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending ? "Verifying..." : otpVerified ? "Verified" : "Verify"}
                    </Button>
                  </div>
                )}
                {otpSent && !otpVerified && (
                  <span className="text-xs text-muted-foreground">Didn&apos;t get OTP? Click Resend OTP.</span>
                )}
                {otpVerified && (
                  <span className="text-xs text-green-600">Mobile number verified</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email <span className="text-muted-foreground">(optional)</span></label>
                <Input
                  id="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Email address"
                  type="email"
                  aria-invalid={formik.touched.email && !!formik.errors.email}
                  className="text-base  placeholder:text-sm"
                />
                {formik.touched.email && formik.errors.email && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.email}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Password"
                    aria-invalid={formik.touched.password && !!formik.errors.password}
                    className="pr-10 text-base  placeholder:text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.password}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="shopName" className="text-sm font-medium text-foreground">Shop Name</label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formik.values.shopName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  placeholder="Shop name"
                  aria-invalid={formik.touched.shopName && !!formik.errors.shopName}
                  className="text-base  placeholder:text-sm"
                />
                {formik.touched.shopName && formik.errors.shopName && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.shopName}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="shopAddress" className="text-sm font-medium text-foreground">Shop Address</label>
                <Textarea
                  id="shopAddress"
                  name="shopAddress"
                  value={formik.values.shopAddress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  placeholder="Shop address"
                  aria-invalid={formik.touched.shopAddress && !!formik.errors.shopAddress}
                  className="text-base  placeholder:text-sm"
                />
                {formik.touched.shopAddress && formik.errors.shopAddress && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.shopAddress}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="shopMobile" className="text-sm font-medium text-foreground">Shop Mobile</label>
                <Input
                  id="shopMobile"
                  name="shopMobile"
                  value={formik.values.shopMobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  placeholder="Shop mobile number"
                  type="tel"
                  aria-invalid={formik.touched.shopMobile && !!formik.errors.shopMobile}
                  className="text-base  placeholder:text-sm"
                />
                {formik.touched.shopMobile && formik.errors.shopMobile && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.shopMobile}</span>
                )}
              </div>
              <CardFooter className="p-0">
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={mutation.isPending || !otpVerified}
                  size="lg"
                >
                  {mutation.isPending ? "Submitting..." : otpVerified ? "Register" : "Verify OTP to Register"}
                </Button>
              </CardFooter>
            </form>
          )}
          {mutation.isError && (
            <div className="text-center text-destructive mt-4">
              {mutation.error instanceof Error ? mutation.error.message : "Registration failed"}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 text-center w-full max-w-sm mx-auto">
        <span className="text-sm text-muted-foreground">Already have an account? </span>
        <Link href="/" className="text-sm text-primary font-medium hover:underline focus:outline-none cursor-pointer">
          Login
        </Link>
      </div>
    </div>
  );
} 