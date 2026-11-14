// Hand-drawn Bézier paths, ordered from the heart of the bloom outwards.
const petals = [
  "M140 310C96 273 91 229 140 176C189 229 184 273 140 310Z",
  "M140 310C112 273 110 244 140 207C170 244 168 273 140 310Z",
  "M140 310C123 291 125 273 140 253C155 273 157 291 140 310Z",
  "M140 310C95 299 57 276 49 230C91 231 115 248 140 310Z",
  "M140 310C185 299 223 276 231 230C189 231 165 248 140 310Z",
  "M140 310C99 278 57 270 20 286C57 321 95 329 140 310Z",
  "M140 310C181 278 223 270 260 286C223 321 185 329 140 310Z",
  "M140 310C109 304 84 315 68 337C103 326 112 351 140 310Z",
  "M140 310C171 304 196 315 212 337C177 326 168 351 140 310Z",
];
const leaves = [
  "M106 163C97 141 111 131 121 121C120 142 113 148 106 163Z",
  "M141 401C104 368 81 381 57 393C89 388 105 420 141 401Z",
  "M165 449C165 424 181 419 193 410C188 435 176 435 165 449Z",
  "M148 510C166 478 202 478 220 485C193 493 182 520 148 510Z",
  "M125 542C107 519 117 503 128 491C133 514 120 523 125 542Z",
  "M112 626C116 594 136 589 151 582C144 605 130 622 112 626Z",
];
export const vinePath = "M140 310C146 336 98 350 125 387C162 431 191 449 160 495C135 534 91 558 109 605C120 635 159 663 140 714";


export function JourneyLeaf({ index }: { index: number }) {
  const anchors = [[106, 163], [141, 401], [165, 449], [148, 510], [125, 542], [112, 626]];
  const shape = index % leaves.length;
  const [x, y] = anchors[shape];
  return (
    <svg className="journey-leaf" viewBox={`${x - 95} ${y - 95} 190 190`} aria-hidden="true" focusable="false">
      <path data-story-leaf d={leaves[shape]} />
    </svg>
  );
}

export function LotusJourney() {
  return (
    <svg className="journey-bloom" viewBox="0 165 280 180" aria-hidden="true" focusable="false">
      {petals.map(d => <path key={d} data-story-petal pathLength={1} d={d} />)}
    </svg>
  );
}