export interface BaseError {
    httpStatusCode?: number;
}

export interface BaseErrorOptions {
    message: string;
    httpStatusCode?: number;
}

export class BaseError extends Error implements BaseError {
    constructor(options: BaseErrorOptions) {
        super(options.message);
        Object.setPrototypeOf(this, BaseError.prototype);
        this.message = options.message || '';
        this.name = this.constructor.name;
        this.httpStatusCode = options.httpStatusCode;
    }
}
