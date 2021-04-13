import 'reflect-metadata';
import { definitionsJsonExporter } from './exporters/definitionsJsonExporter';
import { RabbitDataGenerator } from './generators/RabbitDataGenerator';
import { NestScrapper } from './scrappers/NestScrapper';
import type { NestModule } from './types';

process.env.UPLOAD_PATH = '/tmp/upload';
const { AppModule } = require(process.argv[2]) as { AppModule: NestModule };

const { dispatchers, handlers, publishers } = NestScrapper(AppModule);
const generator = new RabbitDataGenerator({ dispatchers, handlers, publishers });

const output = definitionsJsonExporter(generator, {
  globalParameters: [],
  user: {
    name: 'rabbitmq',
    password: 'rabbitmq',
  },
  vhost: 'dev',
});

process.stdout.write(output);