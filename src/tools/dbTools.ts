import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import prisma from '../db';

// Tool to find users by name
export const getUsersByName = tool(
  async ({ name }: { name: string }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      });

      return users.length > 0 ? JSON.stringify(users) : `No users found with name containing "${name}"`;
    } catch (error) {
      console.error('Error searching users by name:', error);
      return 'Failed to search users by name';
    }
  },
  {
    name: 'getUsersByName',
    description: 'Search for users by name (case insensitive, partial matches)',
    schema: z.object({
      name: z.string().describe('The name or part of name to search for'),
    }),
  }
);

// Tool to find users by profession (job title)
export const getUsersByProfession = tool(
  async ({ profession }: { profession: string }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          jobTitle: {
            contains: profession,
            mode: 'insensitive',
          },
        },
      });

      return users.length > 0
        ? JSON.stringify(users)
        : `No users found with profession containing "${profession}"`;
    } catch (error) {
      console.error('Error searching users by profession:', error);
      return 'Failed to search users by profession';
    }
  },
  {
    name: 'getUsersByProfession',
    description: 'Search for users by profession/job title (case insensitive, partial matches)',
    schema: z.object({
      profession: z.string().describe('The profession/job title or part of it to search for'),
    }),
  }
);

// Tool to find users by city
export const getUsersByCity = tool(
  async ({ city }: { city: string }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          city: {
            contains: city,
            mode: 'insensitive',
          },
        },
      });

      return users.length > 0 ? JSON.stringify(users) : `No users found in city containing "${city}"`;
    } catch (error) {
      console.error('Error searching users by city:', error);
      return 'Failed to search users by city';
    }
  },
  {
    name: 'getUsersByCity',
    description: 'Search for users by city (case insensitive, partial matches)',
    schema: z.object({
      city: z.string().describe('The city or part of city to search for'),
    }),
  }
);

// Tool to find users by country
export const getUsersByCountry = tool(
  async ({ country }: { country: string }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          country: {
            contains: country,
            mode: 'insensitive',
          },
        },
      });

      return users.length > 0 ? JSON.stringify(users) : `No users found in country containing "${country}"`;
    } catch (error) {
      console.error('Error searching users by country:', error);
      return 'Failed to search users by country';
    }
  },
  {
    name: 'getUsersByCountry',
    description: 'Search for users by country (case insensitive, partial matches)',
    schema: z.object({
      country: z.string().describe('The country or part of country to search for'),
    }),
  }
);

// Tool to find users by department
export const getUsersByDepartment = tool(
  async ({ department }: { department: string }) => {
    try {
      const users = await prisma.user.findMany({
        where: {
          department: {
            contains: department,
            mode: 'insensitive',
          },
        },
      });

      return users.length > 0
        ? JSON.stringify(users)
        : `No users found in department containing "${department}"`;
    } catch (error) {
      console.error('Error searching users by department:', error);
      return 'Failed to search users by department';
    }
  },
  {
    name: 'getUsersByDepartment',
    description: 'Search for users by department (case insensitive, partial matches)',
    schema: z.object({
      department: z.string().describe('The department or part of department to search for'),
    }),
  }
);

// Tool for advanced search with multiple criteria
export const searchUsers = tool(
  async ({
    name,
    profession,
    city,
    country,
    department,
    minSalary,
    maxSalary,
  }: {
    name?: string;
    profession?: string;
    city?: string;
    country?: string;
    department?: string;
    minSalary?: number;
    maxSalary?: number;
  }) => {
    try {
      const whereClause: any = {};

      if (name) whereClause.name = { contains: name, mode: 'insensitive' };
      if (profession) whereClause.jobTitle = { contains: profession, mode: 'insensitive' };
      if (city) whereClause.city = { contains: city, mode: 'insensitive' };
      if (country) whereClause.country = { contains: country, mode: 'insensitive' };
      if (department) whereClause.department = { contains: department, mode: 'insensitive' };

      if (minSalary || maxSalary) {
        whereClause.salary = {};
        if (minSalary) whereClause.salary.gte = minSalary;
        if (maxSalary) whereClause.salary.lte = maxSalary;
      }

      const users = await prisma.user.findMany({
        where: whereClause,
      });

      return users.length > 0 ? JSON.stringify(users) : 'No users found matching the criteria';
    } catch (error) {
      console.error('Error performing advanced search:', error);
      return 'Failed to perform advanced search';
    }
  },
  {
    name: 'searchUsers',
    description: 'Advanced search for users with multiple optional criteria',
    schema: z.object({
      name: z.string().optional().describe('User name (partial match)'),
      profession: z.string().optional().describe('Job title/profession (partial match)'),
      city: z.string().optional().describe('City (partial match)'),
      country: z.string().optional().describe('Country (partial match)'),
      department: z.string().optional().describe('Department (partial match)'),
      minSalary: z.number().optional().describe('Minimum salary'),
      maxSalary: z.number().optional().describe('Maximum salary'),
    }),
  }
);

// Tool to get a user by their ID
export const getUserById = tool(
  async ({ id }: { id: number }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return user ? JSON.stringify(user) : `No user found with ID ${id}`;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return 'Failed to fetch user by ID';
    }
  },
  {
    name: 'getUserById',
    description: 'Get a user by their ID',
    schema: z.object({
      id: z.number().describe('The ID of the user to fetch'),
    }),
  }
);

// Tool to get all user grouped by their country
export const getAllUsersByCountry = tool(
  async () => {
    try {
      const users = await prisma.user.groupBy({
        by: ['country'],
        _count: {
          id: true,
        },
      });

      return JSON.stringify(users);
    } catch (error) {
      console.error('Error getting all users grouped by country:', error);
      return 'Failed to get all users grouped by country';
    }
  },
  {
    name: 'getAllUsersByCountry',
    description: 'Get all users grouped by their country',
    schema: z.object({
      country: z.string().describe('The country or part of country to search for'),
    }),
  }
);

// Tool to get all users grouped by their department
export const getAllUsersByDepartment = tool(
  async () => {
    try {
      const users = await prisma.user.groupBy({
        by: ['department'],
        _count: {
          id: true,
        },
      });

      return JSON.stringify(users);
    } catch (error) {
      console.error('Error getting all users grouped by department:', error);
      return 'Failed to get all users grouped by department';
    }
  },
  {
    name: 'getAllUsersByDepartment',
    description: 'Get all users grouped by their department',
    schema: z.object({
      profession: z.string().describe('The profession/job title or part of it to search for'),
    }),
  }
);
