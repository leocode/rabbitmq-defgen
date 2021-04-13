import { Provider } from './Provider';
import type { Class, NestProvider } from '../types';

type EventMap = Record<string, { getRoutingKey: (e: any) => string; exchange: string }>;

export class DomainEventPublisher extends Provider {
  private readonly eventMap: EventMap;

  constructor(provider: NestProvider) {
    super(provider);

    const metadata = Reflect.getMetadata('__domainEventPublisher', this.implementation);
    const eventMap: EventMap = metadata.mapping;

    this.eventMap = eventMap;
  }

  public getMappedEvents(): string[] {
    return Object.keys(this.eventMap);
  }

  public getMappedExchanges(): string[] {
    return Object.values(this.eventMap).map(m => m.exchange);
  }

  public static isImplementedBy(implementation: Class): boolean {
    return Reflect.hasMetadata('__domainEventPublisher', implementation);
  }
}
