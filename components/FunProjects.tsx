import Image from "next/image";
import pengu from "@/public/images/pengu.png";

export function FunProjects() {
  return (
    <section className="playground section-pad" id="playground" aria-labelledby="playground-title">
      <div className="section-eyebrow mono" data-reveal><span><i /> 03 / THE PLAYGROUND</span><span>A LITTLE LESS SERIOUS. A LOT MORE JOY.</span></div>
      <div className="playground-heading">
        <h2 id="playground-title" data-play-reveal>Fun <em>Projects.</em></h2>
        <p data-play-reveal>Not everything needs to solve a serious problem. Some things are built just because they&apos;re fun.</p>
      </div>
      <article className="pengu-showcase" aria-labelledby="pengu-title">
        <div className="pengu-copy" data-reveal>
          <span className="mono pengu-kicker">SMALL PENGUIN / BIG PERSONALITY</span>
          <h3 id="pengu-title">Oh, hey.<br />I&apos;m <em>Pengu!</em></h3>
          <p>An interactive virtual penguin pet with playful animations, quirky behaviors, and a personality of its own.</p>
          <div className="pengu-actions">
            <a className="pengu-button pengu-primary" href="https://pengu-three-omega.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Meet Pengu (opens in new tab)">Meet Pengu <span aria-hidden="true">↗</span></a>
            <a className="pengu-button pengu-secondary" href="https://github.com/vedii-codezz/virtual-pet-pengu" target="_blank" rel="noopener noreferrer" aria-label="View Pengu source on GitHub (opens in new tab)">View Source <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="pengu-stage">
          <span className="pengu-halo" aria-hidden="true" />
          <span className="pengu-doodle doodle-pew" aria-hidden="true">pew pew!</span>
          <span className="pengu-doodle doodle-yay" aria-hidden="true">yayyy!</span>
          <span className="pengu-doodle doodle-sleep" aria-hidden="true">zzzz</span>
          <span className="pengu-spark spark-one" aria-hidden="true">✳</span>
          <span className="pengu-spark spark-two" aria-hidden="true">✧</span>
          <div className="pengu-character"><div className="pengu-float"><button type="button" className="pengu-reaction" aria-label="Say hello to Pengu"><Image src={pengu} alt="Pengu, a round blue voxel penguin with rosy cheeks and golden feet" sizes="(max-width: 600px) 85vw, 45vw" /></button></div></div>
          <span className="pengu-ground" aria-hidden="true" />
          <span className="pengu-stage-note mono">A TINY FRIEND. AN ENTIRE MOOD.</span>
        </div>
      </article>
      <div className="playground-end mono"><span>BUILT WITH CURIOSITY. KEPT FOR THE SMILES.</span><span aria-hidden="true">MORE PLAY, PLEASE ↗</span></div>
    </section>
  );
}
