"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSeasonsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/matches");
  }, [router]);

  return (
    <div style={{ color: "#94a3b8", padding: "3rem", textAlign: "center" }}>
      Redirecting to Match &amp; Season Management...
    </div>
  );
}
