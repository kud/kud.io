"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./lost-cat.module.css";

// The 404's cat, a stack of separately drawn parts. Each part was measured
// against the illustrator's full scene (scale and offset by template matching),
// cropped to its content and placed here in percent of the scene box, so the
// stack reads as one picture at any size.
type Part =
  | "shadow"
  | "tail"
  | "tail-swish"
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
  "tail-swish": { left: 61.954, top: 0.919, width: 29.057 },
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
  "tail-swish": [222, 265],
  body: [551, 409],
  box: [582, 314],
  paws: [350, 80],
  head: [337, 288],
  "head-deeper": [342, 263],
  "head-up": [323, 269],
  paper: [181, 106],
};

type Head = "head" | "head-deeper" | "head-up";

// Peer, nose in deeper, then up at you, unimpressed, for a beat. Times in ms.
const ROUTINE: [Head, number][] = [
  ["head", 1400],
  ["head-deeper", 1700],
  ["head", 500],
  ["head-up", 2400],
  ["head", 0],
];

const Layer = ({ part, shown = true }: { part: Part; shown?: boolean }) => {
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
      data-shown={shown || undefined}
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%` }}
    />
  );
};

export const Cat = () => {
  const [head, setHead] = useState<Head>("head");
  const [swish, setSwish] = useState(false);
  const [rolls, setRolls] = useState(0);
  const calm = useRef(true);
  const play = useRef<(steps: [Head, number][], restMs: number) => void>(
    () => {},
  );

  useEffect(() => {
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers = [];
    };
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };
    // Plays a routine, then rests and comes back to it now and then, with the
    // tail going on its own slower clock.
    const run = (steps: [Head, number][], restMs: number) => {
      clear();
      let at = 0;
      for (const [pose, hold] of steps) {
        later(() => setHead(pose), at);
        at += hold;
      }
      later(() => {
        setSwish(true);
        later(() => setSwish(false), 900);
      }, at + 3200);
      later(
        () => run(ROUTINE.slice(1), 9000 + Math.random() * 5000),
        at + restMs,
      );
    };
    play.current = run;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => {
      calm.current = query.matches;
      clear();
      setHead("head");
      setSwish(false);
      if (!calm.current) run(ROUTINE, 7000);
    };
    start();
    query.addEventListener("change", start);
    return () => {
      query.removeEventListener("change", start);
      clear();
    };
  }, []);

  // Pointed at or tapped: up at you straight away, and the paper ball rolls.
  const notice = () => {
    if (calm.current) return;
    play.current(
      [
        ["head-up", 2200],
        ["head", 0],
      ],
      8000,
    );
    setRolls((count) => count + 1);
  };

  return (
    <div
      className={styles.scene}
      role="img"
      aria-label="A calico cat with its nose in an empty cardboard box, next to a crumpled ball of paper."
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") notice();
      }}
      onClick={notice}
    >
      <Layer part="shadow" />
      <Layer part="tail" shown={!swish} />
      <Layer part="tail-swish" shown={swish} />
      <Layer part="body" />
      <Layer part="box" />
      <Layer part="paws" />
      <Layer part="head" shown={head === "head"} />
      <Layer part="head-deeper" shown={head === "head-deeper"} />
      <Layer part="head-up" shown={head === "head-up"} />
      <span
        key={rolls}
        className={styles.roll}
        data-rolling={rolls > 0 || undefined}
        data-way={rolls % 2 ? "out" : "back"}
      >
        <Layer part="paper" />
      </span>
    </div>
  );
};
