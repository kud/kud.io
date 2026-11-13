---
title: "How to easily debug a shorthand return"
description: "Log inside an arrow function's shorthand return without rewriting it, thanks to the comma operator."
date: "2021-02-01"
slug: "debug-a-shorthand-return"
tags: ["engineering"]
cover: "/blog/debug-a-shorthand-return/8dfcd7b77913.jpg"
updated: "2026-11-13T22:06:00.000Z"
---

See this code:

```javascript
const arr = [
  {
    title: "ha",
    another: "thing",
  },
  {
    title: "oh",
    another: "stuff",
  },
  {
    title: "hey",
    another: "person",
  },
]

const MyComponent = () => (
  <div>
    {arr.map((item) => (
      <div>{item.title}</div>
    ))}
  </div>
)
```

As you can see, you've got here a shorthand return for your `Array.map()`.

But for a reason you want to debug `item` without uncoding this shorthand and code a classic return like `arr.map(item => { return ... })`.

This is my solution:

```diff
const MyComponent = () => (
  <div>
    {arr.map((item) => (
+     console.log(item),
      <div>{item.title}</div>
    ))}
  </div>
)
```

Yyyyyes.

This can be possible because we use the comma operator (`,`) which evaluates any expression and will return the last element.

Nice trick, isn't it?