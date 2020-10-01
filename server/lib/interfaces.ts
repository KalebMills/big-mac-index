export interface Closeable {
    close(): Promise<void>;
}

export interface Initializable {
    initialize(): Promise<void>;
}