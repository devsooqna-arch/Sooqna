"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMessagesRepository = void 0;
const path = __importStar(require("node:path"));
const fileStore_1 = require("../../../utils/fileStore");
const conversationsPath = path.resolve(process.cwd(), "src/modules/messages/repositories/conversations.data.json");
const messagesPath = path.resolve(process.cwd(), "src/modules/messages/repositories/messages.data.json");
class FileMessagesRepository {
    async createConversation(conversation) {
        const items = (0, fileStore_1.readJsonArrayFile)(conversationsPath);
        items.push(conversation);
        (0, fileStore_1.writeJsonArrayFile)(conversationsPath, items);
        return conversation;
    }
    async findConversationById(id) {
        const items = (0, fileStore_1.readJsonArrayFile)(conversationsPath);
        return items.find((item) => item.id === id) ?? null;
    }
    async updateConversation(conversation) {
        const items = (0, fileStore_1.readJsonArrayFile)(conversationsPath);
        const idx = items.findIndex((item) => item.id === conversation.id);
        if (idx < 0)
            throw new Error("Conversation not found");
        items[idx] = conversation;
        (0, fileStore_1.writeJsonArrayFile)(conversationsPath, items);
        return conversation;
    }
    async createMessage(message) {
        const items = (0, fileStore_1.readJsonArrayFile)(messagesPath);
        items.push(message);
        (0, fileStore_1.writeJsonArrayFile)(messagesPath, items);
        return message;
    }
    async listMessages(conversationId) {
        const items = (0, fileStore_1.readJsonArrayFile)(messagesPath);
        return items
            .filter((item) => item.conversationId === conversationId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
}
exports.FileMessagesRepository = FileMessagesRepository;
