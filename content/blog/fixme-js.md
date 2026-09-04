---
title: "FIXME.js"
date: "2019-10-16"
slug: "fixme-js"
tags: []
updated: "2026-09-04T11:04:00.000Z"
---

Hey!

You want to list your `NOTE:`, `FIXME:`, `TODO:`, `WHATEVER:`? This node plugin (`fixme`) could be really useful for you.

[Video](https://prod-files-secure.s3.us-west-2.amazonaws.com/45f7dcf7-8b1c-4d17-bf38-f367c62d1b5e/b1f27820-29bf-4f00-8c61-631a867ee5fb/video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4665MHGHGUV%2F20260904%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260904T112344Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjECsaCXVzLXdlc3QtMiJHMEUCICGv4dMNbdHx%2B%2BmkRpKRa188BClKBKxKsYMHFdpLs4w2AiEApc9GAI2CUlsjR4uxp8%2Bwq49esgEljzZtyW0TNycc2fcqiAQI9P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDFtknvJBT7MSwB%2F%2BTyrcA4WGzsyNr6DB5xnpWFkvKW0mw21Y1k0b9N2dS7QqgtH9fIoS7gCJKTrNlQIO8txRAuV1ISg6NbVrpUU9mXTmSQnIPBiBaSiCK1EgXSCbrkYlAtsGd3TLsdoQfUzYzhmgifX7a8hIGv7BaQtPy07vLZl7o%2BbO9KoFF62%2FoodqCubAq4jNuMfVjJc%2BGrxMWYOd5JXJKbyy2Z6KD6TdQuhtrCd08GU0%2FPiV%2B7AvAGfeQQyRVbahANCDCSKAXjGT2fzyKPgi%2B3gazH4OhIuLPDAdpjJMzVDMVJzDKqG5BC1rH7Lft4zsJf4RmD%2BtlNRaJxMu%2FDVJSV7oq5fgQJb6n%2Flb4P2zm9DU9ukVlsTPV1ZmTZddwoj4%2BklPqS6rUkUUtyMVfENGIRfYtXyY4dFJtdbsQMtKkDyTPslnNp3qNQ5opmz0lxpUh1NFKiis5Wn1aXSoT1MhnvV1z7zyiXYmGdw3l0GuO0nrPvQK%2Bg4k%2BDT4d2%2BVGmOp1zIKjmieVMF3zbMxKPXMNjaiw7KsWWv2bnBv%2Fkw7P29KyItu5UttTHnjGOHJUaYfiTrauKlGLDRDjril%2Fnr62HG%2BHW9JsxR07ui4p1XQV%2B4CcJnqe8BNRMfL6fwIDcsjnR9uKREjWoSJMJnD6tQGOqUBbJeGsgu4GonF4veSzQ9GkdEOBR5w8avr1x6CsdJztvYgIZkAq%2B1d83pHBgkMCn3nnAC0ncu7GeG15h2omkQzVG6OXVXYh7JB4oGucDoVEgBHyyRskLoMKQ8BJEdPwHtZeQBS9VpJPfwqdwnYIsAMefo3GAFq3DIt7uXnNwng8yDSX0NktROSnEa0k3jqUli67dVfJ%2B0oXZtl7af73IfGQjmynz1k&X-Amz-Signature=f757a6493b8ee4de8d26e71b55cba16ff96be99d60a0f438b23496815ceec54c&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

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