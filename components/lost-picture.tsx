"use client";

import { useLayoutEffect } from "react";
import styles from "./lost-picture.module.css";
import { Cat } from "./lost-cat";

// The 404 shows one of two cats, a coin toss on every load. Both are in the
// markup and CSS shows the one named by data-lost-cat on <html>, so nothing
// swaps after paint: the inline script below sets it while the page parses,
// and without scripting it is never set and the first cat shows. ?cat=1 or
// ?cat=2 forces one, off the production host only, for previews.
const ATTRIBUTE = "data-lost-cat";

// Self-contained: its source is also the inline script.
const pick = (attribute: string) => {
  const forced = new URLSearchParams(location.search).get("cat");
  const live = ["kud.io", "www.kud.io"].includes(location.hostname);
  const choice =
    !live && (forced === "1" || forced === "2")
      ? forced
      : Math.random() < 0.5
        ? "1"
        : "2";
  document.documentElement.setAttribute(attribute, choice);
};
const PICK = `try{(${pick.toString()})(${JSON.stringify(ATTRIBUTE)})}catch(e){}`;

export const LostPicture = () => {
  // A client-side navigation to a missing page renders this without running
  // the inline script, so the toss happens here instead, still before paint.
  // Leaving clears it, so the next 404 tosses again.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute(ATTRIBUTE)) pick(ATTRIBUTE);
    return () => root.removeAttribute(ATTRIBUTE);
  }, []);

  return (
    <div>
      <script dangerouslySetInnerHTML={{ __html: PICK }} />
      <div className={styles.first}>
        <Cat />
      </div>
      <div className={styles.second}>
        {/* PLACEHOLDER: a crop of the reference render, standing in until the
            production illustration arrives. Swap the file, keep the slot. */}
        <div className={styles.scene}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/404/box-cat/placeholder.webp"
            alt="A ginger tabby seen from behind, diving head first into an open cardboard box, next to a ball of yarn, two books and a potted plant."
            width={840}
            height={429}
            loading="lazy"
            decoding="async"
            className={styles.image}
          />
        </div>
      </div>
    </div>
  );
};
