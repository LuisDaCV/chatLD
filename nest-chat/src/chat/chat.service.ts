import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createOrGetChat(initiatorId: string, participantUsername: string) {

    const participant = await this.prisma.user.findUnique({
      where: { username: participantUsername },
    });

    if (!participant) {
      throw new Error('User not found');
    }

    let chat = await this.prisma.chat.findFirst({
      where: {
        OR: [
          { initiatorId, participantId: participant.id },
          { initiatorId: participant.id, participantId: initiatorId },
        ],
      },
      include: {
        initiator: {
          select: { id: true, username: true, avatar: true, isOnline: true },
        },
        participant: {
          select: { id: true, username: true, avatar: true, isOnline: true },
        },
        messages: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, username: true, avatar: true },
            },
            readStatus: true,
          },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          initiatorId,
          participantId: participant.id,
        },
        include: {
          initiator: {
            select: { id: true, username: true, avatar: true, isOnline: true },
          },
          participant: {
            select: { id: true, username: true, avatar: true, isOnline: true },
          },
          messages: {
            include: {
              sender: {
                select: { id: true, username: true, avatar: true },
              },
              readStatus: true,
            },
          },
        },
      });
    }

    return chat;
  }

  async getUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { participantId: userId },
        ],
        isActive: true,
      },
      include: {
        initiator: {
          select: { id: true, username: true, avatar: true, isOnline: true, lastSeen: true },
        },
        participant: {
          select: { id: true, username: true, avatar: true, isOnline: true, lastSeen: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, username: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChatMessages(chatId: string, userId: string, page = 1, limit = 50) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { initiatorId: userId },
          { participantId: userId },
        ],
      },
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const skip = (page - 1) * limit;

    return this.prisma.message.findMany({
      where: { chatId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
        readStatus: {
          where: { userId },
        },
      },
    });
  }

  async createMessage(createMessageDto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: createMessageDto,
      include: {
        sender: {
          select: { id: true, username: true, avatar: true },
        },
        readStatus: true,
      },
    });


    await this.prisma.chat.update({
      where: { id: createMessageDto.chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markMessageAsRead(messageId: string, userId: string) {
    return this.prisma.messageReadStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        messageId,
        userId,
        readAt: new Date(),
      },
    });
  }

  async markChatMessagesAsRead(chatId: string, userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
        senderId: { not: userId }, 
      },
      select: { id: true },
    });

    const readStatusData = messages.map(message => ({
      messageId: message.id,
      userId,
      readAt: new Date(),
    }));

    if (readStatusData.length > 0) {
      await this.prisma.messageReadStatus.createMany({
        data: readStatusData,
        skipDuplicates: true,
      });
    }

    return { markedAsRead: readStatusData.length };
  }
}