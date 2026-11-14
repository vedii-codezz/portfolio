import type { Project } from "@/data/projects";
import styles from "./project-artwork.module.css";

const studyNames = { finora: "finora-study", veyra: "veyra-study", aptly: "aptly-study", "nikot-e-metro": "metro-study", luma: "luma-study" };

function StudyNote() {
  return <div className={styles.studyNote}><span>Original visual study</span><span>Not a product screenshot</span></div>;
}

function FinoraArtwork() {
  return <>
    <StudyNote />
    <div className={styles.orbit}>
      <svg className={styles.orbitLines} viewBox="0 0 400 320" fill="none">
        <path className={styles.orbitConnectors} d="M52 36L200 160L348 36M52 284L200 160L348 284" />
        <circle className={styles.outerOrbit} cx="200" cy="160" r="135" />
        <circle className={styles.innerOrbit} cx="200" cy="160" r="100" />
        <circle className={styles.goldOrbit} cx="200" cy="160" r="74" strokeDasharray="2 10" />
        {[[200,25],[335,160],[200,295],[65,160]].map(([cx,cy]) => <circle className={styles.orbitNode} key={cx + ':' + cy} cx={cx} cy={cy} r="3" />)}
      </svg>
      <span className={`${styles.agent} ${styles.agentBudget}`}>Budget</span>
      <span className={`${styles.agent} ${styles.agentInvestment}`}>Investment</span>
      <div className={styles.core}><span>f<span className={styles.coreDot}>.</span></span><small>FINORA</small></div>
      <span className={`${styles.agent} ${styles.agentAffordability}`}>Affordability</span>
      <span className={`${styles.agent} ${styles.agentFraud}`}>Fraud analysis</span>
    </div>
    <p className={styles.footnote}>Specialized reasoning. Shared context.</p>
  </>;
}

function VeyraArtwork() {
  return <>
    <StudyNote />
    <div className={styles.flowComposition}>
      <div className={styles.flowHeading}><span className={styles.wordmark}>VEYRA<sup>®</sup></span><div className={styles.flowWords}><span>Observe.</span><span>Understand.</span><span>Rebalance.</span></div></div>
      <svg className={styles.ribbons} viewBox="0 0 600 300" fill="none">
        <path className={styles.ribbonFill} d="M10 230C140 265 160 30 310 55S435 263 590 80L590 142C435 325 420 132 310 117S140 327 10 292Z" />
        <g className={styles.ribbonBack}>{Array.from({ length: 7 }, (_, i) => <path key={i} d={`M10 ${60+i*9}C155 ${-25+i*9} 190 ${290+i*4} 330 ${230+i*5}S490 ${20+i*7} 590 ${60+i*8}`} />)}</g>
        <g className={styles.ribbonFront}>{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M10 ${218+i*7}C140 ${253+i*7} 160 ${18+i*7} 310 ${43+i*7}S435 ${251+i*7} 590 ${68+i*7}`} />)}</g>
      </svg>
    </div>
    <p className={styles.footnote}>The shape of financial clarity</p>
  </>;
}

function AptlyArtwork() {
  return <>
    <StudyNote />
    <div className={styles.documentComposition}>
      <span className={styles.documentBrand}>APTLY<span>/</span></span>
      <div className={styles.paperStack}>
        <div className={styles.evidence}>
          <div className={styles.sheetHeading}><span>Requirement</span><span>Evidence state</span></div>
          <div className={styles.evidenceRow}><span>Skill match</span><b className={styles.matched}>MATCHED <span>↗</span></b></div>
          <div className={styles.evidenceRow}><span>Experience</span><b className={styles.partial}>PARTIAL <span>↗</span></b></div>
          <div className={styles.evidenceRow}><span>Tools</span><b className={styles.unknown}>UNKNOWN <span>↗</span></b></div>
          <p className={styles.evidenceTrail}>Source → Rule → Evidence → Decision</p>
        </div>
      </div>
    </div>
    <p className={styles.footnote}>Illustrative states / Not a candidate assessment</p>
  </>;
}

function MetroArtwork() {
  return <>
    <StudyNote />
    <div className={styles.transitComposition}>
      <div className={styles.metroIdentity}><span lang="bn">নিকটে মেট্রো</span><small>NIKOT-E-METRO</small></div>
      <svg className={styles.network} viewBox="0 0 520 260" fill="none">
        <path className={styles.routeSage} d="M24 210H120L280 50H496" />
        <path className={styles.routeGold} d="M24 70H150L290 210H496" />
        <path className={styles.routeBlue} d="M340 20V100L220 220V240" />
        {[[68,210],[120,210],[280,50],[398,50],[68,70],[150,70],[290,210],[404,210],[220,240]].map(([cx,cy]) => <circle className={styles.station} key={cx + ':' + cy} cx={cx} cy={cy} r="5" />)}
        {[[205,125],[260,180],[340,50]].map(([cx,cy]) => <g className={styles.interchange} key={cx}><circle cx={cx} cy={cy} r="10" /><circle cx={cx} cy={cy} r="4" /></g>)}
      </svg>
    </div>
    <p className={styles.footnote}>Conceptual network / Not a live route map</p>
  </>;
}

function LumaArtwork() {
  return <>
    <StudyNote />
    <div className={styles.lumaComposition}>
      <div className={styles.lumaMasthead}><span className={styles.lumaWordmark}>LUMA<span>·</span></span><small>A CLEARER SPACE TO LEARN</small></div>
      <div className={styles.lumaWorkspace}>
        <div className={styles.lumaSidebar}><small>SUBJECTS</small><span><i /> Computer Sci.</span><span>Mathematics</span><span>Physics</span></div>
        <div className={styles.lumaCanvas}>
          <div className={styles.lumaCanvasLabel}><span>Your library</span><span aria-hidden="true">↗</span></div>
          <svg className={styles.lumaDocuments} viewBox="0 0 160 80" fill="none">
            <rect x="45" y="5" width="75" height="62" rx="3" fill="#304638" stroke="#687f6e" />
            <path d="M34 13H95L109 27V74H34Z" fill="#edeade" stroke="#a8b7a0" />
            <path d="M95 13V27H109" fill="#c4d0bc" stroke="#a8b7a0" />
            <path d="M45 36H92M45 43H83M45 50H92M45 57H76" stroke="#78927d" strokeWidth="2" strokeLinecap="round" />
            <path d="M124 23H139M124 30H135M124 52H139M124 59H135" stroke="#768d7d" strokeLinecap="round" />
            <circle cx="130" cy="42" r="3" fill="#a5baa0" />
          </svg>
        </div>
      </div>
    </div>
    <p className={styles.footnote}>Conceptual workspace / Sample materials</p>
  </>;
}

export function ProjectVisual({ slug }: { slug: Project["slug"] }) {
  return <div className={`project-visual visual-${slug} ${styles.frame}`} aria-hidden="true">
    <div className={styles.texture} />
    <div className={`${styles.study} ${studyNames[slug]}`}>
      {slug === "finora" && <FinoraArtwork />}
      {slug === "veyra" && <VeyraArtwork />}
      {slug === "aptly" && <AptlyArtwork />}
      {slug === "nikot-e-metro" && <MetroArtwork />}
      {slug === "luma" && <LumaArtwork />}
    </div>
  </div>;
}
