declare namespace Express {
    export interface Request {
        session: Session & Partial<SessionData> & UserType
    }
}