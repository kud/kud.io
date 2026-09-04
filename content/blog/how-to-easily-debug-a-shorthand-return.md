---
title: "How to easily debug a shorthand return"
description: "like a map()."
date: "2021-02-01"
slug: "how-to-easily-debug-a-shorthand-return"
tags: []
cover: "/blog/how-to-easily-debug-a-shorthand-return/a283ac973b70.jpg"
updated: "2026-09-04T11:03:00.000Z"
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

But for a reason you want to debug `item` without uncoding this shorthand and code a classic return like `arr.map(item =\> { return ... })`.

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