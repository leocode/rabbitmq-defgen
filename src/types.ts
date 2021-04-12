export type Class = Function;
export type NestProviderKey = string | Symbol | Class;
export type NestProvider = {
  provide: NestProviderKey;
  useClass?: Class; // @TODO extend this interface for other possibilities
} | Class;
export type NestModule = Class | {
  module: Class;
  imports: NestModule[];
  providers: NestProvider[];
  controllers: Class[];
  exports: NestProvider[];
}

export const isClass = (v: any): v is Class => typeof v === 'function';
export const getNestProviderClass = (p: NestProvider) => {
  const klass = isClass(p) ? p : p.useClass!;

  return klass ?? (() => {}); // if useClass does not exist, for now return mock
}
