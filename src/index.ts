import 'reflect-metadata';
import { uniq, uniqWith } from 'lodash';

process.env.UPLOAD_PATH = '/tmp/upload';
const { AppModule } = require(process.argv[2]) as { AppModule: Module };

type Class = Function;
type ProviderKey = string | Symbol | Class;
type Provider = {
  provide: ProviderKey;
  useClass?: Class; // @TODO extend this interface for other possibilities
} | Class;
type Module = Class | {
  module: Class;
  imports: Module[];
  providers: Provider[];
  controllers: Class[];
  exports: Provider[];
}
interface DomainEvent {
  type: string;
  version: number;
}

const isClass = (v: any): v is Class => typeof v === 'function';
const isSymbol = (v: any): v is Symbol => typeof v === 'symbol';

const getModules = (module: Module): Module[] => {
  if (isClass(module)) {
    return Reflect.getMetadata('imports', module) ?? [];
  } else {
    return module.imports ?? [];
  }
}

const getProviders = (module: Module): Provider[] => {
  if (isClass(module)) {
    return Reflect.getMetadata('providers', module) ?? [];
  } else {
    return module.providers ?? [];
  }
}

const traverseModules = (module: Module): Module[] => {
  return [
    module,
    ...getModules(module).flatMap(traverseModules),
  ];
}

const uniqModules = (modules: Module[]): Module[] => uniqWith(modules, (m1, m2) => {
  const normalizedM1 = isClass(m1) ? m1 : m1.module;
  const normalizedM2 = isClass(m2) ? m2 : m2.module;

  return normalizedM1 === normalizedM2;
});

const isDomainEventHandler = (provider: Provider) => {
  if (isClass(provider)) {
    return Reflect.hasMetadata('__domainEventHandler', provider);
  } else if (provider.useClass) {
    return Reflect.hasMetadata('__domainEventHandler', provider.useClass);
  }
}

const isDomainEventDispatcher = (provider: Provider) => {
  if (isClass(provider)) {
    return Reflect.hasMetadata('__domainEventDispatcher', provider);
  } else if (provider.useClass) {
    return Reflect.hasMetadata('__domainEventDispatcher', provider.useClass);
  }
}

const getProviderClass = (provider: Provider): Class => {
  return isClass(provider) ? provider : provider.useClass!; // @TODO support other types
}

const getDomainEventHandlerEvents = (domainEventHandler: Provider): DomainEvent[] => {
  return Reflect.getMetadata('__domainEventHandler', getProviderClass(domainEventHandler)).events;
}

const getDomainEventHandlerDispatcher = (domainEventHandler: Provider): ProviderKey => {
  return Reflect.getMetadata('__domainEventHandler', getProviderClass(domainEventHandler)).dispatcher;
}

const getDomainEventDispatcherQueue = (domainEventDispatcher: Provider): string => {
  return Reflect.getMetadata('__domainEventDispatcher', getProviderClass(domainEventDispatcher)).queue;
}

const getDomainEventExchange = (event: DomainEvent): string => {
  return event.type.split('.')[0];
}

const getDomainEventRoutingKey = (event: DomainEvent): string => {
  return event.type;
}

const providersToMap = (providers: Provider[]): Map<ProviderKey, Class> => {
  return new Map(providers.map(p => ([
    isClass(p) ? p : p.provide,
    isClass(p) ? p : p.useClass!, // @TODO support other types
  ])));
}

const providers = uniqModules(traverseModules(AppModule)).flatMap(getProviders);
const providersMap = providersToMap(providers);
const domainHandlers = providers.filter(isDomainEventHandler);
const domainDispatchers = providers.filter(isDomainEventDispatcher);

const queues = domainDispatchers.map(getDomainEventDispatcherQueue);

const exchanges = uniq(
  domainHandlers.flatMap(getDomainEventHandlerEvents).map(getDomainEventExchange)
).flatMap(exchange => [`private_${exchange}_general`, `public_${exchange}_general`]);

const routings = domainHandlers.flatMap(handler => {
  const events = getDomainEventHandlerEvents(handler);
  const dispatcherKey = getDomainEventHandlerDispatcher(handler);
  const dispatcher = providersMap.get(dispatcherKey);

  if (!dispatcher) {
    throw new Error('Some of event handlers requires not provided dispatcher!');
  }

  if (dispatcher.name === 'RabbitMQDomainEventHashDispatcher') {
    // @TODO add support for hash dispatcher
    return [];
  }

  return events.map(e => ({
    source: `private_${getDomainEventExchange(e)}_general`, // @TODO add support for public ??
    destination: getDomainEventDispatcherQueue(dispatcher),
    routingKey: getDomainEventRoutingKey(e),
  }));
});

console.log(queues);

console.log(exchanges);

console.log(routings);