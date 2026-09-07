type EventListener = (data: unknown) => void;

class RealTimeBus {
  private subscribers: Map<string, Set<EventListener>> = new Map();

  subscribe(channel: string, listener: EventListener): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(listener);

    return () => {
      const set = this.subscribers.get(channel);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  broadcast(channel: string, data: unknown): void {
    const set = this.subscribers.get(channel);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error("RealTimeBus listener error:", err);
        }
      });
    }
  }
}

const globalBus = globalThis as unknown as { realTimeBus?: RealTimeBus };
export const realTimeBus = globalBus.realTimeBus || new RealTimeBus();
if (process.env.NODE_ENV !== "production") globalBus.realTimeBus = realTimeBus;

export function notifyUser(userId: string, event: { type: string; payload: unknown }): void {
  realTimeBus.broadcast(`user:${userId}`, event);
}

export function notifyConversation(conversationId: string, event: { type: string; payload: unknown }): void {
  realTimeBus.broadcast(`conversation:${conversationId}`, event);
}
