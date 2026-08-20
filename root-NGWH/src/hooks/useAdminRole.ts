import { useState, useEffect } from "react";

export function useAdminRole() {
  const [role, setRole] = useState<"admin" | "subadmin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && data.authenticated && data.role) {
          setRole(data.role);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    role,
    isAdmin: role === "admin",
    isSubadmin: role === "subadmin",
    loading,
  };
}
