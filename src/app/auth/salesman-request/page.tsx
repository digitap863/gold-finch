"use client";
import { useState as useReactState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  mobile: Yup.string().required("Mobile is required"),
  email: Yup.string().email("Invalid email address"),
  password: Yup.string().min(6, "Password is required").required("Password is required"),
  shopName: Yup.string().required("Shop name is required"),
  shopAddress: Yup.string().required("Shop address is required"),
  shopMobile: Yup.string().required("Shop mobile is required"),
});

export default function SalesmanRequestPage() {
  const [submitted, setSubmitted] = useReactState(false);
  const [showPassword, setShowPassword] = useReactState(false);

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
      mutation.mutate(values);
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted ">
      <Card className="w-full max-w-lg mx-auto p-10">
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
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 mt-2">
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
                />
                {formik.touched.name && formik.errors.name && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.name}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="mobile" className="text-sm font-medium text-foreground">Mobile</label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formik.values.mobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  placeholder="Mobile number"
                  type="tel"
                  aria-invalid={formik.touched.mobile && !!formik.errors.mobile}
                />
                {formik.touched.mobile && formik.errors.mobile && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.mobile}</span>
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
                    className="pr-10"
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
                />
                {formik.touched.shopMobile && formik.errors.shopMobile && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.shopMobile}</span>
                )}
              </div>
              <CardFooter className="p-0">
                <Button type="submit" className="w-full mt-2" disabled={mutation.isPending}>
                  {mutation.isPending ? "Submitting..." : "Register"}
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
    </div>
  );
} 