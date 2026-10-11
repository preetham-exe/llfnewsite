import { todo } from "./helpers";
import type { Partner } from "./types";

/* Partner organisations. Moves to Sanity in Phase 8. */
export const partners: Partner[] = [
  {
    _id: "robinhood-army",
    _type: "partner",
    slug: "robinhood-army",
    name: "Robinhood Army",
    about: todo("One line on who Robinhood Army are"),
    produced: "QCity Community Library, opened in April 2026.",
    website: todo("Robinhood Army website, if you want it linked"),
    libraries: [
      { slug: "qcity-community-library", name: "QCity Community Library" },
    ],
  },
  {
    _id: "mana-foundation",
    _type: "partner",
    slug: "mana-foundation",
    name: "MANA Foundation",
    about: todo("One line on who MANA Foundation are"),
    produced: todo("What the partnership with MANA Foundation produced"),
    website: null,
    libraries: [],
  },
  {
    _id: "chavadi-child-welfare-society",
    _type: "partner",
    slug: "chavadi-child-welfare-society",
    name: "Chavadi Child Welfare Society",
    about: todo("One line on who Chavadi Child Welfare Society are"),
    produced: todo(
      "What the partnership with Chavadi Child Welfare Society produced",
    ),
    website: null,
    libraries: [],
  },
  {
    _id: "aara-initiative",
    _type: "partner",
    slug: "aara-initiative",
    name: "AARA Initiative",
    about: todo("One line on who AARA Initiative are"),
    produced: todo("What the partnership with AARA Initiative produced"),
    website: null,
    libraries: [],
  },
  {
    _id: "macmillan-education",
    _type: "partner",
    slug: "macmillan-education",
    name: "Macmillan Education",
    about: todo("One line on how Macmillan Education works with us"),
    produced: todo(
      "What the partnership with Macmillan Education produced, and their OK to be named",
    ),
    website: null,
    libraries: [],
  },
];
