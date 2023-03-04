import { Request } from "express"

class request {
    body = {}
    query = null
    params = null
    userId = null
    constructor(body, userId: string, query, params) {
        this.body = body
        this.userId = userId
        this.query = query
        this.params = params
    }
    
    //ctor
    static fromRestRequest(req: Request) {
        return new request(req.body, req.body.userId, req.query, req.params) // I changed to this form -> req.body.userId, need to check for problems
    }
}
export = request;