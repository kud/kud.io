"use client";

import { useEffect, useRef } from "react";
import styles from "./lost-cat.module.css";

// The 404's cat, a stack of separately drawn parts rigged like a 2D puppet.
// Each part was measured against the illustrator's full scene (scale and offset
// by template matching), cropped to its content and placed here in percent of
// the scene box, so the stack reads as one picture at any size. Every moving
// part sits in a rig: a layer the size of the scene, so its transform origin
// and translations are in scene percent too.
type Part =
  | "shadow"
  | "tail"
  | "body"
  | "box"
  | "paws"
  | "head"
  | "head-deeper"
  | "head-up"
  | "paper";

const PARTS: Record<Part, { left: number; top: number; width: number }> = {
  shadow: { left: 13.935, top: 93.149, width: 57.941 },
  tail: { left: 78.372, top: 0, width: 19.714 },
  body: { left: 27.87, top: 28.728, width: 72.13 },
  box: { left: 7.02, top: 51.564, width: 76.172 },
  // The front paws, cut from the body, so they rest on the box's rim while
  // the chest and legs stay behind and beside it.
  paws: { left: 29.756, top: 51.564, width: 45.892 },
  head: { left: 26.299, top: 14.545, width: 44.131 },
  "head-deeper": { left: 23.413, top: 18.439, width: 44.81 },
  "head-up": { left: 26.977, top: 11.467, width: 42.349 },
  paper: { left: 0, top: 81.972, width: 23.679 },
};

const SIZES: Record<Part, [number, number]> = {
  shadow: [442, 46],
  tail: [151, 268],
  body: [551, 409],
  box: [582, 314],
  paws: [350, 80],
  head: [337, 288],
  "head-deeper": [342, 263],
  "head-up": [323, 269],
  paper: [181, 106],
};

