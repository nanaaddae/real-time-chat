import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnected, onError) {
    const token = localStorage.getItem('token');
    
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      if (onConnected) onConnected(frame);
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connected = false;
      if (onError) onError(frame);
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  subscribeToRoom(roomId, onMessageReceived) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(
      `/topic/room/${roomId}`,
      (message) => {
        const chatMessage = JSON.parse(message.body);
        onMessageReceived(chatMessage);
      }
    );

    this.subscriptions.set(`room-${roomId}`, subscription);
    return subscription;
  }

  subscribeToTyping(roomId, onTyping) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(
      `/topic/room/${roomId}/typing`,
      (message) => {
        const typingNotification = JSON.parse(message.body);
        onTyping(typingNotification);
      }
    );

    this.subscriptions.set(`typing-${roomId}`, subscription);
    return subscription;
  }

  sendMessage(roomId, message) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/chat/${roomId}`,
      body: JSON.stringify(message)
    });
  }

  sendTypingNotification(roomId) {
    if (!this.client || !this.connected) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${roomId}/typing`,
      body: '{}'
    });
  }

  unsubscribeFromRoom(roomId) {
    const subscription = this.subscriptions.get(`room-${roomId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`room-${roomId}`);
    }
  }

  unsubscribeFromTyping(roomId) {
    const subscription = this.subscriptions.get(`typing-${roomId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`typing-${roomId}`);
    }
  }

  isConnected() {
    return this.connected;
  }


  subscribeToMessageDeletion(roomId, onMessageDeleted) {
  if (!this.client || !this.connected) {
    console.error('WebSocket not connected');
    return null;
  }

  const subscription = this.client.subscribe(
    `/topic/room/${roomId}/delete`,
    (message) => {
      const deletionNotification = JSON.parse(message.body);
      onMessageDeleted(deletionNotification);
    }
  );

  this.subscriptions.set(`delete-${roomId}`, subscription);
  return subscription;
}

deleteMessage(roomId, messageId) {
  if (!this.client || !this.connected) {
    console.error('WebSocket not connected');
    return;
  }

  this.client.publish({
    destination: `/app/chat/${roomId}/delete/${messageId}`,
    body: '{}'
  });
}

unsubscribeFromMessageDeletion(roomId) {
  const subscription = this.subscriptions.get(`delete-${roomId}`);
  if (subscription) {
    subscription.unsubscribe();
    this.subscriptions.delete(`delete-${roomId}`);
  }
}

subscribeToUserStatus(onStatusUpdate) {
  if (!this.client || !this.connected) {
    console.error('WebSocket not connected');
    return null;
  }

  const subscription = this.client.subscribe(
    '/topic/user-status',
    (message) => {
      const statusUpdate = JSON.parse(message.body);
      onStatusUpdate(statusUpdate);
    }
  );

  this.subscriptions.set('user-status', subscription);
  return subscription;
}

unsubscribeFromUserStatus() {
  const subscription = this.subscriptions.get('user-status');
  if (subscription) {
    subscription.unsubscribe();
    this.subscriptions.delete('user-status');
  }
}


}

export default new WebSocketService();