import { RegisterFormValues } from "./schema";

  
  export async function registerShopOwner(values: RegisterFormValues) {
        // Remove confirmPassword before sending
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = values;
    const res = await fetch("/api/register-shop-owner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }
    return res.json();
  }