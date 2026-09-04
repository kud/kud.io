---
title: "How to edit a markdown in 2020, part 3: prettier"
description: "…or how to force to use mdx parser."
date: "2020-05-14"
slug: "how-to-edit-a-markdown-in-2020-part-3-prettier"
tags: []
cover: "/blog/how-to-edit-a-markdown-in-2020-part-3-prettier/33b47ae8e128.png"
updated: "2026-09-04T11:04:00.000Z"
---

In [this post](https://www.notion.so/en/posts/2020/05/10/how-to-edit-a-markdown-in-2020-part-1-zmv), we changed the default extension `.mdx` to `.md` especially in order to be able to use Markdown Editors which sometimes only allow `.md` files.

However, it comes with a downside I didn't expect: [prettier](https://prettier.io/).

Indeed, in the settings of my editors, I set that I want to use prettier everytime I save a file. The thing is prettier thinks we've got here a markdown file and not a MDX one, depending on the extension, so I have a wrong formatting. But we can fix that!

How? By defining in the prettier configuration to override the parser.

Open or create your prettier config file and add override settings:

```javascript
// .prettierrc.js
module.exports = {
  overrides: [
    {
      files: "*.md",
      options: {
        parser: "mdx",
      },
    },
  ],
}
```

It will force to use MDX parser instead of markdown parser for any `.md` files. Great! 🙌🏻

Just a little thing before leaving you, I'll give you my configuration for [Sublime Text \> JsPrettier](https://github.com/jonlabelle/SublimeJsPrettier), because a trick is needed too.

In `JsPrettier Settings - User`, you must add this line:

```diff
{
  "auto_format_on_save": true,
+  "additional_cli_args": { "--config-precedence": "file-override" }
}
```

Now, you've got all the cards to choose between the different extensions. There's pros and cons. But you've seen zmv, prettier, and different markdown editors thanks to that.