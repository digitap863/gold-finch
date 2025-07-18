"use client";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

async function fetchShopDetail(id: string) {
  const res = await fetch(`/api/admin/shop-requests/${id}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function updateShopStatus({ id, action }: { id: string; action: "approve" | "reject" }) {
  const res = await fetch(`/api/admin/shop-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export default function ShopRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop-request", id],
    queryFn: () => fetchShopDetail(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: updateShopStatus,
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["shop-requests"] });
      router.push("/admin/shoprequests");
    },
    onError: () => toast.error("Failed to update status"),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !data?.shop) return <div className="p-6 text-destructive">Failed to load shop details.</div>;

  const shop = data.shop;
  const owner = shop.ownerId || {};

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Shop Verification Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><b>Shop Name:</b> {shop.shopName}</div>
          <div><b>GST Number:</b> {shop.gstNumber || "-"}</div>
          <div><b>Address:</b> {shop.address}</div>
          <div><b>Owner:</b> {owner.name}</div>
          <div><b>Email:</b> {owner.email}</div>
          <div><b>Mobile:</b> {owner.mobile}</div>
          <div><b>Request Status:</b> <Badge variant={owner.requestStatus === 'pending' ? 'secondary' : owner.requestStatus === 'approved' ? 'default' : 'destructive'}>{owner.requestStatus}</Badge></div>
          <div><b>Shop Verified:</b> <Badge variant={shop.isVerified ? 'default' : 'secondary'}>{shop.isVerified ? 'Yes' : 'No'}</Badge></div>
          <div><b>Active:</b> <Badge variant={shop.isActive ? 'default' : 'destructive'}>{shop.isActive ? 'Yes' : 'No'}</Badge></div>
          <div><b>Created:</b> {new Date(shop.createdAt).toLocaleString()}</div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button
            variant="default"
            disabled={mutation.isPending || shop.isVerified}
            onClick={() => mutation.mutate({ id, action: "approve" })}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            disabled={mutation.isPending || owner.requestStatus === 'rejected'}
            onClick={() => mutation.mutate({ id, action: "reject" })}
          >
            Reject
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>Back</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 