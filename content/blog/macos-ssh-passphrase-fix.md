---
title: "Every time you want to use ssh, macOS asks you your passphrase? This is the fix."
date: "2017-12-01"
slug: "macos-ssh-passphrase-fix"
tags: ["tools"]
cover: "/blog/macos-ssh-passphrase-fix/f56bea5a0b0c.png"
updated: "2026-09-04T13:39:00.000Z"
---

Since Sierra (macOS), I've got this annoying question when I want to connect to a server via ssh:

```shell
$ ssh kud.io
Enter passphrase for key '/Users/kud/.ssh/id_rsa':
```

It asks you your passphrase.

Ugh? Usually it is saved in Keychain. But it doesn't work anymore.

However, there's a solution not to have to `$ ssh-add -K` every time you start a shell and want to connect with ssh.

Just add these lines to your `~/.ssh/config` line and it forces the SSH daemon to use Keychain.

```text
Host *
  UseKeychain yes
  AddKeysToAgent yes
```

The reason is that the latest updates comes bundled with an [updated OpenSSH package](https://developer.apple.com/library/content/technotes/tn2449/_index.html) that changes some default behaviour.

```text
Prior to macOS Sierra, ssh would present a dialog asking for your passphrase and
would offer the option to store it into the keychain. This UI was deprecated
some time ago and has been removed. Instead, a new UseKeychain option was
introduced in macOS Sierra allowing users to specify whether they would like for
the passphrase to be stored in the keychain. This option was enabled by default
on macOS Sierra, which caused all passphrases to be stored in the keychain. This
was not the intended default behavior, so this has been changed in macOS
10.12.2. OpenSSH updates in macOS 10.12.2
```