import { useState } from 'react';
import type { User } from '../constant';

/**
 * Custom hook to manage user selection
 * @param initialUser - Optional initial user to select
 */
export const useUserSelection = (initialUser: User | null = null) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(initialUser);

  /**
   * Handle user selection
   * @param user - The user to select
   */
  const handleUserSelect = (user: User) => {
    if (selectedUser?.id !== user.id) {
      setSelectedUser(user);
    }
  };

  return {
    selectedUser,
    handleUserSelect,
  };
};
