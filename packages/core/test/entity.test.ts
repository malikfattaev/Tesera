import assert from "node:assert/strict";
import { test } from "node:test";
import { defineEntity, t } from "../src/index";

const User = defineEntity({
  name: "user",
  fields: {
    email: t.string().unique(),
    age: t.int().optional(),
    role: t.enum(["admin", "member"]).default("member"),
  },
});

test("fieldsSchema validates and applies defaults", () => {
  const parsed = User.fieldsSchema.parse({ email: "a@b.com" }) as {
    email: string;
    role: string;
  };
  assert.equal(parsed.email, "a@b.com");
  assert.equal(parsed.role, "member");
});

test("fieldsSchema rejects invalid input", () => {
  const result = User.fieldsSchema.safeParse({ email: 123 });
  assert.equal(result.success, false);
});

test("field metadata is preserved", () => {
  assert.equal(User.fields.email.meta.unique, true);
  assert.equal(User.fields.role.meta.kind, "enum");
});

test("relations carry a descriptor", () => {
  const Post = defineEntity({
    name: "post",
    fields: { authorId: t.relation("user") },
  });
  assert.deepEqual(Post.fields.authorId.meta.relation, {
    target: "user",
    cardinality: "one",
  });
});
