export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bedantikamondal-portfolio.vercel.app").origin;

export const resume = {
  label: "Resume",
  ariaLabel: "Resume (PDF, opens in a new tab)",
  link: "/Bedantika-Mondal-Resume.pdf",
  newTab: true,
} as const;
