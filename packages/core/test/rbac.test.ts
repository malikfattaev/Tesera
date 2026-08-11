import assert from "node:assert/strict";
import { test } from "node:test";
import { ForbiddenError, Rbac } from "../src/index";

function makeRbac() {
  return new Rbac()
    .define({ name: "admin", permissions: [{ resource: "*", action: "*" }] })
    .define({ name: "viewer", permissions: [{ resource: "product", action: "read" }] });
}

test("a wildcard role can do anything", () => {
  const rbac = makeRbac();
  assert.equal(rbac.can({ id: "1", roles: ["admin"] }, "delete", "invoice"), true);
});

test("a scoped role is limited to its permissions", () => {
  const rbac = makeRbac();
  const viewer = { id: "2", roles: ["viewer"] };
  assert.equal(rbac.can(viewer, "read", "product"), true);
  assert.equal(rbac.can(viewer, "create", "product"), false);
  assert.equal(rbac.can(viewer, "read", "invoice"), false);
});

test("no actor is denied", () => {
  assert.equal(makeRbac().can(undefined, "read", "product"), false);
});

test("assert throws ForbiddenError when denied", () => {
  const rbac = makeRbac();
  assert.throws(
    () => rbac.assert({ actor: { id: "2", roles: ["viewer"] } }, "create", "product"),
    ForbiddenError,
  );
});
