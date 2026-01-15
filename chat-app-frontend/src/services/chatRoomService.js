import api from './api';

export const chatRoomService = {
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  getAllRooms: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getUserRooms: async () => {
    const response = await api.get('/rooms/user');
    return response.data;
  },

  getRoomById: async (roomId) => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

 joinRoom: async (roomId, password = null) => {
  const body = password ? { password } : {};
  const response = await api.post(`/rooms/${roomId}/join`, body);
  return response.data;
},

  leaveRoom: async (roomId) => {
    const response = await api.post(`/rooms/${roomId}/leave`);
    return response.data;
  },

deleteRoom: async (roomId) => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
},

searchRooms: async (query) => {
  const response = await api.get(`/rooms/search?q=${query}`);
  return response.data;
}
};