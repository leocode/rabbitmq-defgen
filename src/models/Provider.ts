import type { Class, NestProvider, NestProviderKey } from '../types';
import { isClass } from '../types';

export abstract class Provider {
  public readonly key: NestProviderKey;
  protected readonly implementation: Class;

  constructor(provider: NestProvider) {
    if (isClass(provider)) {
      this.key = provider;
      this.implementation = provider;
    } else {
      this.key = provider.provide;
      this.implementation = provider.useClass!; /** @TODO add support for other */
    }
  }

  public getImplementationName() {
    return this.implementation.name;
  }
}


