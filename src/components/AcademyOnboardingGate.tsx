"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { readOnboardingPreferences } from "@/lib/onboarding";

export function AcademyOnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (!readOnboardingPreferences(window.localStorage)) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        // Do not block the academy when browser storage is unavailable.
      }
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return <div role="status">Preparing your learning path…</div>;
  }

  return children;
}
