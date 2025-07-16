"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  mobile: Yup.string().required("Mobile is required"),
  email: Yup.string().email("Invalid email address"),
  shop: Yup.string().required("Shop code or name is required"),
});

export default function SalesmanRequestPage() {
  const [submitted, setSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      email: "",
      shop: "",
    },
    validationSchema,
    onSubmit: (values) => {
      setSubmitted(true);
      // TODO: Send to backend
      console.log("Salesman Request:", values);
    },
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
                <label htmlFor="shop" className="text-sm font-medium text-foreground">Shop Code or Shop Name</label>
                <Input
                  id="shop"
                  name="shop"
                  value={formik.values.shop}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  placeholder="Shop code or name"
                  aria-invalid={formik.touched.shop && !!formik.errors.shop}
                />
                {formik.touched.shop && formik.errors.shop && (
                  <span className="text-xs text-destructive mt-1">{formik.errors.shop}</span>
                )}
              </div>
              <CardFooter className="p-0">
                <Button type="submit" className="w-full mt-2" disabled={formik.isSubmitting}>Request Access</Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 