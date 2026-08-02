---
title: "duux"
description: "Duux smart fan control library — passwordless auth, device discovery, and cloud/MQTT command transports for the Whisper Flex 2"
---

## Features

- **Passwordless sign-in** — request a one-time email code, exchange it over OAuth2/PKCE; tokens are stored in the macOS Keychain, never on disk
- **Device discovery** — lists the fans on an account from the Cloudgarden v5 API, with their live state included
- **Typed command grammar** — `powerCommand`, `speedCommand`, `modeCommand`, oscillation, night mode, child lock and timer builders that validate their ranges rather than sending nonsense to hardware
- **Two transports** — a cloud transport over the v5 REST API, and an MQTT transport for running against a broker on your own network
- **Stateful sessions** — `createSession()` gives an observable fan state that polls or subscribes depending on the transport, and re-reads shortly after each command so callers see a confirmed value

## Install

```sh
npm install @kud/duux
```

Looking for a ready-to-use terminal client instead? See [`@kud/duux-cli`](https://github.com/kud/duux-cli), the CLI built on this library.

## Usage

Sign in, discover the fans on the account, and remember one as current:

```ts
import {
  requestLoginCode,
  exchangeLoginCode,
  discover,
  upsertDevice,
} from "@kud/duux"

await requestLoginCode("you@example.com")
// enter the one-time code emailed to you
const token = await exchangeLoginCode(code)

const { devices } = await discover(token.accessToken)
for (const device of devices) {
  upsertDevice({
    id: device.id,
    type: device.type,
    displayName: device.displayName ?? device.name,
    mac: device.deviceId,
  })
}
```

Once a device is current, one-shot calls resolve it — and the signed-in
account — automatically:

```ts
import { getStatus, setSpeed, setPower } from "@kud/duux"

const state = await getStatus()
console.log(state.mode, state.power, state.speed)

await setPower(true)
await setSpeed(12)
```

Command builders validate their ranges before anything is sent:

```ts
import { speedCommand, horizontalOscillationCommand } from "@kud/duux"

speedCommand(12) // "tune set speed 12"
speedCommand(31) // throws RangeError: speed must be an integer between 1 and 30, got 31

horizontalOscillationCommand(2) // "tune set horosc 2" — 60° sweep
```

For a long-lived connection, `createSession()` polls (cloud) or subscribes
(MQTT) and emits `change` on every update, including the confirmed value
after a command:

```ts
import { createSession } from "@kud/duux"

const session = createSession()

session.on("change", (state) => {
  console.log(state.connected, state.fan?.speed)
})

await session.setSpeed(20)
session.stop()
```

## Development

```sh
git clone https://github.com/kud/duux.git
cd duux
npm install
npm run build
npm run typecheck
npm test
```

`npm test` runs the vitest suite (50 tests).
