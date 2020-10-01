import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { Closeable } from './interfaces';
import { BaseError } from './exceptions';
import { DeferredPromise, createDeferredPromise, csvToJSON } from './util';
import * as fs from 'fs';
import * as path from 'path';
import cors from 'cors';

//Routes
import BigMacRoute from './routes/big-mac';
import MainRoute from './routes/main';

const BIG_MAC_DATA_PATH = path.join(__dirname, '..', 'resources', 'big-mac-data.csv');
const BIG_MAC_DATA_KEYS = ['country', 'date', 'localPrice', 'dollarEx', 'dollarPrice', 'dollarPPP', 'dollarValuation'];

export interface WebServiceOptions {
    port: number;
    processManager: ProcessManager;
    logger: pino.Logger;
    bigMacIndexVersion: string;
}

export interface BigMacIndex {
    country: string;
    date: string;
    localPrice: string;
    dollarEx: string;
    dollarPrice: string;
    dollarPPP: string;
    dollarValuation: string;
}

export interface BigMacData {
    version: string;
    data: BigMacIndex[];
}


export class WebService {
    private readonly port: number;
    private app: express.Application;
    private httpServer!: http.Server;
    private processManager: ProcessManager;
    private logger: pino.Logger;
    private bigMacData: BigMacData;
    
    constructor(options: WebServiceOptions) {
        this.port = options.port;
        this.processManager = options.processManager;
        this.logger = options.logger;
        this.app = express();
        //fs.readFileSync is blocking, but is fine since it only happens on startup
        this.bigMacData = { version: options.bigMacIndexVersion, data: csvToJSON<BigMacIndex[]>(fs.readFileSync(BIG_MAC_DATA_PATH).toString(), BIG_MAC_DATA_KEYS) }

        //Graceful Shutdown
        process.once('SIGTERM', () => {
            this.close()
            .catch(err => {
                this.logger.dir(err);
                throw err;
            });
        });

        //Middleware
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use('*', (req: Request, res: Response, next: NextFunction) => {
            this.logger.info(`[${new Date().toISOString()}] - (${req.method}):${req.originalUrl}`);
            
            next();
        })

        //Routes
        this.app.use('/', MainRoute(this.processManager, this.bigMacData, this.logger));
        this.app.use('/big-mac-index', BigMacRoute(this.processManager, this.bigMacData, this.logger))


        this.app.use((err: BaseError, req: Request, res: Response, next: NextFunction) => {
            this.logger.info(`An error has occurred in ${this.constructor.name} - Error: ${err}`);
            res.status(err.httpStatusCode || 500).json({ error: { message: err.message } }).end();
        });
    }

    initialize(): Promise<void> {
        return this._startServer()
        .then(() => this.logger.info(`${this.constructor.name}#initialize():SUCCESS`));
    }

    private _startServer(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer = this.app.listen(this.port, () => {
                this.logger.info(`${this.constructor.name}#_startServer():SUCCESS - Listening on port ${this.port}`);
                resolve();
            });
        });
    }

    private _closeServer(): Promise<void> { 
        return new Promise((resolve, reject) => {
            this.httpServer.close((err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }

    close(): Promise<void> {
        return this._closeServer()
        .then(() => this.processManager.close()) //Make sure all processes complete before closing the Node process
        .then(() => this.logger.info(`${this.constructor.name}#close:SUCCESS`));
    }
}


export interface ProcessManagerOptions {
    logger: pino.Logger;
}

export class ProcessManager implements Closeable {
    private processes: DeferredPromise[];
    private logger: pino.Logger;

    constructor(options: ProcessManagerOptions) {
        this.processes = [];
        this.logger = options.logger;
    }

    addProcess(process: Promise<any>): void {
        const trackablePromise = createDeferredPromise(process);
        this.processes.push(trackablePromise);
        
        //Remove the process from our array after it resolves
        trackablePromise.promise.then(() => {
            this.processes = this.processes.filter(p => p !== trackablePromise);
        })
        .catch(err => {
            this.processes = this.processes.filter(p => p !== trackablePromise);
        })

        this.logger.info(`Added process to ${this.constructor.name}#processes: SUCCESS`);

        return;
    }


    close(): Promise<void> {
        return Promise.all(this.processes.map((process: DeferredPromise) => process.promise))
        .then(() => this.logger.info(`${this.constructor.name}#close:SUCCESS`))
    }
}