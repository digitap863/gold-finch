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

async function updateShopName(shopName: string) {
  const res = await fetch("/api/salesman/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shopName }),
  });
  if (!res.ok) throw new Error("Failed to update shop name");
  return res.json();
}

export default function SalesmanProfilePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["salesman-profile"],
    queryFn: fetchProfile,
  });
  const mutation = useMutation({
    mutationFn: updateShopName,
    onSuccess: () => {
      toast.success("Shop name updated");
    },
    onError: () => toast.error("Failed to update shop name"),
  });

  const [shopName, setShopName] = React.useState("");
  React.useEffect(() => {
    if (data?.profile?.shopName) setShopName(data.profile.shopName);
  }, [data]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !data?.profile) return <div className="p-6 text-destructive">Failed to load profile.</div>;
  const profile = data.profile;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Salesman Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={e => {
            e.preventDefault();
            mutation.mutate(shopName);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input placeholder="Name" value={profile.name} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input placeholder="Email" value={profile.email} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <Input placeholder="Mobile" value={profile.mobile} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shop Name</label>
              <Input
                placeholder="Shop Name"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                required
                disabled
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <span className="text-sm font-medium">Verification Status: </span>
              <Badge variant={profile.isVerified ? "default" : "secondary"}>{profile.isVerified ? "Verified" : "Pending"}</Badge>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={mutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 