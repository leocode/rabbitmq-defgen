import { Provider } from './Provider';
import type { Class, NestProvider, NestProviderKey } from '../types';


interface DomainEventPayload {
  type: string;
  version: number;
}

interface DomainEvent {
  type: string;
  exchange: string;
  routingKey: string;
}

export class DomainEventHandler extends Provider {
  public readonly events: DomainEvent[];
  public readonly dispatcherKey: NestProviderKey;

  constructor(provider: NestProvider) {
    super(provider);

    const metadata = Reflect.getMetadata('__domainEventHandler', this.implementation);
    const eventPayloads: DomainEventPayload[] = metadata.events;

    this.events = eventPayloads.map(e => this.mapDomainEventPayload(e));
    this.dispatcherKey = metadata.dispatcher;
  }

  public static isImplementedBy(implementation: Class): boolean {
    return Reflect.hasMetadata('__domainEventHandler', implementation);
  }

  private mapDomainEventPayload(payload: DomainEventPayload): DomainEvent {
    return {
      type: payload.type,
      exchange: payload.type.split('.')[0],
      routingKey: payload.type,
    };
  }
}
