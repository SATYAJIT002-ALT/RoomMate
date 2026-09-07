"use client";

import React, { useState, useEffect } from "react";
import NotFound from "@/app/not-found";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // While checking auth, show nothing / clean blank background
  if (loading || isAdmin === null) {
    return <div className="min-h-screen bg-transparent" />;
  }

  // If NOT an admin, return 404 Not Found as if the page doesn't exist
  if (!isAdmin) {
    return <NotFound />;
  }

  // Only verified ADMIN accounts can see this content
  return <>{children}</>;
}
