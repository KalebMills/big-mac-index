"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
class BaseError extends Error {
    constructor(options) {
        super(options.message);
        Object.setPrototypeOf(this, BaseError.prototype);
        this.message = options.message || '';
        this.name = this.constructor.name;
        this.httpStatusCode = options.httpStatusCode;
    }
}
exports.BaseError = BaseError;
