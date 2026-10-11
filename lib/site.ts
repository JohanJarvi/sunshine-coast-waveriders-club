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
    "A free, judge-free surf gathering on the Sunshine Coast. Turn up, put your name down and ride anything: a longboard, a shortboard, a bodyboard or just your body.",
  eyebrow: "Free · Any craft · No judges",
  when: "Announced here before each event",
  where: "A dog-friendly Sunshine Coast beach, announced here before each event",
  /**
   * The next session. Set to null when nothing is booked and the site will
   * say "to be announced". Example:
   *   nextEvent: { date: "Saturday 7 November", time: "6:30am", location: "Point Cartwright" },
   */
  nextEvent: null as null | { date: string; time: string; location: string },
  contact: {
    name: "Johan",
    phone: "0439 655 125",
    instagram: "thanksnjord",
  },
} as const;
