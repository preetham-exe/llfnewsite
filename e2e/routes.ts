/** Every page in the site map, with the heading each one should show. */
export const routes = [
  {
    path: "/",
    name: "home",
    heading: "We build libraries for children in Hyderabad.",
  },
  { path: "/our-story", name: "our-story", heading: "Our Story" },
  { path: "/libraries", name: "libraries", heading: "The Libraries" },
  {
    path: "/libraries/qcity-community-library",
    name: "library-qcity",
    heading: "QCity Community Library",
  },
  { path: "/libraries/library-1", name: "library-1", heading: "Library #1" },
  { path: "/how-we-build", name: "how-we-build", heading: "How We Build" },
  { path: "/partners", name: "partners", heading: "Partners" },
  { path: "/stories", name: "stories", heading: "Stories" },
  {
    path: "/stories/first-story",
    name: "story-first",
    heading: "TODO: Title of the first story",
  },
  { path: "/get-involved", name: "get-involved", heading: "Get Involved" },
  { path: "/donate", name: "donate", heading: "Donate" },
] as const;

/**
 * Pages that are not in the site map (they are kept out of search) but are
 * still checked: where the contact form leads without JavaScript.
 */
export const unlistedRoutes = [
  {
    path: "/get-involved/sent",
    name: "get-involved-sent",
    heading: "Thank you",
  },
  {
    path: "/get-involved/unsent",
    name: "get-involved-unsent",
    heading: "Not sent",
  },
] as const;
