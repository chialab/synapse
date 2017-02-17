import { Factory } from './factory.js';

export class Plugin extends Factory {
    static supported() {
        return Promise.resolve();
    }

    static get dependencies() {
        return [];
    }
}
