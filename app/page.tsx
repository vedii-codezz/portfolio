import { Hero } from "@/components/Hero";
import { MyStory } from "@/components/MyStory";
import { SelectedWork } from "@/components/SelectedWork";
import { MinorProjects } from "@/components/MinorProjects";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import { FunProjects } from "@/components/FunProjects";
import { Brand } from "@/components/Brand";
import StaggeredMenu from "@/components/StaggeredMenu";
import { menuItems, socialItems } from "@/data/navigation";
import { LoaderLotus } from "@/components/LoaderLotus";
import { TechStack } from "@/components/TechStack";
import { ContactCTA } from "@/components/ContactCTA";

export default function Home() {
  return (
    <>
      <LoaderLotus />
      <div id="portfolio-content">
      <a className="skip-link" href="#main">Skip to content</a>
      <StaggeredMenu items={menuItems} socialItems={socialItems} />
      <main id="main">
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
      <PortfolioMotion />
    </>
  );
}
