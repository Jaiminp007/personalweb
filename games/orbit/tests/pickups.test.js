import { test } from "node:test";
import assert from "node:assert/strict";
import { inPickupRange } from "../pickups.js";
const p = (x, y, z) => ({ x, y, z });
test("collects when boosting completely through a signal between frames", () =>
  assert.equal(inPickupRange(p(-30, 0, 0), p(30, 0, 0), p(0, 0, 0), 14), true));
test("does not collect a marker that merely lines up visually at a different height", () =>
  assert.equal(
    inPickupRange(p(0, 0, 0), p(0, 0, 20), p(0, 25, 10), 14),
    false,
  ));
test("includes the pickup boundary and stationary craft", () => {
  assert.equal(inPickupRange(p(0, 0, 0), p(0, 0, 0), p(14, 0, 0), 14), true);
  assert.equal(inPickupRange(p(0, 0, 0), p(0, 0, 0), p(14.1, 0, 0), 14), false);
});
