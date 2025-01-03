import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';

export const seedVRDevices = async () => {
  const deviceRepository = AppDataSource.getRepository(Device);

  const sampleDevices = [
    {
      name: 'Meta Quest 3',
      serialNumber: 'MQ3-2023-001',
      model: 'Quest 3',
      status: 'available' as const,
      condition: 'excellent' as const,
      specifications: {
        manufacturer: 'Meta',
        modelNumber: 'MQ3-256GB',
        firmware: 'v57.0',
        hardware: 'Snapdragon XR2 Gen 2',
        displayType: 'LCD',
        resolution: '2064x2208 per eye',
        refreshRate: '120Hz',
        fieldOfView: '110 degrees horizontal',
        tracking: 'Inside-out 6DOF',
        controllers: 'Touch Plus Controllers',
        connectivity: ['Wi-Fi 6E', 'Bluetooth 5.2'] as string[],
        sensors: ['6 Cameras', 'IR Sensors', 'Accelerometer', 'Gyroscope'] as string[]
      }
    },
    {
      name: 'Valve Index',
      serialNumber: 'VI-2023-001',
      model: 'Index',
      status: 'available' as const,
      condition: 'excellent' as const,
      specifications: {
        manufacturer: 'Valve',
        modelNumber: 'INDEX-HMD',
        firmware: 'v1.16.8',
        hardware: 'Custom Valve Hardware',
        displayType: 'LCD (RGB subpixel)',
        resolution: '1440x1600 per eye',
        refreshRate: '144Hz',
        fieldOfView: '130 degrees horizontal',
        tracking: 'SteamVR 2.0 Base Stations',
        controllers: 'Index Knuckles Controllers',
        connectivity: ['DisplayPort 1.2', 'USB 3.0'] as string[],
        sensors: ['Base Station Sensors', 'IMU', 'Cameras'] as string[]
      }
    },
    {
      name: 'HP Reverb G2',
      serialNumber: 'HP-2023-001',
      model: 'Reverb G2',
      status: 'available' as const,
      condition: 'excellent' as const,
      specifications: {
        manufacturer: 'HP',
        modelNumber: 'G2-2020',
        firmware: 'v2.1.1',
        hardware: 'Windows Mixed Reality',
        displayType: 'LCD',
        resolution: '2160x2160 per eye',
        refreshRate: '90Hz',
        fieldOfView: '114 degrees horizontal',
        tracking: 'Inside-out 4 camera',
        controllers: 'HP Motion Controllers',
        connectivity: ['DisplayPort 1.3', 'USB 3.0'] as string[],
        sensors: ['4 Cameras', 'IMU', 'Proximity'] as string[]
      }
    },
    {
      name: 'Pico 4',
      serialNumber: 'P4-2023-001',
      model: 'Pico 4',
      status: 'available' as const,
      condition: 'excellent' as const,
      specifications: {
        manufacturer: 'Pico',
        modelNumber: 'A8110',
        firmware: 'v5.2.0',
        hardware: 'Snapdragon XR2',
        displayType: 'LCD',
        resolution: '2160x2160 per eye',
        refreshRate: '90Hz',
        fieldOfView: '105 degrees horizontal',
        tracking: 'Inside-out 6DOF',
        controllers: 'Pico Motion Controllers',
        connectivity: ['Wi-Fi 6', 'Bluetooth 5.1'] as string[],
        sensors: ['4 Cameras', 'IMU', 'Proximity'] as string[]
      }
    },
    {
      name: 'VIVE Pro 2',
      serialNumber: 'VP2-2023-001',
      model: 'VIVE Pro 2',
      status: 'available' as const,
      condition: 'excellent' as const,
      specifications: {
        manufacturer: 'HTC',
        modelNumber: 'VIVE-PRO2',
        firmware: 'v1.5.0',
        hardware: 'SteamVR Compatible',
        displayType: 'RGB LCD',
        resolution: '2448x2448 per eye',
        refreshRate: '120Hz',
        fieldOfView: '120 degrees horizontal',
        tracking: 'SteamVR Base Stations',
        controllers: 'VIVE Controllers',
        connectivity: ['DisplayPort 1.4', 'USB 3.0'] as string[],
        sensors: ['G-sensor', 'Gyroscope', 'Proximity', 'IPD sensor'] as string[]
      }
    }
  ];

  for (const deviceData of sampleDevices) {
    const existingDevice = await deviceRepository.findOne({
      where: { serialNumber: deviceData.serialNumber }
    });

    if (!existingDevice) {
      const device = deviceRepository.create({
        ...deviceData,
        maintenanceHistory: [{
          date: new Date('2024-12-15'),
          type: 'routine' as const,
          description: 'Initial setup and calibration',
          technician: 'System Admin'
        }]
      });
      await deviceRepository.save(device);
      console.log(`Created device: ${device.name}`);
    } else {
      console.log(`Device ${deviceData.name} already exists`);
    }
  }
};

// Run the seed if this file is executed directly
if (require.main === module) {
  AppDataSource.initialize().then(async () => {
    console.log('Seeding VR devices...');
    await seedVRDevices();
    console.log('Seeding completed');
    process.exit(0);
  }).catch(error => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
}
