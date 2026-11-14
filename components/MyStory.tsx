import { publishedChapters } from "@/data/story";
import { StoryChapters } from "./StoryChapters";
import "./story.css";

export function MyStory() {
  return (
    <section className="story section-pad" id="story" aria-labelledby="story-title">
      <div className="section-eyebrow mono"><span><i /> 01 / MY STORY</span><span>ALWAYS A WORK IN PROGRESS</span></div>
      <div className="story-heading"><h2 id="story-title">My Story<span className="gold">.</span></h2><p>The Journey<br /><em>So Far.</em></p></div>
      <StoryChapters chapters={publishedChapters} />
    </section>
  );
}
