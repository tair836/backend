class error {
    code = 0;
    message = null;
    constructor(code, message: string) {
        this.code = code;
        this.message = message;
    }
}
export = error;