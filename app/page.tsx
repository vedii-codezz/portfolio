import { Hero } from "@/components/Hero";
import { MyStory } from "@/components/MyStory";
import { SelectedWork } from "@/components/SelectedWork";
import { MinorProjects } from "@/components/MinorProjects";
import { DeferredPortfolioMotion } from "@/components/DeferredPortfolioMotion";
import { FunProjects } from "@/components/FunProjects";
import { Brand } from "@/components/Brand";
import StaggeredMenu from "@/components/StaggeredMenu";
import { menuItems, socialItems } from "@/data/navigation";
import { LoaderLotus } from "@/components/LoaderLotus";
import { TechStack } from "@/components/TechStack";
import { ContactCTA } from "@/components/ContactCTA";
import { siteUrl } from "@/data/site";
import { publishedChapters } from "@/data/story";

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Bedantika Mondal",
  url: `${siteUrl}/`,
  sameAs: socialItems.filter(item => item.link.startsWith("https://")).map(item => item.link),
  jobTitle: "B.Tech Computer Science student",
  affiliation: { "@type": "CollegeOrUniversity", name: publishedChapters.find(chapter => chapter.kind === "education")?.title },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      <LoaderLotus />
      <div id="portfolio-content">
      <a className="skip-link" href="#main">Skip to content</a>
      <StaggeredMenu items={menuItems} socialItems={socialItems} />
      <main id="main" tabIndex={-1}>
        <Hero />
        <SelectedWork />
        <MinorProjects />
        <FunProjects />
        <MyStory />
        <TechStack />
        <ContactCTA />
      </main>
      <footer className="site-footer">
        <a className="wordmark" href="#home" aria-label="Bedantika Mondal, back to top"><Brand /></a>
        <p className="mono">BEDANTIKA MONDAL <span>© 2026</span></p>
        <a className="back-top" href="#home">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
      </div>
      <DeferredPortfolioMotion />
    </>
  );
}
