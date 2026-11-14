import { publishedChapters } from "@/data/story";
import { LotusJourney } from "./LotusJourney";
import { StoryChapters } from "./StoryChapters";

export function MyStory() {
  return (
    <section className="story section-pad" id="story" aria-labelledby="story-title">
      <div className="section-eyebrow mono" data-reveal><span><i /> 01 / MY STORY</span><span>ALWAYS A WORK IN PROGRESS</span></div>
      <StoryChapters chapters={publishedChapters} illustration={<LotusJourney />}>
        <div className="story-heading" data-reveal><h2 id="story-title">My Story<span className="gold">.</span></h2><p>The Journey<br /><em>So Far.</em></p></div>
      </StoryChapters>
    </section>
  );
}
