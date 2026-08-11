import assert from "node:assert/strict";
import { test } from "node:test";
import {
  type DomainEvent,
  EventBus,
  InMemoryAdapter,
  Repository,
  ValidationError,
  defineEntity,
  t,
} from "../src/index";

const Task = defineEntity({
  name: "task",
  fields: {
    title: t.string(),
    done: t.boolean().default(false),
  },
});

function makeRepo() {
  const events = new EventBus();
  const seen: DomainEvent[] = [];
  events.on("*", (event) => {
    seen.push(event);
  });
  return { repo: new Repository(Task, new InMemoryAdapter(), events), seen };
}

test("create persists, adds system fields and emits an event", async () => {
  const { repo, seen } = makeRepo();
  const task = await repo.create({ title: "ship tesera" });
  assert.ok(task.id);
  assert.equal(task.title, "ship tesera");
  assert.equal(task.done, false);
  assert.ok(task.createdAt instanceof Date);
  assert.equal(seen.at(0)?.type, "task.created");
});

test("create rejects invalid input with ValidationError", async () => {
  const { repo } = makeRepo();
  await assert.rejects(
    () => repo.create({ title: 123 as unknown as string }),
    ValidationError,
  );
});

test("update patches fields; get throws for a missing id", async () => {
  const { repo } = makeRepo();
  const task = await repo.create({ title: "a" });
  const updated = await repo.update(task.id, { done: true });
  assert.equal(updated.done, true);
  await assert.rejects(() => repo.get("does-not-exist"));
});

test("list filters by equality", async () => {
  const { repo } = makeRepo();
  await repo.create({ title: "a", done: true });
  await repo.create({ title: "b", done: false });
  const done = await repo.list({ where: { done: true } });
  assert.equal(done.length, 1);
  assert.equal(done[0]?.title, "a");
});

test("delete removes the record and emits an event", async () => {
  const { repo, seen } = makeRepo();
  const task = await repo.create({ title: "temp" });
  await repo.delete(task.id);
  assert.equal(await repo.findById(task.id), null);
  assert.ok(seen.some((event) => event.type === "task.deleted"));
});
