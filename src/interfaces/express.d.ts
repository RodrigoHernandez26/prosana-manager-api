interface AuthData {
    id: number;
}

declare namespace Express {
    export interface Request {
       authData?: AuthData
    }
}