import { techStack } from "@/data/tech-stack";
import FlipCard from "./FlipCard";
import { TechStackAlpona } from "./TechStackAlpona";
import "./tech-stack.css";

export function TechStack() {
  return (
    <section className="toolkit section-pad" id="stack" aria-labelledby="stack-title">
      <div className="section-eyebrow mono" data-reveal>
        <span><i aria-hidden="true" />05 / MY TOOLKIT</span>
        <span>FROM CURIOSITY TO CREATION</span>
      </div>
      <div className="toolkit-heading" data-reveal>
        <h2 id="stack-title">Tools of<br /><em>the Trade.</em></h2>
        <p>Languages, technologies, and tools I use to turn ideas into intelligent systems and creative digital experiences.</p>
      </div>
      <div className="toolkit-grid toolkit-flip-grid">
        {techStack.map(category => (
          <article className="toolkit-flip-category" key={category.number} data-stack-category aria-label={category.title}>
            <FlipCard label={category.title} axis="y" flipOnClick draggable dragDistance={0}
              tilt tiltMax={8} glare glareOpacity={0.12} hoverScale={1.03} perspective={1100}
              stiffness={170} damping={20} height={380} radius={22} shadow
              front={<div className="toolkit-flip-content">
                <TechStackAlpona variant={category.number} />
                <div className="toolkit-flip-meta mono"><span>{category.number} / 04</span><span className="toolkit-flip-mark" aria-hidden="true">✳</span></div>
                <h3 className="toolkit-flip-title">{category.title}</h3>
                <p className="toolkit-flip-cue mono"><span className="toolkit-flip-cue-label">CLICK TO EXPLORE <span aria-hidden="true">↗</span></span></p>
              </div>}
              back={<div className="toolkit-flip-content toolkit-flip-back">
                <TechStackAlpona variant={category.number} back />
                <div className="toolkit-flip-meta mono"><span>{category.number} / 04</span><span>THE TOOLS</span></div>
                <h3>{category.title}</h3>
                <ul className="toolkit-flip-technologies" aria-label={category.title}>
                  {category.technologies.map(technology => <li key={technology}><span>{technology}</span></li>)}
                </ul>
                <p className="toolkit-flip-cue mono"><span className="toolkit-flip-cue-label">CLICK TO FLIP BACK <span aria-hidden="true">↶</span></span></p>
              </div>} />
          </article>
        ))}
      </div>
    </section>
  );
}
