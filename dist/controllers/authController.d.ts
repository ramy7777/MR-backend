import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private authService;
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
