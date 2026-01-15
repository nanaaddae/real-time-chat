import api from './api';

export const userService = {
  getUserByUsername: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  }
};