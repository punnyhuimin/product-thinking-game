import { test } from "node:test";
import assert from "node:assert/strict";
import { signLink, verifyLink } from "./link.ts";

const SECRET = "test-secret";

test("a signed key verifies back to its chat", () => {
  assert.equal(verifyLink(signLink(123456789, SECRET), SECRET), 123456789);
});

test("keys that weren't signed with this secret for this chat are refused", () => {
  const key = signLink(123, SECRET);
  const sig = key.split(".")[1];
  assert.equal(verifyLink(key, "other-secret"), null);
  assert.equal(verifyLink(`124.${sig}`, SECRET), null);
  assert.equal(verifyLink(`${key}x`, SECRET), null);
  for (const bad of ["", "123", "123.", `.${sig}`, `${key}.${sig}`, `abc.${sig}`]) assert.equal(verifyLink(bad, SECRET), null, bad);
});
