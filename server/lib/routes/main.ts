import { Request, Response, Router, NextFunction, request } from 'express';
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
        let clientIp = req.ip;

        if (req.ip.substr(0, 7) == "::ffff:") {
            clientIp = req.ip.substr(7)
        }

        //After some testing, I realized that running this on localhost will not work with this route, so use Google's if that is the case
        //If this was a live service, I would otherwise get the incoming IP via req.headers['x-forwarded-for'] or req.connection.remoteAddress, depending if the request is coming through some kind of load balancer;

        if (clientIp.includes('192.168') || clientIp == '::1') {
            clientIp = '8.8.8.8';
        }

        axios.get(`https://ipvigilante.com/json/${clientIp}`)
        .then(data => {
            res.status(200).json({ data: data.data.data });
        })
        .catch(err => next(err));
    });

    return router;
    
}

export default MainRoute;