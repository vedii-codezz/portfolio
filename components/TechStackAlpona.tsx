import type { ReactNode } from "react";

type OrnamentProps = { back?: boolean };
type AlponaProps = OrnamentProps & { variant: string };

function Lotus({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0 0 C-14-12-12-24 0-34 C12-23 14-12 0 0 Z M0 0 C-22-2-28-15-27-24 C-13-22-4-12 0 0 M0 0 C21-3 29-15 27-24 C13-21 4-12 0 0 M-30-10 Q-19 7 0 3 Q19 7 30-10" />
    <path strokeWidth=".7" d="M0-6 Q-3-17 0-27 M-5-4 Q-18-9-23-18 M5-4 Q18-9 23-18" />
    <circle cy="-42" r="1.8" className="alpona-dot" />
  </g>;
}

function Drawing({ children, back = false, name }: OrnamentProps & { children: ReactNode; name: string }) {
  return <svg className={`toolkit-alpona alpona-${name}${back ? " toolkit-alpona-back" : ""}`}
    viewBox={name === "border" ? undefined : "0 0 360 380"} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"
    fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>;
}

export function PaisleyAlpona({ back = false }: OrnamentProps) {
  return <Drawing name="paisley" back={back}>
    <g transform={back ? "translate(30 -68)" : undefined}>
      <path strokeWidth="1.6" d="M369 254 C297 219 334 169 292 137 C251 106 250 65 280 38 C302 18 333 25 329 47 C326 65 304 61 309 48 C312 40 321 44 319 49 M292 137 C345 147 371 110 352 77 C341 58 336 40 344 17 C295 14 258 31 247 63 C233 105 261 133 292 137 Z" />
      <path strokeWidth=".8" d="M292 127 C330 135 357 109 344 84 C330 61 330 44 333 29 C291 24 261 43 256 70 C250 94 266 118 292 127 M350 222 C330 194 347 168 323 147" />
      <Lotus x={292} y={117} scale={.68} />
      <path d="M329 172 C302 169 296 152 304 146 C320 148 329 158 329 172 Z M334 198 C352 186 357 171 350 161 C336 165 329 183 334 198 M348 232 C324 227 314 215 319 204 C337 207 348 219 348 232" />
      {Array.from({ length: 13 }, (_, i) => { const angle = (154 + i * 13) * Math.PI / 180; return <circle key={i} cx={304 + 65 * Math.cos(angle)} cy={80 + 65 * Math.sin(angle)} r={i % 3 === 0 ? 2 : 1.2} className="alpona-dot" />; })}
    </g>
    {back ? <g><path strokeWidth=".75" d="M30 108 H93 M114 108 H178" /><Lotus x={104} y={111} scale={.21} />{[40, 56, 72, 136, 152, 168].map(x => <circle key={x} cx={x} cy={113} r="1" className="alpona-dot" />)}</g> : <g><Lotus x={39} y={323} scale={.65} /><path d="M14 325 Q43 340 68 323 M19 332 Q42 342 62 332" /></g>}
  </Drawing>;
}

export function SemicircleAlpona({ back = false }: OrnamentProps) {
  return <Drawing name="semicircle" back={back}>
    <g transform="translate(414 178)">
      {[112, 123, 152].map((r, i) => <circle key={r} r={r} strokeWidth={i === 1 ? 1.5 : .8} />)}
      {Array.from({ length: 17 }, (_, i) => <g key={i} transform={`rotate(${i * 14 + 70})`}>
        <path d="M0-127 C-12-135-11-146 0-150 C10-144 13-135 0-127 Z" />
        <path strokeWidth=".65" d="M0-132 Q-2-141 0-145 M0-158 C-8-166-7-179 0-184 C9-176 9-166 0-158 Z" />
        <circle cy="-191" r={i % 2 ? 1.2 : 2} className="alpona-dot" />
      </g>)}
    </g>
    {back && <g><path d="M23 319 C40 333 61 327 72 312 C81 300 95 308 89 316 C84 322 78 318 81 313 M41 327 C36 312 44 304 51 306 C56 316 48 322 41 327" /><Lotus x={28} y={322} scale={.34} /></g>}
  </Drawing>;
}

export function RadialAlpona({ back = false }: OrnamentProps) {
  return <Drawing name="radial" back={back}>
    <g transform={back ? "translate(332 26)" : "translate(307 74)"}>
      {[24, 29, 66, 73, 109].map((r, i) => <circle key={r} r={r} strokeWidth={i % 2 ? .7 : 1.3} />)}
      {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30})`}>
        <path d="M0-31 C-18-40-16-56 0-64 C17-53 17-40 0-31 Z M0-76 C-14-82-15-98 0-106 C15-96 14-82 0-76 Z" />
        <path strokeWidth=".7" d="M0-38 Q-5-48 0-57 M0-82 Q-4-93 0-100 M15-78 C32-88 30-104 22-102 C16-100 20-94 24-96" />
        <circle cy="-116" r="2" className="alpona-dot" />
        <circle cy="-9" r="2" className="alpona-dot" />
      </g>)}
      <path d="M-13 0 Q0-23 13 0 Q0 23-13 0 Z" />
    </g>
    {back && [24, 326].map(y => <g key={y}>{[153, 167, 180, 193, 207].map((x, i) => <circle key={x} cx={x} cy={y} r={i === 2 ? 2 : 1} className="alpona-dot" />)}</g>)}
  </Drawing>;
}

export function BorderAlpona({ back = false }: OrnamentProps) {
  return <Drawing name="border" back={back}>
    {/* The frame follows the card; local viewBoxes keep the original lotus paths undistorted. */}
    {[17, 23].map(inset => <rect key={inset} x={inset} y={inset} rx={16 - (inset - 17) / 2} strokeWidth=".85" style={{ width: `calc(100% - ${inset * 2}px)`, height: `calc(100% - ${inset * 2}px)` }} />)}
    <svg y="18" width="100" height="100" viewBox="0 0 100 100" overflow="visible"><g transform={back ? "translate(8 10) scale(.75)" : undefined}>
      <Lotus x={45} y={63} scale={.72} />
      <path d="M24 88 C40 86 30 65 47 64 C68 63 55 36 78 28 M46 64 C60 77 75 68 71 59 C66 52 60 58 64 62" />
    </g></svg>
    <svg x="100%" y="100%" width="100" height="100" viewBox="0 0 100 100" overflow="visible"><g transform={back ? "rotate(180) translate(8 10) scale(.75)" : "rotate(180)"}>
      <Lotus x={45} y={63} scale={.72} />
      <path d="M24 88 C40 86 30 65 47 64 C68 63 55 36 78 28 M46 64 C60 77 75 68 71 59 C66 52 60 58 64 62" />
    </g></svg>
    {!back && <svg x="50%" y="100%" width="140" height="64" viewBox="110 316 140 64" overflow="visible" style={{ transform: "translate(-70px, -64px)" }}><path d="M118 380 A62 44 0 0 1 242 380 M125 380 A55 37 0 0 1 235 380" /><Lotus x={180} y={378} scale={.85} /><Lotus x={145} y={379} scale={.45} /><Lotus x={215} y={379} scale={.45} /></svg>}
  </Drawing>;
}

export function TechStackAlpona({ variant, back = false }: AlponaProps) {
  const Ornament = ({ "01": PaisleyAlpona, "02": SemicircleAlpona, "03": RadialAlpona, "04": BorderAlpona } as const)[variant as "01" | "02" | "03" | "04"];
  return Ornament ? <Ornament back={back} /> : null;
}
