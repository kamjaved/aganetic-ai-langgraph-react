import { add, multiply } from './mathTool';
import { searchTool } from './searchTools';
import { convertCurrency } from './currencyTools';
import {
  getUserById,
  getUsersByCity,
  getUsersByCountry,
  getUsersByDepartment,
  getUsersByName,
  getUsersByProfession,
  getAllUsersByDepartment,
  getAllUsersByCountry,
} from './dbTools';

// Export all tools as a single array for the agent
export const tools = [
  add,
  multiply,
  searchTool,
  getUserById,
  getUsersByCity,
  getUsersByCountry,
  getUsersByDepartment,
  getUsersByName,
  getUsersByProfession,
  getAllUsersByCountry,
  getAllUsersByDepartment,
  convertCurrency,
];
