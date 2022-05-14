import { broadcast, waitForTx } from '@apsiocoin/apsio-transactions';
import { NODE_URL } from './constants';
import { ChildProcessWithoutNullStreams, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import console from './utils/console';
import * as os from "os";


export async function broadcastAndWait(tx: any): Promise<any> {
    try {
        await broadcast(tx, NODE_URL);
        await waitForTx(tx.id, { apiBase: NODE_URL });
    } catch (e) {
        console.error(`Can't send transaction! ${JSON.stringify(tx, null, 4)}` + '\n' + `Error: ${e.message}`);
    }
}

type TFunc = (...args: Array<any>) => void;
export const run = (command: string, args: Array<string>, options?: { log?: TFunc, error?: TFunc }): ChildProcessWithoutNullStreams => {
    console.log(`${command} ${args.join(' ')}`);

    const log = options && options.log || console.log;
    const error = options && options.error || console.error;
    const process = spawn(command, args);

    process.stdout.on('data', data => {
        log(String(data));
    });

    process.stderr.on('data', data => {
        error(data);
    });

    process.on('close', (code) => {
        console.info(`Child process "${command} ${args.join(' ')}" exited with code ${code}`);
    });

    return process;
};

export const exec = (command: string, args: Array<string>, options?: SpawnOptionsWithoutStdio): Promise<string> => {
    console.log(`Exec "${command} ${args.join(' ')}"`);

    let data = '';

    const process = spawn(command, args, options);

    process.stdout.on('data', chunk => {
        data += chunk;
    });

    process.stderr.on('data', chunk => {
        data += chunk;
    });

    return new Promise((resolve, reject) => {
        process.on('close', code => {
            if (code === 0) {
                resolve(data);
            } else {
                console.error(data);
                reject(`Child process "${command} ${args.join(' ')}" exited with code ${code}`);
            }
        });
    });
};
