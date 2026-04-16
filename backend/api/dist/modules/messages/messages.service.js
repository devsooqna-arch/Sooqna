"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const ids_1 = require("../../utils/ids");
const time_1 = require("../../utils/time");
class MessagesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async createConversation(input) {
        const now = (0, time_1.nowIso)();
        const conversation = {
            id: (0, ids_1.generateId)("conv"),
            participantIds: input.participantIds,
            participants: input.participants,
            listingId: input.listingId,
            listingSnapshot: input.listingSnapshot,
            createdBy: input.createdBy,
            lastMessageText: "",
            lastMessageSenderId: "",
            lastMessageAt: null,
            lastMessageType: "text",
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        return this.repo.createConversation(conversation);
    }
    async createMessage(input) {
        const now = (0, time_1.nowIso)();
        const conversation = await this.repo.findConversationById(input.conversationId);
        if (!conversation)
            throw new Error("Conversation not found");
        const message = {
            id: (0, ids_1.generateId)("msg"),
            conversationId: input.conversationId,
            senderId: input.senderId,
            type: input.type,
            text: input.text,
            attachments: input.attachments ?? [],
            isRead: false,
            readAt: null,
            createdAt: now,
            deletedAt: null,
        };
        await this.repo.createMessage(message);
        await this.repo.updateConversation({
            ...conversation,
            lastMessageText: input.text,
            lastMessageSenderId: input.senderId,
            lastMessageAt: now,
            lastMessageType: input.type,
            updatedAt: now,
        });
        return message;
    }
    async getConversation(id) {
        return this.repo.findConversationById(id);
    }
    async getMessages(conversationId) {
        return this.repo.listMessages(conversationId);
    }
}
exports.MessagesService = MessagesService;
