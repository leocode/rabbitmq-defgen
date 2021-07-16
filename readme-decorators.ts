import { Type as NestType } from '@nestjs/common';

export const DOMAIN_EVENT_HANDLER_METADATA = '__domainEventHandler';
export const DOMAIN_EVENT_DISPATCHER_METADATA = '__domainEventDispatcher';
export const DOMAIN_EVENT_HASH_DISPATCHER_METADATA = '__domainEventHashDispatcher';
export const DOMAIN_EVENT_PUBLISHER_METADATA = '__domainEventPublisher';

/**
 * RabbitMQ dispatcher with queue name
 */
export interface DomainEventDispatcherMetadata {
  queue: string;
}

/**
 * Hash-type (RabbitMQ plugin) dispatcher type with dynamically build queue names
 */
export interface DomainEventHashDispatcherMetadata {
  queuePrefix: string;
  queueCount: number;
}

/**
 * Specific routing between events and exchanges, that is required for events
 * going through hash dispatcher.
 */
export interface DomainEventPublisherMetadata {
  mapping: Record<string, { exchange: string }>; // relation between event.type (name) and exchange name
}

/**
 * Events 
 */
export interface DomainEventHandlerMetadata {
  events: {
    type: string; // event "name"
    version: number;
  }[];
  dispatcher: string | symbol | NestType<any>;
}

export const DomainEventDispatcher = (metadata: DomainEventDispatcherMetadata): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(DOMAIN_EVENT_DISPATCHER_METADATA, metadata, target);
  };
};

export const DomainEventHashDispatcher = (metadata: DomainEventHashDispatcherMetadata): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(DOMAIN_EVENT_HASH_DISPATCHER_METADATA, metadata, target);
  };
};

export const DomainEventPublisher = (metadata: DomainEventPublisherMetadata): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(DOMAIN_EVENT_PUBLISHER_METADATA, metadata, target);
  };
};

export const DomainEventHandler = (metadata: DomainEventHandlerMetadata): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(DOMAIN_EVENT_HANDLER_METADATA, metadata, target);
  };
};