import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { monthBounds, monthGrid, shiftMonth, weekdays } from "./calendar.ts"

describe("newsletter calendar", () => {
  it("starts weeks on Monday and pads the month with empty cells", () => {
    // 1 November 2026 is a Sunday: six empty cells, then the 1st.
    const weeks = monthGrid("2026-11")
    assert.deepEqual(weeks[0], [
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-11-01",
    ])
    assert.equal(weeks[1][0], "2026-11-02")
    assert.ok(weeks.every((week) => week.length === 7))
    assert.equal(weeks.flat().filter(Boolean).length, 30)
    assert.equal(weeks.at(-1)?.at(-1), null)
  })

  it("knows leap years and a month that starts on Monday", () => {
    assert.equal(monthGrid("2028-02").flat().filter(Boolean).length, 29)
    assert.equal(monthGrid("2026-06")[0][0], "2026-06-01")
  })

  it("moves across years", () => {
    assert.equal(shiftMonth("2026-12", 1), "2027-01")
    assert.equal(shiftMonth("2027-01", -1), "2026-12")
    assert.equal(shiftMonth("2026-03", -14), "2025-01")
  })

  it("names the days Monday first in both languages", () => {
    assert.equal(weekdays("fr")[0].long, "lundi")
    assert.equal(weekdays("en")[0].long, "Monday")
    assert.equal(weekdays("en")[6].long, "Sunday")
  })

  it("bounds paging to the months that have editions", () => {
    assert.deepEqual(monthBounds(["2026-11-14", "2026-09-30", "2026-11-02"]), {
      first: "2026-09",
      last: "2026-11",
    })
    assert.equal(monthBounds([]), null)
  })
})
