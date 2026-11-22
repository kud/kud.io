import { test } from "node:test"
import assert from "node:assert/strict"
import {
  bodyFor,
  closingFor,
  keyFromTitle,
  keyOf,
  newId,
  newestPerKey,
  plan,
  titleFor,
} from "./vercel-watch.js"

const deploy = (name, branch, state, created, extra = {}) => ({
  uid: `dpl_${name}_${created}`,
  name,
  state,
  created,
  target: branch === "main" ? "production" : null,
  meta: { githubCommitRef: branch },
  ...extra,
})

const thread = (key, { closed = false, posted_ts = 1, id = `t_${key}` } = {}) => ({
  id,
  title: titleFor(key),
  closed,
  posted_ts,
})

test("the key reads back from the title it built", () => {
  const key = keyOf(deploy("kud-io", "feat/x", "ERROR", 1))
  assert.equal(key, "kud-io · feat/x")
  assert.equal(titleFor(key), "▲ kud-io · feat/x failed to deploy")
  assert.equal(keyFromTitle(titleFor(key)), key)
  assert.equal(keyFromTitle("kud/kud.io · Deploy"), null)
})

test("newest finished per key, ignoring canceled and building", () => {
  const newest = newestPerKey([
    deploy("a", "main", "ERROR", 100),
    deploy("a", "main", "READY", 200),
    deploy("a", "main", "CANCELED", 300),
    deploy("a", "main", "BUILDING", 400),
    deploy("b", "main", "READY", 100),
    deploy("b", "main", "ERROR", 200),
    deploy("c", "dev", "CANCELED", 100),
  ])
  assert.equal(newest.get("a · main").state, "READY")
  assert.equal(newest.get("b · main").state, "ERROR")
  assert.equal(newest.has("c · dev"), false)
})

test("readyState wins over state when both are present", () => {
  const newest = newestPerKey([{ ...deploy("a", "main", "BUILDING", 1), readyState: "ERROR" }])
  assert.equal(newest.size, 1)
})

test("a failure with no thread opens one", () => {
  const actions = plan([deploy("a", "main", "ERROR", 100)], [])
  assert.deepEqual(
    actions.map((a) => [a.type, a.key]),
    [["open", "a · main"]],
  )
})

test("a failure with an open thread does nothing", () => {
  assert.deepEqual(plan([deploy("a", "main", "ERROR", 100)], [thread("a · main")]), [])
})

test("a success closes the open thread of its key only", () => {
  const actions = plan(
    [deploy("a", "main", "READY", 100), deploy("a", "dev", "READY", 100)],
    [thread("a · main", { id: "T1" }), thread("b · main")],
  )
  assert.equal(actions.length, 1)
  assert.equal(actions[0].type, "close")
  assert.equal(actions[0].thread.id, "T1")
})

test("a success with no open thread does nothing", () => {
  assert.deepEqual(plan([deploy("a", "main", "READY", 100)], [thread("a · main", { closed: true })]), [])
})

test("a failure already reported and closed by hand stays closed", () => {
  const closedAfter = thread("a · main", { closed: true, posted_ts: 200 })
  assert.deepEqual(plan([deploy("a", "main", "ERROR", 100_000)], [closedAfter]), [])
})

test("a newer failure after a closed thread opens a new one", () => {
  const closedBefore = thread("a · main", { closed: true, posted_ts: 50 })
  const actions = plan([deploy("a", "main", "ERROR", 100_000)], [closedBefore])
  assert.equal(actions[0].type, "open")
})

test("canceled after a failure keeps the failure as the newest", () => {
  const actions = plan(
    [deploy("a", "main", "ERROR", 100), deploy("a", "main", "CANCELED", 200)],
    [],
  )
  assert.equal(actions[0].type, "open")
})

test("new threads are capped, the rest skipped", () => {
  const deployments = Array.from({ length: 12 }, (_, i) => deploy(`p${i}`, "main", "ERROR", i))
  const actions = plan(deployments, [], 10)
  assert.equal(actions.filter((a) => a.type === "open").length, 10)
  assert.equal(actions.filter((a) => a.type === "skip").length, 2)
})

test("the body mirrors Vercel's alert", () => {
  const body = bodyFor(
    deploy("a", "feat/x", "ERROR", 1, {
      target: null,
      inspectorUrl: "https://vercel.com/kud/a/abc",
      meta: {
        githubCommitRef: "feat/x",
        githubCommitSha: "0123456789abcdef",
        githubCommitMessage: "✨ feat: thing\n\nlonger body",
        githubCommitAuthorLogin: "kud",
      },
    }),
  )
  assert.equal(
    body,
    [
      "✨ feat: thing (`0123456`)",
      "Branch: feat/x",
      "Target: preview",
      "Author: kud",
      "[Inspect](https://vercel.com/kud/a/abc)",
    ].join("\n"),
  )
  assert.equal(closingFor("a · main"), "✓ a · main deployed again")
})

test("a deployment without git metadata keys on its target", () => {
  const cli = { name: "kud-io", state: "ERROR", created: 1, target: "production", meta: {} }
  assert.equal(keyOf(cli), "kud-io · production")
  assert.match(bodyFor(cli), /^Branch: production\nTarget: production$/)
})

test("ids are base58 UUIDv7", () => {
  const id = newId(1_700_000_000_000, Buffer.alloc(10))
  assert.match(id, /^[1-9A-HJ-NP-Za-km-z]{21,22}$/)
  assert.notEqual(newId(), newId())
})
