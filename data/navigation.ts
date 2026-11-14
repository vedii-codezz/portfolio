import { resume } from "./site";

export const menuItems = [
  { label: "Home", ariaLabel: "Go to home", link: "#home" },
  { label: "Selected Work", ariaLabel: "Explore selected projects", link: "#work" },
  { label: "Playground", ariaLabel: "Explore fun projects", link: "#playground" },
  { label: "My Story", ariaLabel: "Read my story", link: "#story" },
  { label: "Tech Stack", ariaLabel: "Explore my technologies", link: "#stack" },
  { label: "Contact", ariaLabel: "Get in touch", link: "#contact" },
  resume,
] as const;

export const socialItems = [
  { label: "GitHub", link: "https://github.com/vedii-codezz" },
  { label: "LinkedIn", link: "https://www.linkedin.com/in/bedantikamondal2007/" },
  { label: "Email", link: "mailto:bedantikamondal28@gmail.com" },
] as const;
