"use client"
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

async function fetchProfile() {
  const res = await fetch("/api/salesman/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

async function updateProfile(profileData: { name?: string; email?: string; mobile?: string }) {
  const res = await fetch("/api/salesman/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export default function SalesmanProfilePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["salesman-profile"],
    queryFn: fetchProfile,
  });
  
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    mobile: "",
  });

  React.useEffect(() => {
    if (data?.profile) {
      setFormData({
        name: data.profile.name || "",
        email: data.profile.email || "",
        mobile: data.profile.mobile || "",
      });
    }
  }, [data]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !data?.profile) return <div className="p-6 text-destructive">Failed to load profile.</div>;
  const profile = data.profile;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Salesman Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input 
                placeholder="Name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                placeholder="Email" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <Input 
                placeholder="Mobile" 
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <span className="text-sm font-medium">Verification Status: </span>
              <Badge variant={profile.isApproved ? "default" : "secondary"}>
                {profile.isApproved ? "Approved" : "Pending"}
              </Badge>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 