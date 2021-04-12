import { uniq } from 'lodash';
import type { DomainEventDispatcher } from '../models/DomainEventDispatcher';
import type { DomainEventHandler } from '../models/DomainEventHandler';
import { createHash, randomBytes } from 'crypto';

interface Ctor {
  dispatchers: DomainEventDispatcher[];
  handlers: DomainEventHandler[];
}

interface Queue {
  name: string;
  durable: boolean;
  autoDelete: boolean;
  arguments: Record<string, any>;
}

interface Exchange {
  name: string;
  type: string;
  durable: boolean;
  autoDelete: boolean;
  internal: boolean;
  arguments: Record<string, any>;
}

export interface Routing {
  source: string;
  destination: string;
  destinationType: string;
  routingKey: string;
  arguments: Record<string, any>;
}

export class RabbitDataGenerator {
  private dispatchers: DomainEventDispatcher[];
  private handlers: DomainEventHandler[];

  constructor(ctor: Ctor) {
    this.dispatchers = ctor.dispatchers;
    this.handlers = ctor.handlers;
  }

  public getExchanges(): Exchange[] {
    const eventExchanges = uniq(this.handlers.flatMap(h => h.events).map(e => e.exchange));
    const toExchangeNames = (exchange: string) => [
      `private_${exchange}_general`,
      `public_${exchange}_general`,
    ];

    const directExchanges = eventExchanges.flatMap(toExchangeNames).map(exchangeName => ({
      name: exchangeName,
      type: 'direct',
      durable: true,
      autoDelete: false,
      internal: false,
      arguments: {},
    }) as Exchange);

    const hashExchanges: Exchange[] = [];

    return [
      ...directExchanges,
      ...hashExchanges,
    ];
  }

  public getQueues(): Queue[] {
    return this.dispatchers.flatMap(d => d.queues).map(queueName => ({
      name: queueName,
      durable: true,
      autoDelete: false,
      arguments: {
        'x-queue-type': 'classic',
        'x-single-active-consumer': true, // @TODO Add support for SAC: false
      },
    }) as Queue);
  }

  public getRoutings(): Routing[] {
    return this.handlers.flatMap(handler => {
      const dispatcher = this.getHandlerDispatcher(handler);

      return handler.events.flatMap(e => dispatcher.queues.map(queue => ({
        source: `private_${e.exchange}_general`, // @TODO add support for public ??
        destination: queue,
        destinationType: 'queue',
        arguments: {},
        routingKey: dispatcher.isHashDispatcher() ? '1' : e.routingKey,
      }) as Routing));
    });
  }

  /**
   * https://www.rabbitmq.com/passwords.html#computing-password-hash
   */
  public hashPassword(originalPassword: string, alg: 'sha256' | 'sha512' = 'sha256'): { result: string, hashingAlgorithm: string } {
    // although this is random, so each time hashed password will be different, it is attached to output, so should does not matter
    const salt = randomBytes(4);
    const password = Buffer.from(originalPassword, 'utf-8');
    const passwordWithSalt = Buffer.concat([salt, password]);
    const hash = createHash(alg).update(passwordWithSalt).digest();
    const saltWithHash = Buffer.concat([salt, hash]);
    const result = saltWithHash.toString('base64');

    return {
      result,
      hashingAlgorithm: `rabbit_password_hashing_${alg}`,
    };
  }

  private getHandlerDispatcher(handler: DomainEventHandler): DomainEventDispatcher {
    const dispatcher = this.dispatchers.find(d => d.key === handler.dispatcherKey);

    if (!dispatcher) {
      throw new Error(`Handler ${handler.getImplementationName()} requires not provided dispatcher (${handler.dispatcherKey.toString()})!`);
    }

    return dispatcher;
  }
}