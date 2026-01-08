import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('operator123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { username: 'operator' },
    update: {},
    create: {
      username: 'operator',
      password: operatorPassword,
      role: 'operator',
    },
  });

  console.log('✓ Created users (admin/admin123, operator/operator123)');

  // Create input PLCs (simulators)
  const siemens = await prisma.pLC.upsert({
    where: { id: 'plc-siemens-s7' },
    update: {},
    create: {
      id: 'plc-siemens-s7',
      name: 'Siemens S7-1500',
      brand: 'SIEMENS',
      protocol: 'S7COMM',
      type: 'INPUT',
      enabled: true,
    },
  });

  const allenBradley = await prisma.pLC.upsert({
    where: { id: 'plc-ab-logix' },
    update: {},
    create: {
      id: 'plc-ab-logix',
      name: 'Allen-Bradley ControlLogix',
      brand: 'ALLEN_BRADLEY',
      protocol: 'ETHERNET_IP',
      type: 'INPUT',
      enabled: true,
    },
  });

  const schneider = await prisma.pLC.upsert({
    where: { id: 'plc-schneider-modicon' },
    update: {},
    create: {
      id: 'plc-schneider-modicon',
      name: 'Schneider Modicon M580',
      brand: 'SCHNEIDER',
      protocol: 'MODBUS_TCP',
      type: 'INPUT',
      enabled: true,
    },
  });

  console.log('✓ Created input PLCs (simulators)');

  // Create tags for Siemens
  try {
    await prisma.tag.createMany({
      data: [
        {
          plcId: siemens.id,
          name: 'Temperature_Zone1',
          address: 'DB1.DBD0',
          dataType: 'FLOAT',
          unit: '°C',
          signalType: 'SINE',
          frequency: 0.5,
          amplitude: 25,
          offset: 75,
        },
        {
          plcId: siemens.id,
          name: 'Pressure_Tank1',
          address: 'DB1.DBD4',
          dataType: 'FLOAT',
          unit: 'PSI',
          signalType: 'SINE',
          frequency: 0.3,
          amplitude: 50,
          offset: 100,
        },
        {
          plcId: siemens.id,
          name: 'Motor_Speed',
          address: 'DB1.DBD8',
          dataType: 'FLOAT',
          unit: 'RPM',
          signalType: 'RAMP',
          frequency: 0.2,
          amplitude: 1500,
          offset: 500,
        },
      ],
    });
  } catch (e) {
    // Tags already exist
  }

  // Create tags for Allen-Bradley
  try {
    await prisma.tag.createMany({
      data: [
        {
          plcId: allenBradley.id,
          name: 'Flow_Rate',
          address: 'N7:0',
          dataType: 'FLOAT',
          unit: 'L/min',
          signalType: 'SINE',
          frequency: 0.4,
          amplitude: 100,
          offset: 200,
        },
        {
          plcId: allenBradley.id,
          name: 'Valve_Position',
          address: 'N7:1',
          dataType: 'FLOAT',
          unit: '%',
          signalType: 'RANDOM',
          amplitude: 100,
          offset: 0,
        },
      ],
    });
  } catch (e) {
    // Tags already exist
  }

  // Create tags for Schneider
  try {
    await prisma.tag.createMany({
      data: [
        {
          plcId: schneider.id,
          name: 'Power_Consumption',
          address: '40001',
          dataType: 'FLOAT',
          unit: 'kW',
          signalType: 'SINE',
          frequency: 0.6,
          amplitude: 500,
          offset: 1000,
        },
        {
          plcId: schneider.id,
          name: 'Emergency_Stop',
          address: '40002',
          dataType: 'BOOL',
          signalType: 'DIGITAL',
          frequency: 0.1,
        },
      ],
    });
  } catch (e) {
    // Tags already exist
  }

  console.log('✓ Created tags for input PLCs');

  // Create output PLC (emulator)
  const genericOpcua = await prisma.pLC.upsert({
    where: { id: 'plc-output-opcua' },
    update: {},
    create: {
      id: 'plc-output-opcua',
      name: 'Generic OPC UA Gateway',
      brand: 'GENERIC',
      protocol: 'OPCUA',
      type: 'OUTPUT',
      enabled: false,
      port: 4840,
    },
  });

  console.log('✓ Created output PLC (emulator)');

  // Create sample mappings
  const tags = await prisma.tag.findMany();

  if (tags.length > 0) {
    try {
      await prisma.tagMapping.createMany({
        data: [
          {
            inputTagId: tags[0].id,
            outputPlcId: genericOpcua.id,
            outputTagName: 'Gateway_Temperature',
            outputAddress: 'ns=1;s=Temperature',
            scaleFactor: 1.0,
            offset: 0,
          },
          {
            inputTagId: tags[1].id,
            outputPlcId: genericOpcua.id,
            outputTagName: 'Gateway_Pressure',
            outputAddress: 'ns=1;s=Pressure',
            scaleFactor: 0.0689476, // PSI to bar
            offset: 0,
          },
        ],
      });
    } catch (e) {
      // Mappings already exist
    }

    console.log('✓ Created sample tag mappings');
  }

  console.log('\n✅ Database seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
