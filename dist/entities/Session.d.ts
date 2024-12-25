import { User } from './User';
import { Device } from './Device';
export declare class Session {
    id: string;
    user: User;
    userId: string;
    device: Device;
    deviceId: string;
    startTime: Date;
    endTime: Date;
    gameData: {
        applicationId?: string;
        duration?: number;
        performance?: {
            fps?: number;
            latency?: number;
        };
    };
    telemetry: {
        batteryLevel?: number;
        temperature?: number;
        errors?: string[];
    };
    createdAt: Date;
}
