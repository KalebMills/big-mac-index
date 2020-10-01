"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const exceptions_1 = require("../exceptions");
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
        console.log(`Request string: ${`https://ipvigilante.com/json/${clientIp}`}`);
        next(new exceptions_1.BaseError({ httpStatusCode: 500, message: 'An internal error occurred' }));
        return;
        axios_1.default.get(`https://ipvigilante.com/json/${clientIp}`)
            .then(data => {
            res.status(200).json({ data: data.data.data });
        })
            .catch(err => {
            logger.error(err);
            console.log(JSON.stringify(err));
            res.status(500).json({ error: { message: 'Internal Error' } });
        });
    });
    return router;
};
exports.default = MainRoute;
