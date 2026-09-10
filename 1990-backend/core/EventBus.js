/**
 * EventBus — Application-wide singleton event emitter.
 *
 * Services emit domain events (e.g. "order.created").
 * Listeners in the listeners/ folder handle side effects
 * (inventory, shifts, audit, notifications) in isolation.
 *
 * Usage:
 *   import { eventBus } from "../core/EventBus.js";
 *
 *   // In a service:
 *   eventBus.emit("order.created", { order, actor });
 *
 *   // In a listener:
 *   eventBus.on("order.created", async ({ order, actor }) => { ... });
 */

import { EventEmitter } from "node:events";

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Allow many listeners per event (modules each register their own).
    this.setMaxListeners(50);
  }

  /**
   * Emit a domain event.
   * Overrides EventEmitter.emit to add error safety — a failing
   * listener must never crash the emitting service.
   *
   * @param {string} event  Dot-separated event name (e.g. "order.created").
   * @param  {...unknown} args  Event payload.
   * @returns {boolean}
   */
  emit(event, ...args) {
    try {
      return super.emit(event, ...args);
    } catch (error) {
      console.error(`[EventBus] Unhandled error in listener for "${event}":`, error);
      return false;
    }
  }

  /**
   * Register a listener that catches its own errors.
   * This is the preferred way to register async listeners.
   *
   * @param {string} event
   * @param {Function} handler  Async or sync handler function.
   * @returns {this}
   */
  onSafe(event, handler) {
    return this.on(event, async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`[EventBus] Listener error for "${event}":`, error);
      }
    });
  }
}

/** Singleton instance — the entire application shares this. */
export const eventBus = new EventBus();
