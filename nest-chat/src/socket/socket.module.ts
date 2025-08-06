import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt'; 
@Module({
  imports: [
    ChatModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [SocketGateway],
})
export class SocketModule {}
