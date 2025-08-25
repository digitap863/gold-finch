"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface SpecialItem {
  _id: string;
  name: string;
  image: string;
  weight: number;
}

const SalesmanSpecialItemsPage = () => {
  const [items, setItems] = useState<SpecialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/special-items");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Special Items</h1>
        <p className="text-muted-foreground">Browse available special items.</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {items.map((it) => (
            <div
              key={it._id}
              className="relative rounded-2xl overflow-hidden shadow-md bg-muted/30 group"
            >
              {/* Background Image */}
              <div className="relative h-96 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image}
                  alt={it.name}
                  className="h-full w-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
              </div>

              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                <div>
                  <div className="text-white text-xl font-bold drop-shadow-sm">
                    {it.name}
                  </div>
                  <div className="text-white/90 text-sm mt-1">{it.weight} g</div>
                </div>

                {/* <button
                  className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform"
                  aria-label="View"
                >
                  <ArrowRight className="h-5 w-5" />
                </button> */}
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div className="col-span-full text-center text-muted-foreground">
              No special items available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesmanSpecialItemsPage;


