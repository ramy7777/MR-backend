import { Device } from '../entities/Device';
export declare class DeviceService {
    private deviceRepository;
    constructor();
    private initRepository;
    create(data: Partial<Device>): Promise<Device>;
    findById(id: string): Promise<Device>;
    findAll(page?: number, limit?: number, status?: Device['status']): Promise<{
        devices: Device[];
        pagination: {
            total: number;
            page: number;
            pages: number;
        };
    }>;
    update(id: string, data: Partial<Device>): Promise<Device>;
    updateStatus(id: string, status: Device['status']): Promise<Device>;
    getDeviceStats(id: string): Promise<{
        totalRentals: number;
        totalSessions: number;
        totalUsageHours: number;
        currentStatus: "available" | "rented" | "maintenance" | "retired";
        lastMaintenance: Date;
        condition: "excellent" | "good" | "fair" | "poor";
    }>;
    scheduleMaintenanceCheck(id: string, date: Date): Promise<Device>;
}
