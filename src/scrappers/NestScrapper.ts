import { uniqWith } from 'lodash';
import { DomainEventDispatcher } from '../models/DomainEventDispatcher';
import { DomainEventHandler } from '../models/DomainEventHandler';
import type { NestModule, NestProvider } from '../types';
import { getNestProviderClass } from '../types';
import { isClass } from '../types';

const getModules = (m: NestModule): NestModule[] => {
  if (isClass(m)) {
    return Reflect.getMetadata('imports', m) ?? [];
  } else {
    return m.imports ?? [];
  }
};

const getProviders = (m: NestModule): NestProvider[] => {
  if (isClass(m)) {
    return Reflect.getMetadata('providers', m) ?? [];
  } else {
    return m.providers ?? [];
  }
};

const traverseModules = (m: NestModule): NestModule[] => {
  return [
    m,
    ...getModules(m).flatMap(traverseModules),
  ];
};

const uniqModules = (modules: NestModule[]): NestModule[] => uniqWith(modules, (m1, m2) => {
  const normalizedM1 = isClass(m1) ? m1 : m1.module;
  const normalizedM2 = isClass(m2) ? m2 : m2.module;

  return normalizedM1 === normalizedM2;
});

const getAllModuleProviders = (m: NestModule) => uniqModules(traverseModules(m)).flatMap(getProviders);

export const NestScrapper = (m: NestModule) => {
  const nestProviders = getAllModuleProviders(m);

  const dispatchers = nestProviders
    .filter(p => DomainEventDispatcher.isImplementedBy(getNestProviderClass(p)))
    .map(p => new DomainEventDispatcher(p));

  const handlers = nestProviders
    .filter(p => DomainEventHandler.isImplementedBy(getNestProviderClass(p)))
    .map(p => new DomainEventHandler(p));

  return {
    dispatchers,
    handlers,
  };
};

