import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : 'http://localhost:5173', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();
  private typingUsers = new Map<string, Set<string>>(); 

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.username = user.username;
      this.userSockets.set(user.id, client.id);

      await this.usersService.updateOnlineStatus(user.id, true);

      client.join(`user:${user.id}`);

      client.broadcast.emit('userOnlineStatusChanged', {
        userId: user.id,
        username: user.username,
        isOnline: true,
      });

      console.log(`User ${user.username} connected`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);

      await this.usersService.updateOnlineStatus(client.userId, false);

      this.typingUsers.forEach((typingSet, chatId) => {
        if (typingSet.has(client.userId)) {
          typingSet.delete(client.userId);
          client.broadcast.to(`chat:${chatId}`).emit('userStoppedTyping', {
            chatId,
            userId: client.userId,
            username: client.username,
          });
        }
      });

      client.broadcast.emit('userOnlineStatusChanged', {
        userId: client.userId,
        username: client.username,
        isOnline: false,
      });

      console.log(`User ${client.username} disconnected`);
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const messages = await this.chatService.getChatMessages(data.chatId, client.userId, 1, 1);
      
      client.join(`chat:${data.chatId}`);
      
      client.emit('joinedChat', { chatId: data.chatId });
    } catch (error) {
      client.emit('error', { message: 'Cannot join chat' });
    }
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    client.leave(`chat:${data.chatId}`);
    
    if (this.typingUsers.has(data.chatId)) {
      const typingSet = this.typingUsers.get(data.chatId);
      typingSet.delete(client.userId);
      
      client.broadcast.to(`chat:${data.chatId}`).emit('userStoppedTyping', {
        chatId: data.chatId,
        userId: client.userId,
        username: client.username,
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; content: string; type?: string },
  ) {
    try {
      const message = await this.chatService.createMessage({
        content: data.content,
        type: data.type as any || 'TEXT',
        chatId: data.chatId,
        senderId: client.userId,
      });

      if (this.typingUsers.has(data.chatId)) {
        const typingSet = this.typingUsers.get(data.chatId);
        typingSet.delete(client.userId);
      }

      this.server.to(`chat:${data.chatId}`).emit('newMessage', {
        message,
        chatId: data.chatId,
      });

      client.broadcast.to(`chat:${data.chatId}`).emit('userStoppedTyping', {
        chatId: data.chatId,
        userId: client.userId,
        username: client.username,
      });

    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    if (!this.typingUsers.has(data.chatId)) {
      this.typingUsers.set(data.chatId, new Set());
    }

    const typingSet = this.typingUsers.get(data.chatId);

    if (data.isTyping) {
      typingSet.add(client.userId);
      client.broadcast.to(`chat:${data.chatId}`).emit('userTyping', {
        chatId: data.chatId,
        userId: client.userId,
        username: client.username,
      });
    } else {
      typingSet.delete(client.userId);
      client.broadcast.to(`chat:${data.chatId}`).emit('userStoppedTyping', {
        chatId: data.chatId,
        userId: client.userId,
        username: client.username,
      });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      await this.chatService.markChatMessagesAsRead(data.chatId, client.userId);

      client.broadcast.to(`chat:${data.chatId}`).emit('messagesMarkedAsRead', {
        chatId: data.chatId,
        userId: client.userId,
        username: client.username,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark messages as read' });
    }
  }
}