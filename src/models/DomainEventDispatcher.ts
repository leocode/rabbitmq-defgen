import { range } from 'lodash';
import { Provider } from './Provider';
import type { Class, NestProvider } from '../types';

interface NormalMetadata {
  queue: string;
}

interface HashMetadata {
  queuePrefix: string,
  queueCount: number,
}

export class DomainEventDispatcher extends Provider {
  public readonly queues: string[];

  constructor(provider: NestProvider) {
    super(provider);

    if (DomainEventDispatcher.isNormalDispatcher(this.implementation)) {
      const metadata = Reflect.getMetadata('__domainEventDispatcher', this.implementation) as NormalMetadata;

      this.queues = [metadata.queue];
    } else if (DomainEventDispatcher.isHashDispatcher(this.implementation)) {
      const metadata = Reflect.getMetadata('__domainEventHashDispatcher', this.implementation) as HashMetadata;

      this.queues = range(metadata.queueCount).map((i) => `${metadata.queuePrefix}_${i}`);
    } else {
      throw new Error('Critical exception: unsupported dispatcher type, how did we even got here?');
    }
  }

  public isHashDispatcher(): boolean {
    return DomainEventDispatcher.isHashDispatcher(this.implementation);
  }

  public static isImplementedBy(implementation: Class): boolean {
    return this.isNormalDispatcher(implementation) || this.isHashDispatcher(implementation);
  }

  private static isNormalDispatcher(implementation: Class): boolean {
    return Reflect.hasMetadata('__domainEventDispatcher', implementation);
  }

  private static isHashDispatcher(implementation: Class): boolean {
    return Reflect.hasMetadata('__domainEventHashDispatcher', implementation);
  }
}
