"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./lost-cat.module.css";

// The 404's cat, a 2D puppet. The illustrator's sixteen core layers, stacked in
// order, are the approved drawing exactly; everything else here is painted
// under them for motion only (marked `motion`) and shows only while the cat
// moves, so a still cat, reduced motion included, is the approved drawing.
// Placement is in percent of the scene box (956 x 832 in the source), each
// part cropped to its content and exported at twice its largest CSS size.
type Box = { left: number; top: number; width: number; w: number; h: number };
const P = {
  shadow: { left: 4.289, top: 76.202, width: 95.188, w: 800, h: 172 },
  paper: { left: 0.418, top: 82.212, width: 23.954, w: 201, h: 121 },
  tail: { left: 78.87, top: 0.601, width: 19.665, w: 165, h: 311 },
  "tail-root": { left: 82.636, top: 30.048, width: 12.448, w: 105, h: 80 },
  body: { left: 62.657, top: 28.846, width: 36.925, w: 310, h: 451 },
  box: { left: 7.427, top: 51.683, width: 76.987, w: 647, h: 351 },
  "neck-under": { left: 37.657, top: 25.841, width: 34.623, w: 291, h: 240 },
  "head-under": { left: 28.766, top: 21.274, width: 43.515, w: 366, h: 273 },
  "head-base": { left: 28.766, top: 21.274, width: 43.515, w: 366, h: 273 },
  "ear-left": { left: 28.243, top: 19.952, width: 16.736, w: 141, h: 134 },
  "ear-right": { left: 45.293, top: 15.264, width: 23.849, w: 200, h: 156 },
  "eye-left-white": { left: 36.715, top: 44.712, width: 8.787, w: 74, h: 76 },
  "eye-left-solid": { left: 37.029, top: 45.553, width: 8.159, w: 69, h: 66 },
  "lid-left-half": { left: 36.611, top: 44.952, width: 8.577, w: 72, h: 58 },
  "lid-left-closed": { left: 36.611, top: 44.952, width: 8.577, w: 72, h: 70 },
  "eye-right-white": { left: 51.151, top: 43.149, width: 9.519, w: 80, h: 83 },
  "eye-right-solid": { left: 51.569, top: 43.87, width: 8.996, w: 76, h: 72 },
  "lid-right-half": { left: 51.674, top: 43.389, width: 9.31, w: 78, h: 54 },
  "lid-right-closed": { left: 51.674, top: 43.389, width: 9.31, w: 78, h: 76 },
  "whiskers-left": { left: 27.197, top: 47.957, width: 7.636, w: 64, h: 40 },
  "whiskers-right": { left: 61.506, top: 43.75, width: 8.473, w: 71, h: 57 },
  "paw-left": { left: 30.335, top: 49.76, width: 9.833, w: 83, h: 83 },
  "paw-right": { left: 61.297, top: 47.957, width: 21.862, w: 184, h: 109 },
} satisfies Record<string, Box>;
type Part = keyof typeof P;

// Each pupil sits in a box the size of its eye (percent of that box), so the
// glance can be clipped to the eye while the cat moves.
const PUPILS = {
  left: { left: 52.564, top: 38.667, width: 43.59, w: 30, h: 38 },
  right: { left: 1.163, top: 43.902, width: 48.837, w: 37, h: 38 },
};
// Where each pupil goes when the cat glances up at you, in percent of its eye
// box: towards the middle of each eye.
const GLANCE = { left: [-15.76, -12.01], right: [15.99, -11.87] } as const;

