import * as util from '../lib/util';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';

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
  }


describe('#csvToJSON', () => {
    it('Can convert CSV data to JSON', () => {
        const csvData = fs.readFileSync(CSV_DATA_PATH, 'utf-8');
        const jsonData = util.csvToJSON(csvData, DATA_KEYS);
        
        assert.deepStrictEqual(jsonData, [EXPECTED_JSON_DATA]);
    });
});

describe('#createDeferredPromise', () => {
    it('Can defer a Promise properly', () => {
        let t: NodeJS.Timeout;
        let delayedPromise = new Promise((resolve, reject) => {
            t = setTimeout(() => reject(), 1000);
        });
        
        let deferredPromise = util.createDeferredPromise(delayedPromise);
        deferredPromise.cancellable = () => {
            t.unref();
        }

        return deferredPromise.promise
        .then(() => assert.fail('Promise should not resolve successfully.'))
        .catch(() => assert.ok(true));
    });
});