"use client";

import type { ReactNode } from "react";

import { TransitionProvider } from "@/components/transition/TransitionProvider";

import { SmoothScroll } from "./SmoothScroll";

/** Client-side providers that persist across every navigation. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <TransitionProvider>{children}</TransitionProvider>
    </SmoothScroll>
  );
}
