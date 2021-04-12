import { uniq } from 'lodash';
import type { DomainEventDispatcher } from '../models/DomainEventDispatcher';
import type { DomainEventHandler } from '../models/DomainEventHandler';

interface Ctor {
  dispatchers: DomainEventDispatcher[];
  handlers: DomainEventHandler[];
}

export interface Routing {
  source: string, // @TODO add support for public ??
  destination: string,
  routingKey: string,
}

export class RabbitDataGenerator {
  private dispatchers: DomainEventDispatcher[];
  private handlers: DomainEventHandler[];

  constructor(ctor: Ctor) {
    this.dispatchers = ctor.dispatchers;
    this.handlers = ctor.handlers;
  }

  public getExchanges(): string[] {
    const eventExchanges = uniq(this.handlers.flatMap(h => h.events).map(e => e.exchange));
    const toExchangeNames = (exchange: string) => [
      `private_${exchange}_general`,
      `public_${exchange}_general`,
    ];

    return eventExchanges.flatMap(toExchangeNames);
  }

  public getQueues(): string[] {
    return this.dispatchers.flatMap(d => d.queues);
  }

  public getRoutings(): Routing[] {
    return this.handlers.flatMap(handler => {
      const dispatcher = this.dispatchers.find(d => d.key === handler.dispatcherKey);

      if (!dispatcher) {
        throw new Error(`Handler ${handler.getImplementationName()} requires not provided dispatcher (${handler.dispatcherKey.toString()})!`);
      }

      return handler.events.flatMap(e => dispatcher.queues.map(queue => ({
        source: `private_${e.exchange}_general`, // @TODO add support for public ??
        destination: queue,
        routingKey: dispatcher.isHashDispatcher() ? '1' : e.routingKey,
      })));
    });
  }
}