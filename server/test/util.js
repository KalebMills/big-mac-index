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
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../lib/util"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const CSV_DATA_PATH = path.join(__dirname, 'resources', 'test-data.csv');
const DATA_KEYS = ['country', 'date', 'localPrice', 'dollarEx', 'dollarPrice', 'dollarPPP', 'dollarValuation'];
const EXPECTED_JSON_DATA = {
    country: 'Argentina',
    date: '2002-04-01',
    localPrice: '2.5',
    dollarEx: '3.13',
    dollarPrice: '0.78',
    dollarPPP: '1.004016064257028',
    dollarValuation: '-67.92280944865725'
};
describe('#csvToJSON', () => {
    it('Can convert CSV data to JSON', () => {
        const csvData = fs.readFileSync(CSV_DATA_PATH, 'utf-8');
        const jsonData = util.csvToJSON(csvData, DATA_KEYS);
        assert.deepStrictEqual(jsonData, [EXPECTED_JSON_DATA]);
    });
});
describe('#createDeferredPromise', () => {
    it('Can defer a Promise properly', () => {
        let t;
        let delayedPromise = new Promise((resolve, reject) => {
            t = setTimeout(() => reject(), 1000);
        });
        let deferredPromise = util.createDeferredPromise(delayedPromise);
        deferredPromise.cancellable = () => {
            t.unref();
        };
        return deferredPromise.promise
            .then(() => assert.fail('Promise should not resolve successfully.'))
            .catch(() => assert.ok(true));
    });
});
