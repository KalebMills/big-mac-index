"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BigMac = (process, bigMacData, logger) => {
    const router = express_1.Router();
    router.get('/version', (req, res, next) => {
        res.status(200).json({ data: bigMacData.version });
    });
    router.get('/', (req, res) => {
        res.status(200).json(bigMacData);
    });
    return router;
};
exports.default = BigMac;
