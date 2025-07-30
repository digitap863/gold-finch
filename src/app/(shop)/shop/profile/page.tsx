import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ShopProfilePage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Shop Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shop Name</label>
              <Input placeholder="Shop Name" defaultValue="Goldfinch Jewellers" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <Input placeholder="GST Number" defaultValue="22AAAAA0000A1Z5" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input placeholder="Address" defaultValue="123 Main Street" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input placeholder="City" defaultValue="Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Input placeholder="State" defaultValue="Maharashtra" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <Input placeholder="Pincode" defaultValue="400001" />
            </div>
          </div>
          <hr className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Owner Name</label>
              <Input placeholder="Owner Name" defaultValue="Ajmal Ali" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input placeholder="Email" defaultValue="ajmal@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <Input placeholder="Mobile" defaultValue="9876543210" />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <span className="text-sm font-medium">Verification Status: </span>
              <Badge variant="default">Verified</Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Shop Status: </span>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 