"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJSON = exports.createDeferredPromise = void 0;
exports.createDeferredPromise = (pendingPromise) => {
    //This object ends up being constructed, ignore TS errors
    //@ts-ignore
    let deferredPromise = {};
    let p = new Promise((resolve, reject) => {
        deferredPromise.reject = () => {
            deferredPromise.cancellable();
            reject();
        };
        deferredPromise.resolve = () => {
            deferredPromise.cancellable();
            resolve();
        };
        pendingPromise
            .then(() => resolve())
            .catch(err => reject(err));
    });
    deferredPromise.promise = p;
    return deferredPromise;
};
/**
 * Convert CSV data to JSON given an ordered list of keys to assign to each value in each line of data
 * @param data {string} the string version of the data to conver
 * @param keys {string[]} an ordered list of the keys that are assign to the values in each row
 */
exports.csvToJSON = (originalData, keys) => {
    //Ideally the default of T is a KV interface that any type of T would need to extend to be valid here
    //@ts-ignore
    let newData = [];
    let copy = (' ' + originalData).slice(1); //Make a copy of the data, make no change to the reference
    let lines = copy.split('\n');
    for (const line of lines) {
        if (line) {
            const newObj = {};
            const splitData = line.split(',');
            for (const index in keys) {
                const key = keys[index];
                const value = splitData[index].trim();
                if (!!value) {
                    newObj[key] = value;
                }
                else {
                    //It's possible in this small example that the provided CSV does not have the 
                    //expected data structure since there is no validation mechanism. All we will do is a warn
                    console.warn(`Value not present for key ${key}`);
                }
            }
            newData.push(newObj);
        }
        else {
            //no op
        }
    }
    return newData;
};
