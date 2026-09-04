---
title: "FIXME.js"
date: "2019-10-16"
slug: "fixme-js"
tags: ["tools"]
updated: "2026-09-04T13:39:00.000Z"
---

Hey!

You want to list your `NOTE:`, `FIXME:`, `TODO:`, `WHATEVER:`? This node plugin (`fixme`) could be really useful for you.

[Video](/blog/fixme-js/7ff34135a5e6.mp4)

## How to use it

**Installation**

`$ npm install fixme @babel/core @babel/node --save-dev`

**Code**

./_fixme.js_

```javascript
import fixme from "fixme"

fixme({
  path: "./src/",
  ignored_directories: [],
  file_patterns: ["**/*"],
  file_encoding: "utf8",
  line_length_limit: 3000,
})
```

_./package.json_

```javascript
{
  "scripts": {
    "fixme": "babel-node fixme"
  }
}
```

**Usage**

`$ npm run fixme`

More information there: [https://github.com/JohnPostlethwait/fixme](https://github.com/JohnPostlethwait/fixme)