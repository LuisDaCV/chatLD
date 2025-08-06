import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('start/:username')
  startChat(@Param('username') username: string, @Request() req) {
    return this.chatService.createOrGetChat(req.user.id, username);
  }

  @Get('my-chats')
  getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.id);
  }

  @Get(':chatId/messages')
  getChatMessages(
    @Param('chatId') chatId: string,
    @Query('page') page: string,
    @Request() req,
  ) {
    return this.chatService.getChatMessages(chatId, req.user.id, parseInt(page) || 1);
  }

  @Post(':chatId/messages')
  createMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: Omit<CreateMessageDto, 'chatId' | 'senderId'>,
    @Request() req,
  ) {
    return this.chatService.createMessage({
      ...createMessageDto,
      chatId,
      senderId: req.user.id,
    });
  }

  @Post(':chatId/mark-read')
  markChatAsRead(@Param('chatId') chatId: string, @Request() req) {
    return this.chatService.markChatMessagesAsRead(chatId, req.user.id);
  }
}