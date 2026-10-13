import { todo } from "./helpers";
import type { Photo, Todo } from "./types";

/*
 * Copy for the fixed pages. Libraries, stories and partners have their own
 * files. Everything here is either a confirmed fact or a TODO.
 */

export type Section = {
  heading: string;
  paragraphs?: (string | Todo)[];
  /** A short definition list, such as library sizes. */
  terms?: { term: string; detail: string }[];
  /** Numbered steps, such as how a library gets built. */
  steps?: { title: string; detail: string }[];
};

export type PageCopy = {
  /** The <title>. Falls back to `title`. */
  metaTitle?: string;
  description: string;
  title: string;
  lede: string | Todo;
  sections: Section[];
};

export const home = {
  metaTitle: "Literate Lives Foundation | Libraries for children in Hyderabad",
  headline: "We build libraries for children in Hyderabad.",
  shelfLabel: "Sections of the site",
  mission:
    "Every library comes with shelves we pay for, storybooks in English and Telugu, and a read-aloud led by one of our volunteers on the day it opens.",
  next: "Bangalore is next, with a local chapter lead.",
  photo: {
    _type: "photo",
    src: "/photos/children-at-new-shelves.jpg",
    width: 2400,
    height: 1800,
    alt: "Children crowd around new bookshelves to choose books, while a girl beside them smiles.",
  } satisfies Photo,
  donateLine:
    "A library for 50 to 60 children costs about ₹20,000 to ₹40,000, shelves included.",
  donateCta: "Help build the next one",
} as const;

export const ourStory: PageCopy = {
  description:
    "Literate Lives Foundation was started in Hyderabad in 2024 by a student. The first library opened in January 2025.",
  title: "Our Story",
  lede: "Literate Lives Foundation was started in Hyderabad in 2024 by [[a student]]. Our first library opened in January 2025.",
  sections: [
    {
      heading: "What we do",
      paragraphs: [
        "We build libraries in children's homes and community spaces. We pay for the shelves, choose the books, and open every library with a read-aloud led by one of our volunteers.",
      ],
    },
    {
      heading: "Where we are",
      paragraphs: [
        "We registered as a trust in March 2025 and have built [[three libraries]] so far. We are now starting a chapter in Bangalore, with a local chapter lead.",
      ],
    },
    {
      heading: "How it started",
      paragraphs: [todo("The founder's story, in their own words")],
    },
    {
      heading: "The team",
      paragraphs: [todo("Names, roles and photos of the team")],
    },
  ],
};

/**
 * Our Story's margins. The photo is a real library's shelves (from the
 * founder's photos, May 2025); which library it is still has to be confirmed.
 */
export const ourStoryMargins = {
  photo: {
    _type: "photo",
    src: "/photos/shelves-of-storybooks.jpg",
    width: 2400,
    height: 2400,
    alt: "Three wooden bookshelves, full of children's books.",
  } satisfies Photo,
  caption: todo("Caption for this photo: which library it is, and when"),
  note: todo(
    "A short handwritten note from the team, in English or Telugu. A photo of it is enough.",
  ),
} as const;

export const librariesIndex: PageCopy = {
  description:
    "Every library Literate Lives Foundation has built: where it is, who we built it with, and when it opened.",
  title: "The Libraries",
  lede: "Each library is a chapter. Here is where each one is, who we built it with, and when it opened.",
  sections: [],
};

export const howWeBuild: PageCopy = {
  description:
    "How a Literate Lives library goes from a first conversation to launch day: who can ask for one, the three sizes, the books, and what it costs.",
  title: "How We Build",
  lede: "Every library follows the same steps, from a first conversation to the read-aloud on launch day.",
  sections: [
    {
      heading: "Who can ask for a library",
      paragraphs: [
        "Any institution that serves children can ask, such as a children's home, a school or a community space. There is one condition: a local volunteer or mentor has to be there to look after the library.",
      ],
    },
    {
      heading: "From conversation to launch day",
      steps: [
        {
          title: "A conversation",
          detail: "We learn about the children and the space.",
        },
        {
          title: "A site visit and a written agreement",
          detail: "We see the space and agree in writing what we will build.",
        },
        {
          title: "The build",
          detail: "We put up the shelves and fill them with books.",
        },
        {
          title: "Launch day",
          detail:
            "One of our volunteers leads a read-aloud on the day the library opens.",
        },
      ],
    },
    {
      heading: "Three sizes",
      terms: [
        { term: "Small", detail: "150 to 200 books on 1 to 2 shelves" },
        { term: "Medium", detail: "300 to 400 books on 3 to 4 shelves" },
        { term: "Large", detail: "600 or more books on 5 or more shelves" },
      ],
    },
    {
      heading: "The books",
      paragraphs: [
        "Mostly fiction and storybooks, in English and in the local language: Telugu in Hyderabad, Kannada in Bangalore.",
      ],
    },
    {
      heading: "The shelves",
      paragraphs: [
        "We find the shelving and pay for it ourselves, so the institution does not have to.",
      ],
    },
    {
      heading: "What a library costs",
      paragraphs: [
        "A library for 50 to 60 children costs about ₹20,000 to ₹40,000, shelves included.",
      ],
    },
  ],
};

export const partnersIndex: PageCopy = {
  description:
    "The organisations Literate Lives Foundation builds libraries with, and what each partnership has produced.",
  title: "Partners",
  lede: "We build every library with someone. These are the organisations we work with, and what we have made together.",
  sections: [],
};

export const storiesIndex: PageCopy = {
  description:
    "Writing from the Literate Lives Foundation team and from children at our libraries.",
  title: "Stories",
  lede: "Writing from our team, and from the children who use our libraries.",
  sections: [],
};

export const getInvolved: PageCopy = {
  description:
    "Volunteer with Literate Lives Foundation, start a chapter in your city, or ask for a library for your institution.",
  title: "Get Involved",
  lede: "There are three ways to help build the next library.",
  sections: [
    {
      heading: "Volunteer",
      paragraphs: [
        "Our volunteers lead the read-aloud on every launch day.",
        todo("Other volunteer roles, and how often volunteers are needed"),
      ],
    },
    {
      heading: "Start a chapter",
      paragraphs: [
        "We are starting in Bangalore with a local chapter lead. If you want to bring Literate Lives to your city, write to us.",
      ],
    },
    {
      heading: "Ask for a library",
      paragraphs: [
        "Any institution that serves children can ask. You will need a local volunteer or mentor who can look after the library. We start with a conversation.",
      ],
    },
  ],
};

export const donate: PageCopy = {
  description:
    "Help Literate Lives Foundation build its next library. Donations are made on Milaap. We are registered under sections 12A and 80G.",
  title: "Donate",
  lede: "A library for 50 to 60 children costs about ₹20,000 to ₹40,000, shelves included. Your gift helps build the next one.",
  sections: [
    {
      heading: "How giving works",
      paragraphs: [
        "Donations are made on Milaap, a fundraising platform. You will finish your gift there, and nothing is paid on this site.",
      ],
    },
    {
      heading: "Tax benefit",
      paragraphs: [
        "We are registered under sections 12A and 80G of the Income Tax Act.",
        todo("Who issues the 80G receipt for Milaap donations, and how"),
      ],
    },
    {
      heading: "Larger gifts",
      paragraphs: [
        "For a larger gift, or a gift from a company, write to founder@literatelives.org.",
      ],
    },
  ],
};

export const notFound = {
  title: "This book has been misplaced.",
  body: "The page you were looking for is not on the shelf. It may have moved, or the link may be wrong.",
  back: "Back to the shelf",
} as const;
