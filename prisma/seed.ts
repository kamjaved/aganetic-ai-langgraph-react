// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const users = [
    {
      email: 'alice@example.com',
      name: 'Alice Smith',
      city: 'New York',
      country: 'USA',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      salary: 95000.0,
      currency: 'USD',
      remotePercent: 80,
    },
    {
      email: 'bob@example.com',
      name: 'Bob Johnson',
      city: 'London',
      country: 'UK',
      jobTitle: 'Product Manager',
      department: 'Product',
      salary: 80000.0,
      currency: 'GBP',
      remotePercent: 100,
    },
    {
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      city: 'Paris',
      country: 'France',
      jobTitle: 'UX Designer',
      department: 'Design',
      salary: 70000.0,
      currency: 'EUR',
      remotePercent: 50,
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      city: 'Barcelona',
      country: 'Spain',
      jobTitle: 'Senior Software Engineer',
      department: 'Engineering',
      salary: 85000,
      currency: 'EUR',
      remotePercent: 100,
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      city: 'London',
      country: 'United Kingdom',
      jobTitle: 'Product Manager',
      department: 'Product',
      salary: 95000,
      currency: 'GBP',
      remotePercent: 80,
    },
    {
      name: 'David Johnson',
      email: 'david.johnson@example.com',
      city: 'Lisbon',
      country: 'Portugal',
      jobTitle: 'UX Designer',
      department: 'Design',
      salary: 70000,
      currency: 'EUR',
      remotePercent: 100,
    },
    {
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@example.com',
      city: 'Mexico City',
      country: 'Mexico',
      jobTitle: 'DevOps Engineer',
      department: 'Infrastructure',
      salary: 75000,
      currency: 'USD',
      remotePercent: 100,
    },
    {
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      city: 'Taipei',
      country: 'Taiwan',
      jobTitle: 'Data Scientist',
      department: 'Data',
      salary: 92000,
      currency: 'USD',
      remotePercent: 90,
    },
    {
      name: 'Sarah Kim',
      email: 'sarah.kim@example.com',
      city: 'Seoul',
      country: 'South Korea',
      jobTitle: 'Frontend Developer',
      department: 'Engineering',
      salary: 78000,
      currency: 'USD',
      remotePercent: 100,
    },
    {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      city: 'Berlin',
      country: 'Germany',
      jobTitle: 'Backend Developer',
      department: 'Engineering',
      salary: 82000,
      currency: 'EUR',
      remotePercent: 100,
    },
    {
      name: 'Ana Silva',
      email: 'ana.silva@example.com',
      city: 'Rio de Janeiro',
      country: 'Brazil',
      jobTitle: 'Marketing Manager',
      department: 'Marketing',
      salary: 65000,
      currency: 'USD',
      remotePercent: 70,
    },
    {
      name: 'Raj Patel',
      email: 'raj.patel@example.com',
      city: 'Mumbai',
      country: 'India',
      jobTitle: 'Technical Lead',
      department: 'Engineering',
      salary: 88000,
      currency: 'USD',
      remotePercent: 100,
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      city: 'Toronto',
      country: 'Canada',
      jobTitle: 'Content Strategist',
      department: 'Marketing',
      salary: 72000,
      currency: 'CAD',
      remotePercent: 80,
    },
    {
      email: 'kamranjaved@example.com',
      name: 'Kamran javed',
      city: 'Kolkata',
      country: 'INDIA',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      salary: 80000.0,
      currency: 'INR',
      remotePercent: 120,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log(`Created or updated user with id: ${user.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
