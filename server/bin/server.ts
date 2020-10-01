import { WebService, WebServiceOptions, ProcessManager } from '../lib/server';
import pino from 'pino';

//Usually these properties would be inject via some type of DI system, but for such a small project, we will instead defined the dependencies here
const logger = pino({ prettyPrint: true });

const processManager = new ProcessManager({ logger });

const webServiceOptions: WebServiceOptions = {
    port: 9658,
    processManager,
    logger,
    bigMacIndexVersion: '1.0'
}

const service = new WebService(webServiceOptions);

service.initialize()
.then(() => console.log(`Initialized Service`))
.catch(err => {
    console.dir(err)
});


