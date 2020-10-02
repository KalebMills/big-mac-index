"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const MainRoute = (processes, bigMacData, logger) => {
    const router = express_1.Router();
    router.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK' });
    });
    router.get('/country', (req, res, next) => {
        let clientIp = req.ip;
        if (req.ip.substr(0, 7) == "::ffff:") {
            clientIp = req.ip.substr(7);
        }
        //After some testing, I realized that running this on localhost will not work with this route, so use Google's if that is the case
        //If this was a live service, I would otherwise get the incoming IP via req.headers['x-forwarded-for'] or req.connection.remoteAddress, depending if the request is coming through some kind of load balancer;
        if (clientIp.includes('192.168') || clientIp == '::1') {
            clientIp = '8.8.8.8';
        }
        const p = axios_1.default.get(`https://ipvigilante.com/json/${clientIp}`)
            .then(data => {
            res.status(200).json({ data: data.data.data });
        })
            .catch(err => next(err));
        processes.addProcess(p);
    });
    return router;
};
exports.default = MainRoute;
