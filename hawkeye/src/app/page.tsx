"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

export default function RootPage() {
  const router = useRouter();
  const { loading } = useMetadata();

  useEffect(() => {
    if (loading) return;
    router.replace("/dashboard");
  }, [loading, router]);

  return (
    <div className="flex h-dvh items-center justify-center">
      <LoadingIndicator size="lg" label="Loading Hawkeye..." />
    </div>
  );
}
