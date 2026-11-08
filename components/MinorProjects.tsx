import { minorProjects, type MinorProject } from "@/data/minor-projects";
import styles from "./minor-projects.module.css";

function ProjectStudy({ kind }: { kind: MinorProject["slug"] }) {
  return <svg className={styles.study} viewBox="0 0 520 260" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" strokeWidth="1" opacity=".3">
      <path d="M32 224H488M40 32v12m-6-6h12M480 206v12m-6-6h12" />
      <path d="M240 238q20-30 20 0q0-30 20 0M248 240q12-18 12 0q0-18 12 0" />
    </g>
    {kind === "chroma-lab" ? <>
      <g stroke="currentColor" strokeWidth="1" fill="none" opacity=".45">
        <circle cx="352" cy="102" r="60" /><circle cx="322" cy="102" r="38" /><circle cx="370" cy="128" r="38" />
        <path d="M352 42v120m-60-60h120" strokeDasharray="2 6" />
      </g>
      <rect x="110" y="49" width="91" height="135" rx="3" fill="#762937" transform="rotate(-17 155 116)" />
      <rect x="159" y="57" width="91" height="135" rx="3" fill="#E5938F" transform="rotate(4 204 124)" />
      <rect x="203" y="81" width="91" height="135" rx="3" fill="#FFD2BE" stroke="#762937" strokeOpacity=".25" transform="rotate(19 248 148)" />
      <g transform="translate(318 181)">
        {["#762937", "#B65D67", "#E5938F", "#FFD2BE", "#FFF1E9"].map((color, index) => <rect key={color} x={index * 24} width="24" height="18" fill={color} stroke="currentColor" strokeOpacity=".15" />)}
      </g>
    </> : <>
      <g fill="currentColor">
        {[78, 124, 96, 153, 183].map((height, index) => <rect key={height} x={82 + index * 40} y={218 - height} width="25" height={height} rx="2" opacity={.18 + index * .12} />)}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M308 68h74v54h-40v63h99" strokeDasharray="4 6" opacity=".5" />
        <path d="m431 179 10 6-10 6M311 68l-9-6m9 6-9 6" />
        <circle cx="308" cy="68" r="7" fill="var(--surface)" />
        <circle cx="382" cy="122" r="7" fill="var(--surface)" />
        <circle cx="342" cy="185" r="7" fill="var(--accent-secondary)" />
        <path d="M80 31h36m-36 8h21M409 211h35m-21-8h21" opacity=".35" />
      </g>
    </>}
  </svg>;
}

export function MinorProjects() {
  return <section id="minor-projects" className={`section-pad ${styles.section}`} aria-labelledby="minor-projects-title">
    <header className={styles.heading} data-reveal>
      <div><p className={styles.eyebrow}>A LITTLE FURTHER INTO THE LAB</p><h2 id="minor-projects-title">Minor Project <em>Works</em></h2></div>
      <p className={styles.intro}>Small explorations.<br />Room for a little curiosity.</p>
    </header>
    <div className={styles.grid}>
      {minorProjects.map((project, index) => <article key={project.slug} className={styles.project} aria-labelledby={`${project.slug}-title`} data-reveal>
        <div className={styles.topline}><span>0{index + 1} /</span><span>{project.note}</span></div>
        <ProjectStudy kind={project.slug} />
        <h3 id={`${project.slug}-title`}>{project.name}</h3>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.links}>
          <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.name}: Live Demo (opens in a new tab)`}>Live Demo <span aria-hidden="true">↗</span></a>
          <a href={project.source} target="_blank" rel="noopener noreferrer" aria-label={`${project.name}: GitHub Source (opens in a new tab)`}>Source <span aria-hidden="true">↗</span></a>
        </div>
      </article>)}
    </div>
  </section>;
}
