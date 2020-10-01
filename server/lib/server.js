"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessManager = exports.WebService = void 0;
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const util_1 = require("./util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cors_1 = __importDefault(require("cors"));
//Routes
const big_mac_1 = __importDefault(require("./routes/big-mac"));
const main_1 = __importDefault(require("./routes/main"));
const BIG_MAC_DATA_PATH = path.join(__dirname, '..', 'resources', 'big-mac-data.csv');
const BIG_MAC_DATA_KEYS = ['country', 'date', 'localPrice', 'dollarEx', 'dollarPrice', 'dollarPPP', 'dollarValuation'];
class WebService {
    constructor(options) {
        this.port = options.port;
        this.processManager = options.processManager;
        this.logger = options.logger;
        this.app = express_1.default();
        //fs.readFileSync is blocking, but is fine since it only happens on startup
        this.bigMacData = { version: options.bigMacIndexVersion, data: util_1.csvToJSON(fs.readFileSync(BIG_MAC_DATA_PATH).toString(), BIG_MAC_DATA_KEYS) };
        //Graceful Shutdown
        process.once('SIGTERM', () => {
            this.close()
                .catch(err => {
                this.logger.dir(err);
                throw err;
            });
        });
        //Middleware
        this.app.use(cors_1.default());
        this.app.use(bodyParser.json());
        this.app.use('*', (req, res, next) => {
            this.logger.info(`[${new Date().toISOString()}] - (${req.method}):${req.originalUrl}`);
            next();
        });
        //Routes
        this.app.use('/', main_1.default(this.processManager, this.bigMacData, this.logger));
        this.app.use('/big-mac-index', big_mac_1.default(this.processManager, this.bigMacData, this.logger));
        this.app.use((err, req, res, next) => {
            this.logger.info(`An error has occurred in ${this.constructor.name} - Error: ${err}`);
            res.status(err.httpStatusCode || 500).json({ error: { message: err.message } }).end();
        });
    }
    initialize() {
        return this._startServer()
            .then(() => this.logger.info(`${this.constructor.name}#initialize():SUCCESS`));
    }
    _startServer() {
        return new Promise((resolve) => {
            this.httpServer = this.app.listen(this.port, () => {
                this.logger.info(`${this.constructor.name}#_startServer():SUCCESS - Listening on port ${this.port}`);
                resolve();
            });
        });
    }
    _closeServer() {
        return new Promise((resolve, reject) => {
            this.httpServer.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    close() {
        return this._closeServer()
            .then(() => this.processManager.close()) //Make sure all processes complete before closing the Node process
            .then(() => this.logger.info(`${this.constructor.name}#close:SUCCESS`));
    }
}
exports.WebService = WebService;
class ProcessManager {
    constructor(options) {
        this.processes = [];
        this.logger = options.logger;
    }
    addProcess(process) {
        const trackablePromise = util_1.createDeferredPromise(process);
        this.processes.push(trackablePromise);
        //Remove the process from our array after it resolves
        trackablePromise.promise.then(() => {
            this.processes = this.processes.filter(p => p !== trackablePromise);
        })
            .catch(err => {
            this.processes = this.processes.filter(p => p !== trackablePromise);
        });
        this.logger.info(`Added process to ${this.constructor.name}#processes: SUCCESS`);
        return;
    }
    close() {
        return Promise.all(this.processes.map((process) => process.promise))
            .then(() => this.logger.info(`${this.constructor.name}#close:SUCCESS`));
    }
}
exports.ProcessManager = ProcessManager;
