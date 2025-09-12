import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function generateToken(userId: string): string;
export {};
//# sourceMappingURL=auth.d.ts.map