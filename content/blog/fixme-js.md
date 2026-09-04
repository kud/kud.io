---
title: "FIXME.js"
date: "2019-10-16"
slug: "fixme-js"
tags: []
updated: "2026-09-04T11:04:00.000Z"
---

Hey!

You want to list your `NOTE:`, `FIXME:`, `TODO:`, `WHATEVER:`? This node plugin (`fixme`) could be really useful for you.

[Video](https://prod-files-secure.s3.us-west-2.amazonaws.com/45f7dcf7-8b1c-4d17-bf38-f367c62d1b5e/b1f27820-29bf-4f00-8c61-631a867ee5fb/video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4667BOMVCJ5%2F20260904%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260904T125805Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECsaCXVzLXdlc3QtMiJGMEQCIFe3bNqioELaWBaVmXwAOyYj0i8PZ4MNnoIZQr54fLNDAiAFxcpUI4me7qNGZeCfdOcuMI66OZnhrqhhgZ2scAbeASqIBAj0%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMeXiN2usr8GCf61QDKtwDOHLRiNvyovkvt3HSrU6ZluI4PbETmWCJ58fz3hxUJl1XKfuXjv0y%2FRR65BbCkdSguFnPBtXj8zV0vO5fUtoNWWqLJJ3ojRR7dYAFDAVhbRMfS%2FkgibP4pYaltKNpeTP9IbSFBEWmw%2FfNPa%2BLjlnJ7xyUHcHGEnPTRCFVYA7CDtCtvOPOBUQodBPZAKQ6MgoWczX5UKLIOijljFGJmsNm8AloQLj%2FHTcCQKnQEDoWnuifPEvm6ZrzNmydiqRhTCwaI2r8rpUBDSNdEMUyv4dsVaRi4qD1plGcNrb%2BGTObzHF2G0mkooKweMJFCorMgs4VXaT4zKZXs3jVX8xWLyD8FRAsaKiQdueuR9N6cbXwu0e3EcjprqJM2SkjjsQfxJ7ZSmm7QeBz9A2ihr7y%2FDhWWw1HrL%2FlndtNcsfP%2B%2FewoEM8cL9c7kYJ4f2iiXeMm2M8dhq7yJz9YIZIW9pA%2B8gsnoOS%2BM4dwh95QYuRuKmJEPgzV%2Fc5l49rlLC6w31946q9VfE1Fq7tu%2BEM%2BfXrcyTLjzGJ%2F2uSjB7wgQSCY%2BtayZnF4xRio45%2BDjhM%2B9QlEI43dio56aytU5UsFWg0nUcupabrmqe5JVWFS0OiSGtyOjTUGwuEAOUGTrDWOx8wi8Lq1AY6pgGt47NNoLFB%2Fja5loh7kkhDWVr4RJM%2FB1IIXHmGGKpb%2Fd%2FnQYsOipJg8u73N%2BfAxj0t8gBlrEUa%2B3jHlZ3%2FGBmy%2F7mdmy9oRDAkWYDc8%2FgRglg%2FZ7LqtAV%2Fe6Oo%2BJcOQ722sfVWcgD0MLbbxkicjvvkOFch4xZB6ohj4mg7dn%2BHqfH%2BKsOg5UXJbP7o76lC8260wgBB1iM84QqoKiLMEoWPNOC1GKdM&X-Amz-Signature=95e8dea07fe98e51fcb04609456dd5510e625ffb61cd00979a3ff20ca8663bef&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

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