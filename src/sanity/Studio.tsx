"use client";

import { NextStudio } from "next-sanity/studio";

import config from "./config";

/** Sanity Studio, loaded in the browser (its config holds functions). */
export function Studio() {
  return <NextStudio config={config} />;
}
