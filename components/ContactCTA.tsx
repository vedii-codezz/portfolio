import { resume } from "@/data/site";
import { Lotus } from "./Brand";

export function ContactCTA() {
  return (
    <section className="contact-cta section-pad" id="contact" aria-labelledby="contact-title">
      <div className="section-eyebrow mono" data-contact-reveal>
        <span><i aria-hidden="true" />06 / THE NEXT CHAPTER</span>
        <Lotus />
      </div>
      <div className="contact-composition">
        <h2 id="contact-title">
          <span className="contact-line"><span data-contact-reveal>Have an idea?</span></span>
          <span className="contact-line"><em data-contact-reveal>Let&apos;s bring it to life.</em></span>
        </h2>
        <p className="contact-description" data-contact-reveal>From intelligent systems to creative digital experiences, I&apos;m always excited about meaningful ideas and new opportunities.</p>
        <div data-contact-reveal>
          <a className="contact-email" href="mailto:bedantikamondal28@gmail.com">Let&apos;s Talk <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="contact-socials">
        <a data-contact-reveal href="https://github.com/vedii-codezz" target="_blank" rel="noopener noreferrer">
          <span className="mono contact-platform">GitHub<span className="sr-only"> (opens in a new tab)</span></span>
          <span className="contact-social-action">Explore My Code <span aria-hidden="true">↗</span></span>
        </a>
        <a data-contact-reveal href="https://www.linkedin.com/in/bedantikamondal2007/" target="_blank" rel="noopener noreferrer">
          <span className="mono contact-platform">LinkedIn<span className="sr-only"> (opens in a new tab)</span></span>
          <span className="contact-social-action">Connect With Me <span aria-hidden="true">↗</span></span>
        </a>
        <a data-contact-reveal href={resume.link} aria-label={resume.ariaLabel} target="_blank" rel="noopener noreferrer">
          <span className="mono contact-platform">PDF</span>
          <span className="contact-social-action">{resume.label} <span aria-hidden="true">↗</span></span>
        </a>
      </div>
    </section>
  );
}
