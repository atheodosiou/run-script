import Datastore from 'nedb';

export const createDb = (): Promise<{ error: Error, db: Datastore }> => {
    return new Promise<{ error: Error, db: Datastore }>((resolve, reject) => {
        const db = new Datastore({
            filename: '../../data/commands.db',
            autoload: true,
            onload: (error) => {
                if (error) {
                    resolve({ error: error, db: null });
                } else {
                    resolve({ error: null, db: db });
                }
            }
        });
    });
};

export const clearAll = (db: Datastore<any>): Promise<{ error: string, deleted: number }> => {
    return new Promise<{ error: string, deleted: number }>((resolve, reject) => {
        db.remove({}, { multi: true }, (err, n) => {
            if (err) {
                resolve({ error: err.message, deleted: 0 });
            }
            resolve({ error: null, deleted: n });
        });
    });
};