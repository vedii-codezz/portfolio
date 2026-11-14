// Original lotus outlines, with the petal roots at (140, 310).
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
const tendrils = [
  "M0 0C14 -3 13 -27 33 -30C49 -32 55 -13 44 -9C35 -6 32 -16 38 -19C42 -21 45 -17 42 -15",
  "M0 0C13 8 32 24 47 14C57 7 52 -7 43 -6C35 -5 35 5 41 5C45 5 46 0 43 0",
  "M0 0C11 -8 24 -3 29 -15C35 -28 51 -28 54 -17C57 -6 44 -3 42 -11C41 -15 46 -17 47 -13",
  "M0 0C10 12 19 29 35 30C53 31 59 11 48 6C40 2 34 13 41 17C45 19 49 14 46 12",
];
const seeds = [
  [[28, -35], [53, -30], [57, -19]],
  [[32, 22], [53, 21]],
  [[47, -33], [59, -27], [60, -13]],
  [[28, 34], [49, 32]],
];

export function JourneyLeaf({ index }: { index: number }) {
  const anchors = [[106, 163], [141, 401], [165, 449], [148, 510], [125, 542], [112, 626]];
  const shape = index % leaves.length;
  const curl = index % tendrils.length;
  const [x, y] = anchors[shape];
  return (
    <svg className="journey-ornament" viewBox="-72 -72 144 144" aria-hidden="true" focusable="false">
      <path data-story-tendril pathLength={1} d={tendrils[curl]} />
      <g transform={`translate(${-x * .55} ${-y * .55}) scale(.55)`}>
        <path data-story-leaf style={{ transformOrigin: `${x}px ${y}px` }} d={leaves[shape]} />
      </g>
      {seeds[curl].map(([cx, cy], i) => <circle key={cx} data-story-seed cx={cx} cy={cy} r={i ? 1.05 : 1.45} />)}
    </svg>
  );
}

const veins = [
  "M140 305Q131 257 140 188M139 305Q119 257 130 222M141 305Q157 264 151 221",
  "M140 305Q134 263 140 218M139 305Q125 269 133 243M141 305Q153 268 148 242",
  "M140 306Q135 284 140 261M142 304Q150 285 145 274",
  "M136 306Q99 280 58 237M134 306Q98 297 76 272M135 303Q116 270 87 250",
  "M144 306Q181 280 222 237M146 306Q182 297 204 272M145 303Q164 270 193 250",
  "M134 309Q85 293 29 287M128 312Q81 314 57 302M127 305Q88 286 56 283",
  "M146 309Q195 293 251 287M152 312Q199 314 223 302M153 305Q192 286 224 283",
  "M135 312Q106 320 77 333M130 317Q109 332 94 331",
  "M145 312Q174 320 203 333M150 317Q171 332 186 331",
];

export function LotusJourney() {
  return (
    <svg className="journey-bloom"
      viewBox="0 165 280 180" aria-hidden="true" focusable="false">
      {[0, 3, 4, 5, 6, 1, 7, 8, 2].map(index => (
        <g key={index} data-story-petal data-fold={[0, 0, 0, 23, -23, 32, -32, 28, -28][index]}>
          <path className="journey-petal-outline" d={petals[index]} />
          <path data-story-fill d={petals[index]} />
          <path className="journey-veins" d={veins[index]} />
        </g>
      ))}
    </svg>
  );
}
