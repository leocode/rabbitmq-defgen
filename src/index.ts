import 'reflect-metadata';
import { RabbitDataGenerator } from './generators/RabbitDataGenerator';
import { NestScrapper } from './scrappers/NestScrapper';
import type { NestModule } from './types';

process.env.UPLOAD_PATH = '/tmp/upload';
const { AppModule } = require(process.argv[2]) as { AppModule: NestModule };

const { dispatchers, handlers } = NestScrapper(AppModule);

const generator = new RabbitDataGenerator({ dispatchers, handlers });

console.log(generator.getExchanges());
console.log(generator.getQueues());
console.log(generator.getRoutings());