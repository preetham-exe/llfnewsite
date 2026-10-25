import { todo } from "./helpers";
import type { Photo, Todo } from "./types";

/*
 * Copy for the fixed pages. Libraries, stories, partners and gallery moments
 * have their own files. Everything here is either a confirmed fact or a TODO.
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
  lede: "[[Each library is a chapter]]. Here is where each one is, who we built it with, and when it opened.",
  sections: [],
};

/** The three sizes of library, smallest first. */
const librarySizes = [
  { size: "Small", books: "150 to 200 books", shelves: "1 to 2 shelves" },
  { size: "Medium", books: "300 to 400 books", shelves: "3 to 4 shelves" },
  { size: "Large", books: "600 or more books", shelves: "5 or more shelves" },
] as const;

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
      terms: librarySizes.map(({ size, books, shelves }) => ({
        term: size,
        detail: `${books} on ${shelves}`,
      })),
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
        "A library for 50 to 60 children costs [[about ₹20,000 to ₹40,000]], shelves included.",
      ],
    },
  ],
};

/**
 * How We Build's margins: a pencil sketch of a medium library's shelves,
 * and a card of what every library gets (from the facts above).
 */
export const howWeBuildMargins = {
  sketch: librarySizes[1],
  checklist: {
    heading: "Every library",
    items: [
      "Shelves, paid for by us",
      "Storybooks in two languages",
      "A read-aloud on launch day",
    ],
  },
} as const;

export const partnersIndex: PageCopy = {
  description:
    "The organisations Literate Lives Foundation builds libraries with, and what each partnership has produced.",
  title: "Partners",
  lede: "We build every library [[with someone]]. These are the organisations we work with, and what we have made together.",
  sections: [],
};

export const storiesIndex: PageCopy = {
  description:
    "Writing from the Literate Lives Foundation team and from children at our libraries.",
  title: "Stories",
  lede: "Writing from our team, and from [[the children]] who use our libraries.",
  sections: [],
};

/** Stories' margins: a child's drawing will go here, with permission. */
export const storiesMargins = {
  drawing: todo(
    "A child's drawing from one of our libraries, shared with permission. A photo of it is enough.",
  ),
} as const;

/** The Gallery: the libraries' photos and gallery moments, as plates. */
export const gallery = {
  description:
    "Photographs from the libraries Literate Lives Foundation has built, and the days we spent there.",
  title: "Gallery",
  lede: "Photographs from [[our libraries]], and the days we spent there.",
  listHeading: "List of plates",
  plate: "Plate",
  /** Before the photo's description, for the link that shows it large. */
  view: "View larger:",
  of: "of",
  previous: "Previous plate",
  next: "Next plate",
  close: "Close",
  empty: "Photographs will appear here as we add them.",
} as const;

