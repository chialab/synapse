import { DBCollection } from './db.js';
import { FileModel } from '../models/file.js';

export class FilesCollection extends DBCollection {
    static get Model() {
        return FileModel;
    }
}