// The head turns about the neck (scene percent, also in the CSS). A pose is
// the transform that carries the resting head onto that pose's drawing:
// translate (scene %), rotate (deg), scale x and y. Solved so the centres and
// sizes line up, so a crossfade between two drawings happens mid-move, with
// both in the same place.
type Pose = [number, number, number, number, number];
const REST: Pose = [0, 0, 0, 1, 1];
const DEEPER: Pose = [-1.62, -0.17, -6, 1.0154, 0.9137];
const UP: Pose = [-1.23, -4.32, 4, 0.9596, 0.935];

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp = (u: number) => Math.min(1, Math.max(0, u));
const smooth = (a: number, b: number, x: number) => {
  const u = clamp((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// The head's pose as one number: 0 rests, 1 is nose deeper in the box, -1 is
// looking up at you. In between, the transform is interpolated.
const poseAt = (dip: number): Pose => {
  const to = dip >= 0 ? DEEPER : UP;
  const u = Math.abs(dip);
  return REST.map((v, i) => lerp(v, to[i], u)) as Pose;
};
const css = ([x, y, r, sx, sy]: Pose) =>
  `translate(${x}%, ${y}%) rotate(${r}deg) scale(${sx}, ${sy})`;
const inverse = ([x, y, r, sx, sy]: Pose) =>
  `scale(${1 / sx}, ${1 / sy}) rotate(${-r}deg) translate(${-x}%, ${-y}%)`;

type Ease = (u: number) => number;
const inOut: Ease = (u) =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const sine: Ease = (u) => -(Math.cos(Math.PI * u) - 1) / 2;
// Overshoots by a touch and settles.
const back: Ease = (u) => {
  const c = 1.2;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
};
const out: Ease = (u) => 1 - Math.pow(1 - u, 3);

// A move to a value over a duration (s), then a hold (s).
type Step = [to: number, move: number, hold: number, ease: Ease];

// Peer, nose in deeper with a sniff, back, a small dip (anticipation), then
// up at you with a little give, unimpressed, and back to peering.
const ROUTINE: Step[] = [
  [0, 0, 1.6, sine],
  [1, 1.3, 0.5, inOut],
  [0.9, 0.35, 0, sine],
  [1, 0.35, 0.7, sine],
  [0, 1.0, 0.45, inOut],
  [0.18, 0.3, 0.05, sine],
  [-1, 0.9, 2.2, back],
  [0, 1.1, 0, inOut],
];
const LOOK: Step[] = [
  [0.14, 0.22, 0.03, sine],
  [-1, 0.75, 2.4, back],
  [0, 1.1, 0, inOut],
];

type Track = { steps: Step[]; from: number; start: number; restUntil: number };

const trackValue = (track: Track, t: number) => {
  let from = track.from;
  let at = track.start;
  for (const [to, move, hold, ease] of track.steps) {
    if (t < at + move) return lerp(from, to, ease(clamp((t - at) / move)));
    at += move;
    if (t < at + hold) return to;
    at += hold;
    from = to;
  }
  return from;
};
const trackEnd = (track: Track) =>
  track.steps.reduce((at, [, move, hold]) => at + move + hold, track.start);

const Layer = ({ part }: { part: Part }) => {
  const { left, top, width } = PARTS[part];
  const [w, h] = SIZES[part];
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
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
    />
  );
};

const HEADS = ["head", "head-deeper", "head-up"] as const;
const HEAD_POSE: Record<(typeof HEADS)[number], Pose> = {
  head: REST,
  "head-deeper": DEEPER,
  "head-up": UP,
};

// The paper ball's radius in scene-width percent, so its spin matches the
// distance it rolls.
const BALL_RADIUS = 6.9;
const ROLL = 6.5;

export const Cat = () => {
  const scene = useRef<HTMLDivElement>(null);
  const notice = useRef<() => void>(() => {});

  useEffect(() => {
    const root = scene.current;
    if (!root) return;
    const rig = (name: string) =>
      root.querySelector<HTMLElement>(`[data-rig="${name}"]`)!;
    const body = rig("body");
    const tail = rig("tail");
    const paws = rig("paws");
    const ball = rig("paper");
    const heads = HEADS.map((name) => ({ name, el: rig(name) }));

    // The scene's own clock: it only runs while the cat is animating, so a
    // hidden tab or a scroll away pauses the routine rather than skipping it.
    let clock = 0;
    let last = 0;
    let frame = 0;
    let track: Track = { steps: ROUTINE, from: 0, start: 0, restUntil: 0 };
    let dip = 0;
    let roll = { from: 0, to: 0, start: -10 };
    let rollX = 0;
    let calm = false;
    let visible = true;
    let onScreen = true;

    const draw = () => {
      const t = clock;
      if (t >= trackEnd(track) && t >= track.restUntil) {
        track = {
          steps: ROUTINE.slice(1),
          from: 0,
          start: t,
          restUntil: 0,
        };
      }
      dip = trackValue(track, t);
      // A calm idle on top: the head drifts a little, out of step with the
      // breath, and the body breathes from the feet (about 3 s a breath).
      const drift = calm
        ? 0
        : Math.sin(t * 0.9) * 0.6 + Math.sin(t * 0.37 + 1) * 0.5;
      const breath = (1 - Math.cos((t / 3.2) * Math.PI * 2)) / 2;
      const lean = Math.max(dip, 0);
      const lift = -1.1 * breath;
      // Weight goes forward as the nose goes in.
      const shift = -0.6 * lean;

      body.style.transform = `translateX(${shift}%) rotate(${-0.5 * lean}deg) scaleY(${1 + 0.012 * breath})`;
      paws.style.transform = `translateY(${0.25 * lift}%)`;

      const pose = poseAt(dip);
      pose[0] += shift;
      pose[1] += 0.55 * lift;
      pose[2] += drift;
      const head = css(pose);
      for (const { name, el } of heads) {
        // Each drawing is placed by the current pose relative to its own, and
        // shown only around its pose: the next drawing fades in over the one
        // in front while the head is still moving, then the old one goes.
        const shown =
          name === "head"
            ? 1 - smooth(0.6, 0.8, Math.abs(dip))
            : name === "head-deeper"
              ? smooth(0.3, 0.62, dip)
              : smooth(0.3, 0.62, -dip);
        el.style.opacity = String(shown);
        el.style.transform = `${head} ${inverse(HEAD_POSE[name])}`;
      }

      // The tail sways lazily about its root; the shear lags the swing, so
      // the tip follows through like a bend.
      const swing = Math.sin(t * 1.15) * 3.2 + Math.sin(t * 0.43 + 2) * 1.6;
      const bend = Math.sin(t * 1.15 - 0.9) * 4;
      tail.style.transform = `translate(${shift}%, ${0.75 * lift}%) rotate(${swing}deg) skewX(${bend}deg)`;

      // The paper ball rolls and slows, turning as far as it travels, then
      // rocks to rest on its flattest side.
      const u = clamp((t - roll.start) / 1.25);
      rollX = lerp(roll.from, roll.to, out(u));
      const after = Math.max(0, t - roll.start - 1.25);
      const rock =
        roll.start > 0 && after < 2
          ? Math.sin(after * 9) * Math.exp(-after * 3.2) * 5 * Math.sign(roll.to - roll.from)
          : 0;
      const spin = (rollX / BALL_RADIUS) * (180 / Math.PI) + rock;
      ball.style.transform = `translateX(${rollX}%) rotate(${spin}deg)`;
    };

    const tick = (now: number) => {
      // Time-based: a long frame or a resume advances by at most 50 ms.
      clock += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const update = () => {
      if (!calm && visible && onScreen) {
        if (!frame) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        }
      } else stop();
    };

    notice.current = () => {
      if (calm) return;
      // Up at you from wherever the head is, then a long rest before the
      // routine comes back.
      if (dip > -0.5) {
        track = {
          steps: LOOK,
          from: dip,
          start: clock,
          restUntil: clock + 9 + Math.random() * 4,
        };
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
        // The key pose, still.
        clock = 0;
        track = { steps: [], from: 0, start: 0, restUntil: 0 };
        roll = { from: 0, to: 0, start: -10 };
        draw();
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
    draw();
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
      <div className={styles.rig} data-rig="tail">
        <Layer part="tail" />
      </div>
      <div className={styles.rig} data-rig="body">
        <Layer part="body" />
      </div>
      <Layer part="box" />
      <div className={styles.rig} data-rig="paws">
        <Layer part="paws" />
      </div>
      {HEADS.map((name) => (
        <div key={name} className={styles.rig} data-rig={name}>
          <Layer part={name} />
        </div>
      ))}
      <div className={styles.rig} data-rig="paper">
        <Layer part="paper" />
      </div>
    </div>
  );
};
