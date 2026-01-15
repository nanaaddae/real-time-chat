import api from './api';

export const messageService = {
  getRoomMessages: async (roomId, limit = 50) => {
    const response = await api.get(`/messages/room/${roomId}?limit=${limit}`);
    return response.data;
  },

  getAllRoomMessages: async (roomId) => {
    const response = await api.get(`/messages/room/${roomId}/all`);
    return response.data;
  },

   deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }
};