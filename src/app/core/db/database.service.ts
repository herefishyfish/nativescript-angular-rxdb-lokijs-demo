import { Injectable } from '@angular/core';
import { LokiNativescriptAdapter } from '@herefishyfish/nativescript-lokijs-adapter';
import { v4 } from '@herefishyfish/nativescript-rxdb';
import { Dialogs } from '@nativescript/core';
import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageLoki } from 'rxdb/plugins/lokijs';
import { pullQueryBuilder, pullStreamQueryBuilder, pushQueryBuilder } from './query-builder';
import { RxDBReplicationHasuraGraphQLPlugin } from './replicator';
import { HERO_SCHEMA } from './schema';

const batchSize = 100;

async function loadRxDBPlugins(): Promise<void> {
    addRxPlugin(RxDBReplicationHasuraGraphQLPlugin)
}

async function _create(): Promise<any> {
    await loadRxDBPlugins();

    console.log('Creating Database.');
    const database = await createRxDatabase({
        name: 'herodb',
        storage: getRxStorageLoki({
            env: 'NATIVESCRIPT',
            adapter: new LokiNativescriptAdapter(),
        }),
        multiInstance: false,
        ignoreDuplicate: true,
    });

    console.log('Creating Collections');
    await database.addCollections({
        heroes: {
            schema: HERO_SCHEMA,
            statics: {
                async addHero(name, color) {
                    return this.upsert({
                        uuid: v4(),
                        name,
                        color,
                    });
                },
            },
        },
    });

    console.log('Creating Replication');
    const replicationState = await database.heroes.syncGraphQL({
        url: {
            http: 'https://working-oriole-73.hasura.app/v1/graphql',
            ws: 'wss://working-oriole-73.hasura.app/v1/graphql',
        },
        headers: {
            'x-hasura-admin-secret': '2zWIdFAkt9O9OGnxqXTkPw14xkQC0jVCSWKRf9hB7OAkrlzz1l8idW9w7SfUPkZE',
        },
        push: {
            batchSize,
            queryBuilder: pushQueryBuilder,
        },
        pull: {
            batchSize,
            queryBuilder: pullQueryBuilder,
            streamQueryBuilder: pullStreamQueryBuilder,
        },
        live: true,
        autoStart: true,
        deletedField: 'deleted',
    });

    replicationState.error$.subscribe(err => {
        console.error('replication error:');
        console.dir(err);
    });

    return database;
}

let initState: null | Promise<any> = null;
let DB_INSTANCE: RxDatabase;
/**
 * This is run via APP_INITIALIZER in app.module.ts
 * to ensure the database exists before the angular-app starts up
 */
export async function initDatabase() {
    if (!initState) {
        console.log("initDatabase()");
        initState = _create().then((db) => (DB_INSTANCE = db));
    }
    await initState;
}

@Injectable()
export class DatabaseService {
    get database(): RxDatabase {
        return DB_INSTANCE;
    }

    addHero() {
        Dialogs.prompt('Enter hero name', '').then((response) => {
            if (response.result) {
                this.database.heroes.insert({
                    id: v4(),
                    name: response.text,
                    color: '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
        });
    }
}
