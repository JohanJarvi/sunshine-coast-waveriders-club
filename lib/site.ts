/**
 * Everything brand-related lives here, so renaming the club is a one-file change.
 */
export const site = {
  name: "Sunshine Coast Waveriders Club",
  shortName: "Waveriders",
  // Hero headline, split so the middle word can be highlighted.
  heroName: { before: "Sunshine Coast", highlight: "Waveriders", after: "Club" },
  tagline: "If it rides a wave, it's in.",
  description:
    "A free, judge-free surf gathering on the Sunshine Coast. Turn up, put your name down and ride anything: a longboard, a shortboard, an old door or just your body.",
  when: "First Saturday of every month",
  where:
    "Rotating dog-friendly Sunshine Coast beaches. Location shared before each event.",
  contact: {
    name: "Johan",
    phone: "0439 655 125",
    instagram: "thanksnjord",
  },
} as const;
