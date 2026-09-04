---
title: "FIXME.js"
date: "2019-10-16"
slug: "fixme-js"
tags: ["tools"]
updated: "2026-09-04T13:39:00.000Z"
---

Hey!

You want to list your `NOTE:`, `FIXME:`, `TODO:`, `WHATEVER:`? This node plugin (`fixme`) could be really useful for you.

[Video](https://prod-files-secure.s3.us-west-2.amazonaws.com/45f7dcf7-8b1c-4d17-bf38-f367c62d1b5e/b1f27820-29bf-4f00-8c61-631a867ee5fb/video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466THBYFTWI%2F20260904%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260904T142113Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEC0aCXVzLXdlc3QtMiJGMEQCIBMpDTTa%2B%2FfXPT618%2BLb1GCLJgpZG%2Bma0tuV9Al30jGVAiBr9wSGbs5298TLfA2cqR8YVqdHHxox7YIShV9AaOMPeSqIBAj2%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIM3aGlWsKwAuT6atigKtwDCRZCBps8rDZuekfeZrAdGElmRxyNxyaXf3HvwA0IZPcfQezxH0lrKYqVudLX4N%2FGFaoqul59YQNAX%2BUIGIl8E8RGBitqRBlk7Z8hGrDi84FFE8I1y723VJDGn6rYtrF0bl8HyriU%2BFeVs20vHqBbzin9Js%2FUXo122%2F%2Bl3FD1Yka8tJEqb09ESh79AMcCOTWp%2BRlWEvF%2BbIuVVAzkyCleB91JQ2ohBO50WXTNzhZlKojY9l7wmrNIyJdnWbwQz5Pue%2FIXaHf1LVcMSyqs%2B9KqAjcbdBrqIlmOBC4c15Z8yjbu%2BoyI%2Fm0NKgIEQlM9jE%2BUyDs0jP%2FV7PpSxHqHG9vegb4umcKTP3JZTzmZcDlf5h0iS43MH95tSfrRGNzG%2FMaxxIjx40avd7YL2RsOw7TuQ7PLf1NplUCPu8%2FBtEpIRrbWzDn6%2B2manQacK1xR8DeK582NybtqnPssTXqJoDPxcHSjwlV7xwDzUXRZKAjab%2BIGBqjFuxNuVBxfKAJAhNkhHkXIZqPzu%2Bh6yEt%2FIwXAhGqcxcvsYc5Azuwuh0Cnr0LhiHOrZ0NvmwHlJ0BSmFDNZXmsosAutiqOd0fEeEjBL%2FHOKGSZP7lsUbXLy2hM7JehIHnz5SMS4ymhFREwrv%2Fq1AY6pgHY8NFa5ioFUFtkTeuiDQaZoflgMtM8C74BV7kKHE23NritrNnWgSe%2B%2FlYscRNcofIM3anHadBKDeKzAYZXVJ%2BveU4JHN2t9af3cjg0FJTOQK17KRlzkeRNkpV%2FIo3P0C7pGE0HaxMphYdZm%2FRx4vXJswXMtTd1UDJdeZthzKadaCka6Fo83ez0QG3hLoG%2FYbyno%2BjqW3bPvpVpgvUPEtlgxek2Irnu&X-Amz-Signature=90cfab2a5c4f94940a1d6cb2992d891842d813ecb2282b57bc12d6eb86c8785c&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)

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