import 'reflect-metadata';
import { uniqWith } from 'lodash';

process.env.UPLOAD_PATH = '/tmp/upload';
const { AppModule } = require(process.argv[2]) as { AppModule: Module };

type Klass = Function;
type Provider = {
  provide: string | Symbol;
  useClass: Klass; // @TODO extend this interface for other possibilities
} | Klass;
type Module = Klass | {
  module: Klass;
  imports: Module[];
  providers: Provider[];
  controllers: Klass[];
  exports: Provider[];
}
type DomainEventHandler = {};
interface DomainEvent {
  type: string;
  version: number;
}

const isClass = (v: any): v is Klass => typeof v === 'function';
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
  } else {
    // @TODO or not? maybe decorator can be added only to something, that is directly provided by class
  }
}

const getDomainEventHandlerEvents = (domainEventHandler: DomainEventHandler): DomainEvent[] => {
  return Reflect.getMetadata('__domainEventHandler', domainEventHandler).events;
}

const getDomainEventHandlerDispatcher = (domainEventHandler: DomainEventHandler): string => {
  return Reflect.getMetadata('__domainEventHandler', domainEventHandler).dispatcher;
}

const providers = uniqModules(traverseModules(AppModule)).flatMap(getProviders);
const domainHandlers = providers.filter(isDomainEventHandler);

// Get sample events of sample domain handler
console.log(getDomainEventHandlerEvents(domainHandlers[0]))

// Get sample dispatcher name of sample domain handler
console.log(getDomainEventHandlerDispatcher(domainHandlers[0]))

// Retrieve dispatcher provider (with dispatcher name and queue name)
const dispatcherProvider = providers.filter(p => !isClass(p) && p.provide.toString() === 'Symbol(tenant-gmail-messages-to-process_dispatcher)')[0];

console.log(dispatcherProvider)