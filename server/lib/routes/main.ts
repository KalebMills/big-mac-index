import { Request, Response, Router, NextFunction } from 'express';
import { BigMacData, BigMacIndex, ProcessManager } from '../server';
import axios from 'axios';
import pino from 'pino';
import { BaseError } from '../exceptions';

const MainRoute = (processes: ProcessManager, bigMacData: BigMacData, logger: pino.Logger) => {
    const router = Router();

    router.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'OK' });
    });

    router.get('/country', (req: Request, res: Response, next: NextFunction) => {
        let clientIp = req.ip
        if (req.ip.substr(0, 7) == "::ffff:") {
            clientIp = req.ip.substr(7)
        }

        console.log(`Request string: ${`https://ipvigilante.com/json/${clientIp}`}`)

        next(new BaseError({ httpStatusCode: 500, message: 'An internal error occurred' }));

        return;

        axios.get(`https://ipvigilante.com/json/${clientIp}`)
        .then(data => {
            res.status(200).json({ data: data.data.data });
        })
        .catch(err => {
            logger.error(err)
            console.log(JSON.stringify(err));
            res.status(500).json({ error: { message: 'Internal Error' } });
        });
    });

    return router;
    
}

export default MainRoute;