const Layer = ({
  part,
  motion,
  style,
}: {
  part: Part;
  motion?: boolean;
  style?: CSSProperties;
}) => {
  const { left, top, width, w, h } = P[part];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/404/cat/${part}.webp`}
      alt=""
      width={w}
      height={h}
      decoding="async"
      draggable={false}
      className={styles.part}
      data-part={part}
      data-motion={motion ? "" : undefined}
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, ...style }}
    />
  );
};

const Eye = ({ side }: { side: "left" | "right" }) => {
  const box = P[`eye-${side}-solid`];
  const pupil = PUPILS[side];
  return (
    <>
      <Layer part={`eye-${side}-white`} />
      <Layer part={`eye-${side}-solid`} motion />
      <div
        className={styles.eye}
        style={
          {
            left: `${box.left}%`,
            top: `${box.top}%`,
            width: `${box.width}%`,
            aspectRatio: `${box.w} / ${box.h}`,
            "--mask": `url(/404/cat/eye-${side}-solid.webp)`,
          } as CSSProperties
        }
      >
        <div className={styles.glance} data-rig={`pupil-${side}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/404/cat/eye-${side}-pupil.webp`}
            alt=""
            width={pupil.w}
            height={pupil.h}
            decoding="async"
            draggable={false}
            className={styles.part}
            style={{
              left: `${pupil.left}%`,
              top: `${pupil.top}%`,
              width: `${pupil.width}%`,
            }}
          />
        </div>
      </div>
      <Layer part={`lid-${side}-half`} motion style={{ opacity: 0 }} />
      <Layer part={`lid-${side}-closed`} motion style={{ opacity: 0 }} />
    </>
  );
};

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp = (u: number) => Math.min(1, Math.max(0, u));
const sine = (u: number) => -(Math.cos(Math.PI * clamp(u)) - 1) / 2;
const out = (u: number) => 1 - Math.pow(1 - clamp(u), 3);

// The paper ball's radius in scene-width percent, so its spin matches the
// distance it rolls.
const BALL_RADIUS = 6.9;
const ROLL = 6.5;
// The head's lift when it looks up, in percent of the scene's height (7 px of
// 832), and its tilt, in degrees: the painted neck holds to about here.
const LIFT = 0.84;
const TILT = 2;

export const Cat = () => {
  const scene = useRef<HTMLDivElement>(null);
  const notice = useRef<() => void>(() => {});

  useEffect(() => {
    const root = scene.current;
    if (!root) return;
    const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
    const rig = (name: string) => q(`[data-rig="${name}"]`);
    const body = rig("body");
    const tail = rig("tail");
    const head = rig("head");
    const ball = rig("paper");
    const ears = { left: rig("ear-left"), right: rig("ear-right") };
    const pupils = { left: rig("pupil-left"), right: rig("pupil-right") };
    const lids = (["left", "right"] as const).map((side) => ({
      half: q(`[data-part="lid-${side}-half"]`),
      closed: q(`[data-part="lid-${side}-closed"]`),
    }));

    // The scene's own clock runs only while the cat animates, so a hidden tab
    // or a scroll away pauses the cat rather than skipping ahead.
    let clock = 0;
    let last = 0;
    let frame = 0;
    let calm = false;
    let visible = true;
    let onScreen = true;
    // Events, each a start time on the scene clock.
    let nextBlink = 2.2;
    let blinkAt = -10;
    let nextBored = 13;
    let bored = { at: -10, hold: 0 };
    let nextGlance = 6.5;
    let glance = { at: -10, hold: 0 };
    let nextFlick = 4;
    let flick = { at: -10, side: "left" as "left" | "right" };
    let roll = { from: 0, to: 0, start: -10 };
    let rollX = 0;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // 0 open, 1 half, 2 closed: a blink is half, closed, half, about 0.2 s.
    const lidAt = (t: number) => {
      const b = t - blinkAt;
      if (b >= 0 && b < 0.2) return b < 0.05 || b > 0.15 ? 1 : 2;
      const d = t - bored.at;
      if (d >= 0 && d < bored.hold) return 1;
      return 0;
    };
    // A move in, a hold and a move back, as 0..1.
    const envelope = (t: number, at: number, hold: number, inS: number, outS: number) => {
      const d = t - at;
      if (d < 0) return 0;
      if (d < inS) return sine(d / inS);
      if (d < inS + hold) return 1;
      return 1 - sine((d - inS - hold) / outS);
    };

    const draw = () => {
      const t = clock;
      if (t > nextBlink) {
        blinkAt = t;
        // Now and then a double blink.
        nextBlink = t + (Math.random() < 0.2 ? 0.35 : rand(2.8, 5.5));
      }
      if (t > nextBored) {
        bored = { at: t, hold: rand(1.4, 2.4) };
        nextBlink = Math.max(nextBlink, t + bored.hold + 0.25);
        nextBored = t + rand(14, 22);
      }
      if (t > nextGlance) {
        glance = { at: t, hold: rand(1.2, 2.2) };
        nextGlance = t + rand(7, 11);
      }
      if (t > nextFlick) {
        flick = { at: t, side: Math.random() < 0.5 ? "left" : "right" };
        nextFlick = t + rand(4.5, 9);
      }

      const breath = (1 - Math.cos((t / 3.2) * Math.PI * 2)) / 2;
      const look = envelope(t, glance.at, glance.hold, 0.28, 0.4);
      // The head drifts slowly about the neck, out of step with the breath,
      // and lifts a touch when the cat glances up.
      const tilt = calm
        ? 0
        : TILT * (0.7 * Math.sin(t * 0.5) + 0.3 * Math.sin(t * 0.23 + 1)) * (1 - 0.5 * look);
      const lift = -LIFT * look - 0.25 * breath;
      head.style.transform = `translateY(${lift}%) rotate(${tilt}deg)`;
      body.style.transform = `scaleY(${1 + 0.006 * breath})`;

      for (const side of ["left", "right"] as const) {
        const [gx, gy] = GLANCE[side];
        pupils[side].style.transform = `translate(${gx * look}%, ${gy * look}%)`;
        // One ear twitches back and settles, a quarter of a second.
        const f = t - flick.at;
        const ear =
          flick.side === side && f >= 0 && f < 0.45
            ? Math.sin((f / 0.45) * Math.PI) * Math.exp(-f * 3) * 5
            : 0;
        ears[side].style.transform = `rotate(${side === "left" ? -ear : ear}deg)`;
      }
      const lid = lidAt(t);
      for (const l of lids) {
        l.half.style.opacity = lid === 1 ? "1" : "0";
        l.closed.style.opacity = lid === 2 ? "1" : "0";
      }

      // The tail sways lazily about its root, within what the painted root holds.
      const swing = Math.sin(t * 1.15) * 3 + Math.sin(t * 0.43 + 2) * 1.5;
      const bend = Math.sin(t * 1.15 - 0.9) * 2;
      tail.style.transform = `rotate(${swing}deg) skewX(${bend}deg)`;

      // The paper ball rolls and slows, turning as far as it travels, then
      // rocks to rest on its flattest side.
      const u = clamp((t - roll.start) / 1.25);
      rollX = lerp(roll.from, roll.to, out(u));
      const after = Math.max(0, t - roll.start - 1.25);
      const rock =
        roll.start > 0 && after < 2
          ? Math.sin(after * 9) * Math.exp(-after * 3.2) * 5 * Math.sign(roll.to - roll.from)
          : 0;
      ball.style.transform = `translateX(${rollX}%) rotate(${(rollX / BALL_RADIUS) * (180 / Math.PI) + rock}deg)`;
    };

    const tick = (now: number) => {
      // Time-based: a long frame or a resume advances by at most 50 ms.
      clock += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    // Layers are promoted, and the motion-only paint shown, only while the
    // cat moves; a still cat is the approved drawing, painted crisp.
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      delete root.dataset.moving;
    };
    const update = () => {
      if (!calm && visible && onScreen) {
        if (!frame) {
          root.dataset.moving = "";
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
      } else stop();
    };

    notice.current = () => {
      if (calm) return;
      // Up at you: a glance and a lift, now.
      if (clock - glance.at > glance.hold + 0.7) {
        glance = { at: clock, hold: rand(1.6, 2.4) };
        nextGlance = clock + rand(9, 13);
      }
    };
    const kick = () => {
      if (calm || clock - roll.start < 0.4) return;
      const home = Math.abs(rollX) > ROLL / 2;
      roll = { from: rollX, to: home ? 0 : -ROLL, start: clock };
    };
    root.dataset.ready = "";
    const onTap = () => {
      notice.current();
      kick();
    };
    root.addEventListener("click", onTap);

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setCalm = () => {
      calm = query.matches;
      if (calm) {
        // The key pose, still: every rig back to its identity.
        for (const el of root.querySelectorAll<HTMLElement>("[data-rig]")) el.style.transform = "";
        for (const l of lids) {
          l.half.style.opacity = "0";
          l.closed.style.opacity = "0";
        }
        rollX = 0;
        roll = { from: 0, to: 0, start: -10 };
      }
      update();
    };
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    query.addEventListener("change", setCalm);
    setCalm();
    return () => {
      stop();
      observer.disconnect();
      root.removeEventListener("click", onTap);
      document.removeEventListener("visibilitychange", onVisibility);
      query.removeEventListener("change", setCalm);
    };
  }, []);

  return (
    <div
      ref={scene}
      className={styles.scene}
      role="img"
      aria-label="A calico cat with its nose in an empty cardboard box, next to a crumpled ball of paper."
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") notice.current();
      }}
    >
      <Layer part="shadow" />
      <div className={styles.rig} data-rig="paper">
        <Layer part="paper" />
      </div>
      <div className={styles.rig} data-rig="tail">
        <Layer part="tail" />
        <Layer part="tail-root" motion />
      </div>
      <div className={styles.rig} data-rig="body">
        <Layer part="body" />
      </div>
      <Layer part="box" />
      {/* The neck and the box behind the chin, for when the head moves. */}
      <Layer part="neck-under" motion />
      <div className={styles.rig} data-rig="head">
        <Layer part="head-under" motion />
        <Layer part="head-base" />
        <div className={styles.rig} data-rig="ear-left">
          <Layer part="ear-left" />
        </div>
        <div className={styles.rig} data-rig="ear-right">
          <Layer part="ear-right" />
        </div>
        <Eye side="left" />
        <Eye side="right" />
        <Layer part="whiskers-left" />
        <Layer part="whiskers-right" />
      </div>
      {/* The paws stay on the rim. */}
      <Layer part="paw-left" />
      <Layer part="paw-right" />
    </div>
  );
};
