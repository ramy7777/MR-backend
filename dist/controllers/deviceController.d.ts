import { Request, Response, NextFunction } from 'express';
export declare class DeviceController {
    private deviceService;
    createDevice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDevice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllDevices: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateDevice: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDeviceStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    scheduleMaintenance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