export const getInvolved: PageCopy = {
  description:
    "Volunteer with Literate Lives Foundation, start a chapter in your city, or ask for a library for your institution.",
  title: "Get Involved",
  lede: "There are three ways to help build the next library.",
  sections: [
    {
      heading: "Volunteer",
      paragraphs: [
        "Our volunteers lead [[the read-aloud]] on every launch day.",
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

/** Get Involved's margins: a sign-up sheet waiting for names. */
export const getInvolvedMargins = {
  sheet: {
    heading: "Read-aloud volunteers",
    columns: ["Name", "Launch day"],
  },
} as const;

/**
 * The contact form on Get Involved. Messages are emailed to the founder
 * (see src/lib/contact.ts); without the email service it says so and
 * offers the address instead.
 */
export const contactForm = {
  heading: "Write to us",
  intro:
    "Tell us how you would like to help. Your message goes straight to our founder.",
  orEmail: "You can also email us at",
  topic: {
    legend: "What is this about?",
    options: [
      { value: "volunteer", label: "Volunteering" },
      { value: "chapter", label: "Starting a chapter in my city" },
      { value: "library", label: "Asking for a library" },
      { value: "other", label: "Something else" },
    ],
  },
  fields: {
    name: "Your name",
    email: "Email",
    phone: "Phone",
    city: "City",
    message: "Message",
  },
  optional: "optional",
  messageHint:
    "Asking for a library? Tell us about the children, the space, and who would look after it.",
  send: "Send message",
  sending: "Sending",
  errors: {
    topic: "Choose what your message is about.",
    name: "Tell us your name.",
    email: "Enter an email address we can reply to, such as name@example.com.",
    message: "Write a message.",
    tooLong: "This is longer than the form can take. Please shorten it.",
  },
  sent: {
    title: "Thank you",
    body: "Thank you for writing. Your message is on its way to our founder.",
    back: "Back to Get Involved",
  },
  unsent: {
    title: "Not sent",
    body: "Your message could not be sent just now. Please email it to us instead:",
    kept: "What you wrote is still in the form, so you can copy it.",
    back: "Back to the form",
  },
} as const;

export const donate = {
  description:
    "Help Literate Lives Foundation build its next library. Donations are made on Milaap. We are registered under sections 12A and 80G.",
  title: "Donate",
  lede: "A library for 50 to 60 children costs [[about ₹20,000 to ₹40,000]], shelves included. Your gift helps build the next one.",
  /**
   * The library checkout card: the card from a library book's pocket, with
   * gifts on its ruled lines instead of borrowers.
   */
  checkout: {
    labels: { author: "Author", title: "Title" },
    author: "Literate Lives Foundation",
    work: "The next library",
    /** The gifts' column head, and the amounts'. */
    legend: "Choose a gift",
    amountHead: "Amount",
    options: [
      {
        id: "book",
        gift: "One book",
        amount: todo(
          "What one book costs (the old site said ₹500 buys 5 storybooks)",
        ),
      },
      {
        id: "shelf",
        gift: "A shelf of books",
        // What a shelf of books costs varies too much to give one amount.
        amount: null,
      },
      {
        id: "library",
        gift: "A whole library for 50 to 60 children",
        amount: "about ₹20,000 to ₹40,000",
      },
    ],
    action: "Check out",
    note: "You choose the amount and pay on Milaap, our fundraising platform. Nothing is paid on this site.",
    stamp: "Thank you",
    /** Said to screen readers as the stamp comes down. */
    leaving: "Thank you. Taking you to Milaap to finish your gift.",
  },
  sections: [
    {
      heading: "How giving works",
      paragraphs: [
        "Donations are made on Milaap, a fundraising platform. You choose the amount and finish your gift there, and nothing is paid on this site.",
      ],
    },
    {
      heading: "Where the money goes",
      paragraphs: [
        "A library for 50 to 60 children costs about ₹20,000 to ₹40,000, with its shelves and its books.",
        todo(
          "How a library's cost divides between books and shelves, and anything else it pays for",
        ),
      ],
      terms: [
        {
          term: "Shelves",
          detail:
            "We find the shelving and pay for it, so the institution does not have to.",
        },
        {
          term: "Books",
          detail:
            "Mostly fiction and storybooks, in English and in the local language.",
        },
      ],
    },
    {
      heading: "Tax benefit",
      paragraphs: [
        "We are registered under sections 12A and 80G of the Income Tax Act. If you pay tax in India, your gift may qualify for a deduction under section 80G.",
        todo("Who issues the 80G receipt for Milaap donations, and how"),
      ],
    },
  ] satisfies Section[],
  registration: {
    heading: "Registration",
    terms: {
      trust: "Trust",
      section12A: "12A",
      section80G: "80G",
      darpan: "NGO DARPAN",
      pan: "PAN",
    },
  },
  larger: {
    heading: "Larger gifts",
    text: "For a larger gift, or a gift from a company, write to us at",
  },
} as const;

export const notFound = {
  title: "This book has been misplaced.",
  body: "The page you were looking for is not on the shelf. It may have moved, or the link may be wrong.",
  back: "Back to the shelf",
} as const;
