import { Request, Response, NextFunction, Router } from 'express';
import { BigMacData, ProcessManager } from '../server';
import pino from 'pino';

const BigMac = (process: ProcessManager, bigMacData: BigMacData, logger: pino.Logger) => {
    const router = Router();

    router.get('/version', (req: Request, res: Response, next: NextFunction) => {
        res.status(200).json({ data: bigMacData.version });
    });
    
    router.get('/', (req: Request, res: Response) => {
        res.status(200).json(bigMacData);
    });

    return router;
}

export default BigMac;