"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { useState } from "react";
import { useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerShopOwner } from "@/lib/api/api";
import { toast } from "sonner";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  mobile: Yup.string().required("Mobile is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), undefined], "Passwords must match")
    .required("Confirm Password is required"),
  shopName: Yup.string().required("Shop name is required"),
  gstNumber: Yup.string(), // optional
  address: Yup.string().required("Address is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  pincode: Yup.string().required("Pincode is required"),
});

export default function ShopOwnerRegisterPage() {
  // Remove submitted state, use mutation state instead
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showApprovalMsg, setShowApprovalMsg] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      shopName: "",
      gstNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
    validationSchema,
    onSubmit: (values) => {
      registerMutation.mutate(values);
    },
  });

  // React Query mutation for registration
  const registerMutation = useMutation({
    mutationFn: registerShopOwner,
  });

  // Show toast and reset form on success (in effect)
  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast.success(
        "Registration submitted! Your shop registration is pending manufacturer approval."
      );
      formik.resetForm();
      registerMutation.reset();
      setShowApprovalMsg(true);
      setTimeout(() => setShowApprovalMsg(false), 5000);
    }
  }, [registerMutation.isSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-col items-center gap-2">
          {!showApprovalMsg ? (
            <>
              <CardTitle className="text-2xl font-bold tracking-tight text-center">
                Register Your Shop
              </CardTitle>
              <CardDescription className="text-center">
                Fill in your Shop Details
              </CardDescription>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-lg font-semibold mb-2">
                Registration Submitted!
              </div>
              <div className="text-muted-foreground text-sm">
                Your shop registration is pending manufacturer approval.
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {
            !showApprovalMsg ? (
    
          <form
            onSubmit={formik.handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2"
          >
            {/* Shop Owner Details */}
            <div>
              <div className="text-lg font-semibold mb-2">
                Shop Owner Details
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Name
                  </label>
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
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="mobile"
                    className="text-sm font-medium text-foreground"
                  >
                    Mobile Number
                  </label>
                  <Input
                    id="mobile"
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Mobile number"
                    type="tel"
                    aria-invalid={
                      formik.touched.mobile && !!formik.errors.mobile
                    }
                  />
                  {formik.touched.mobile && formik.errors.mobile && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.mobile}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Email address"
                    type="email"
                    aria-invalid={formik.touched.email && !!formik.errors.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      aria-invalid={
                        formik.touched.password && !!formik.errors.password
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.password}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      required
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      aria-invalid={
                        formik.touched.confirmPassword &&
                        !!formik.errors.confirmPassword
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <span className="text-xs text-destructive mt-1">
                        {formik.errors.confirmPassword}
                      </span>
                    )}
                </div>
              </div>
            </div>
            {/* Shop Details */}
            <div>
              <div className="text-lg font-semibold mb-2">Shop Details</div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="shopName"
                    className="text-sm font-medium text-foreground"
                  >
                    Shop Name
                  </label>
                  <Input
                    id="shopName"
                    name="shopName"
                    value={formik.values.shopName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Shop name"
                    aria-invalid={
                      formik.touched.shopName && !!formik.errors.shopName
                    }
                  />
                  {formik.touched.shopName && formik.errors.shopName && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.shopName}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="gstNumber"
                    className="text-sm font-medium text-foreground"
                  >
                    GST Number{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    value={formik.values.gstNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="GST number (optional)"
                    aria-invalid={
                      formik.touched.gstNumber && !!formik.errors.gstNumber
                    }
                  />
                  {formik.touched.gstNumber && formik.errors.gstNumber && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.gstNumber}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="address"
                    className="text-sm font-medium text-foreground"
                  >
                    Address
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Shop address"
                    aria-invalid={
                      formik.touched.address && !!formik.errors.address
                    }
                    rows={3}
                  />
                  {formik.touched.address && formik.errors.address && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.address}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="city"
                    className="text-sm font-medium text-foreground"
                  >
                    City
                  </label>
                  <Input
                    id="city"
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="City"
                    aria-invalid={formik.touched.city && !!formik.errors.city}
                  />
                  {formik.touched.city && formik.errors.city && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.city}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="state"
                    className="text-sm font-medium text-foreground"
                  >
                    State
                  </label>
                  <Select
                    value={formik.values.state}
                    onValueChange={(value) =>
                      formik.setFieldValue("state", value)
                    }
                    required
                  >
                    <SelectTrigger
                      aria-invalid={
                        formik.touched.state && !!formik.errors.state
                      }
                      id="state"
                      name="state"
                      className="w-full"
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.state && formik.errors.state && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.state}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="pincode"
                    className="text-sm font-medium text-foreground"
                  >
                    Pincode
                  </label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    placeholder="Pincode"
                    aria-invalid={
                      formik.touched.pincode && !!formik.errors.pincode
                    }
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <span className="text-xs text-destructive mt-1">
                      {formik.errors.pincode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <CardFooter className="p-0">
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={registerMutation.status === "pending"}
                >
                  {registerMutation.status === "pending"
                    ? "Registering..."
                    : "Register Shop"}
                </Button>
              </CardFooter>
            </div>
          </form>
          ) : (
            <></>
          )}

          {registerMutation.isError && (
            <div className="text-center text-destructive mt-4">
              {registerMutation.error instanceof Error
                ? registerMutation.error.message
                : "Registration failed"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
