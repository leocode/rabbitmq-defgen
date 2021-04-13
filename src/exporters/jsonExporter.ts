import type { RabbitDataGenerator } from '../generators/RabbitDataGenerator';

interface Config {
  vhost: string;
  user: {
    name: string;
    password: string;
  };
  globalParameters: { name: string, value: string }[];
}

export const jsonExporter = (generator: RabbitDataGenerator, config: Config): string => {
  const exchanges = generator.getExchanges();
  const queues = generator.getQueues();
  const routings = generator.getRoutings();
  const password = generator.hashPassword(config.user.password);

  return JSON.stringify({
    users: [{
      name: config.user.name,
      password_hash: password.result,
      hashing_algorithm: password.hashingAlgorithm,
      tags: 'administrator',
    }],
    vhosts: [{
      name: config.vhost,
    }],
    permissions: [{
      user: config.user.name,
      vhost: config.vhost,
      configure: '.*',
      write: '.*',
      read: '.*',
    }],
    global_parameters: config.globalParameters,
    queues: queues.map(queue => ({
      vhost: config.vhost,
      name: queue.name,
      durable: queue.durable,
      auto_delete: queue.autoDelete,
      arguments: queue.arguments,
    })),
    exchanges: exchanges.map(exchange => ({
      vhost: config.vhost,
      name: exchange.name,
      type: exchange.type,
      durable: exchange.durable,
      auto_delete: exchange.autoDelete,
      internal: exchange.internal,
      arguments: exchange.arguments,
    })),
    bindings: routings.map(routing => ({
      vhost: config.vhost,
      source: routing.source,
      destination: routing.destination,
      destination_type: routing.destinationType,
      routing_key: routing.routingKey,
      arguments: routing.arguments,
    })),
  });
};