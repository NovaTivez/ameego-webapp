"use client";

import { useCallback, useEffect, useState } from "react";

import { buildProgressSnapshot, type ProgressSnapshot } from "@/lib/progress/dashboard";

type ProgressDashboardState =
  | { status: "loading"; snapshot: null; error: null }
  | { status: "ready"; snapshot: ProgressSnapshot; error: null }
  | { status: "error"; snapshot: null; error: string };

export function useProgressDashboard() {
  const [state, setState] = useState<ProgressDashboardState>({
    status: "loading",
    snapshot: null,
    error: null,
  });

  const load = useCallback(() => {
    setState({ status: "loading", snapshot: null, error: null });
    try {
      const snapshot = buildProgressSnapshot(window.localStorage);
      setState({ status: "ready", snapshot, error: null });
    } catch (error) {
      setState({
        status: "error",
        snapshot: null,
        error:
          error instanceof Error
            ? error.message
            : "Progress records could not be read from this browser.",
      });
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) load();
    });
    return () => {
      isActive = false;
    };
  }, [load]);

  return {
    ...state,
    reload: load,
  };
}
