"use client";
import { useState as useReactState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  mobile: Yup.string().required("Mobile is required"),
  email: Yup.string().email("Invalid email address"),
  shop: Yup.string().required("Shop code or name is required"),
  password: Yup.string().min(6, "Password is required").required("Password is required"),
});

export default function SalesmanRequestPage() {
  const [submitted, setSubmitted] = useReactState(false);
  const [showPassword, setShowPassword] = useReactState(false);

  const mutation = useMutation({
    mutationFn: async (values: typeof formik.initialValues) => {
      const res = await fetch("/api/shop/salesman-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Submission failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request submitted! Pending approval by the shop owner.");
      formik.resetForm();
      setSubmitted(true);
    },
    onError: (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Submission failed");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      email: "",
      shop: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  // Fetch shops
  const { data: shops } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await fetch("/api/shops");
      return res.json();
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Salesman Access Request</CardTitle>
          <CardDescription className="text-center">Fill in your details to request access as a salesman.</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-lg font-semibold mb-2">Request Submitted!</div>
              <div className="text-muted-foreground text-sm">Your request is pending approval by the shop owner.</div>
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
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="shop" className="text-sm font-medium text-foreground">Shop Code or Shop Name</label>
                <Select
                  value={formik.values.shop}
                  onValueChange={value => formik.setFieldValue("shop", value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops?.map((shop: any) => (
                      <SelectItem key={shop._id} value={shop._id} >
                        {shop.shopName} 
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.shop && formik.errors.shop && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.shop}</span>
                )}
              </div>
              <CardFooter className="p-0">
                <Button type="submit" className="w-full mt-2" disabled={formik.isSubmitting || mutation.isPending}>
                  {mutation.isPending ? "Submitting..." : "Request Access"}
                </Button>
              </CardFooter>
            </form>
          )}
          {mutation.isError && (
            <div className="text-center text-destructive mt-4">
              {mutation.error instanceof Error ? mutation.error.message : "Submission failed"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 