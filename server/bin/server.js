"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../lib/server");
const pino_1 = __importDefault(require("pino"));
//Usually these properties would be inject via some type of DI system, but for such a small project, we will instead define the dependencies here
const logger = pino_1.default({ prettyPrint: true });
const processManager = new server_1.ProcessManager({ logger });
const webServiceOptions = {
    port: 9658,
    processManager,
    logger,
    bigMacIndexVersion: '1.0'
};
const service = new server_1.WebService(webServiceOptions);
service.initialize()
    .then(() => console.log(`Initialized Service`))
    .catch(err => {
    console.dir(err);
});
