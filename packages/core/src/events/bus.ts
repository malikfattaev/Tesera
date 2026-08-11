import type { Context } from "../context/context";

export interface DomainEvent<T = unknown> {
  /** Event name, e.g. "product.created" or a custom "stock.received". */
  type: string;
  /** Entity name when the event originates from a repository. */
  entity?: string;
  /** Event payload. */
  data: T;
  /** When the event was emitted. */
  at: Date;
  /** The context (actor etc.) that produced the event, if any. */
  context?: Context;
}

export type EventHandler<T = unknown> = (
  event: DomainEvent<T>,
) => void | Promise<void>;

export type Unsubscribe = () => void;

/**
 * A small, async, in-process event bus for domain events. Handlers registered
 * for the exact `type` and for the wildcard `"*"` are awaited on `emit`, so a
 * failing handler surfaces to the caller — repositories emit *after* a write
 * has been persisted, so reactions can safely assume the change is durable.
 */
export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  /** Subscribe to a type, or `"*"` for every event. Returns an unsubscribe. */
  on<T = unknown>(type: string, handler: EventHandler<T>): Unsubscribe {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as EventHandler);
    return () => {
      this.handlers.get(type)?.delete(handler as EventHandler);
    };
  }

  /** Subscribe once; auto-unsubscribes after the first matching event. */
  once<T = unknown>(type: string, handler: EventHandler<T>): Unsubscribe {
    const off = this.on<T>(type, async (event) => {
      off();
      await handler(event);
    });
    return off;
  }

  /** Emit an event, awaiting every matching handler (exact type + wildcard). */
  async emit<T>(event: DomainEvent<T>): Promise<void> {
    const targets = [
      ...(this.handlers.get(event.type) ?? []),
      ...(this.handlers.get("*") ?? []),
    ];
    for (const handler of targets) {
      await handler(event);
    }
  }
}
