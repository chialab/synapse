import { DBModel } from './db.js';

export class FileModel extends DBModel {
    static get schema() {
        return {
            type: 'object',
            properties: {
                filename: { type: 'string' },
                type: { type: 'string' },
                data: { type: 'string' },
            },
        };
    }

    static get key() {
        return 'filename';
    }

    setFromResponse(data = {}) {
        if (data && data.filename && data._attachments && data._attachments[data.filename]) {
            let attach = data._attachments[data.filename];
            this.set({
                data: `data:${attach.content_type};base64,${attach.data}`,
                type: attach.content_type,
            });
            delete data._attachments;
        }
        return super.setFromResponse(data);
    }

    toDBData() {
        let data = super.toDBData();
        if (data.data) {
            data._attachments = {
                [data.filename]: {
                    content_type: data.type,
                    data: data.data.split(',')[1],
                },
            };
            delete data.data;
            delete data.type;
        }
        return data;
    }
}
