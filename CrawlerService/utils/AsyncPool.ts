export default class AsyncPool {
    private pool: Promise<number>[] = [];
    private errors: any[] = [];
    private closed = false;
    private maxWorkers: number;

    constructor(maxWorkers: number) {
        this.maxWorkers = maxWorkers;
    }

    private getVacantIndex() {
        if (this.pool.length < this.maxWorkers) return this.pool.length;
        else return null;
    }

    private wrapTaskWithIndex(
        index: number,
        fn: (...args: any[]) => Promise<unknown>,
        ...args: unknown[]
    ) {
        const task = fn(...args).then(
            () => {
                return index;
            },
            (reason) => {
                this.errors.push(reason);
                return index;
            }
        );
        return task;
    }

    /** The function printed includes the function code. Disable parameter printing. */
    public async submit(
        fn: (...args: any[]) => Promise<unknown>,
        ...args: unknown[]
    ) {
        const index = this.getVacantIndex();
        if (index != null) {
            // pool is still vacant (only when initializing)
            this.pool.push(this.wrapTaskWithIndex(index, fn, ...args));
        } else {
            // pool is full (substitution strategy)
            const returnIndex = await Promise.any(this.pool); // wait for a task to complete
            this.pool[returnIndex] = this.wrapTaskWithIndex(
                returnIndex,
                fn,
                ...args
            );
        }
    }

    public async close() {
        await Promise.all(this.pool);
        this.closed = true;
    }

    public getErrors() {
        if (this.closed) return this.errors;
        else throw new EvalError("Cannot sum up errors in unclosed pools");
    }
}