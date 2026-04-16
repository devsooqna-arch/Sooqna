"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversation = createConversation;
exports.createMessage = createMessage;
exports.getConversation = getConversation;
exports.getConversationMessages = getConversationMessages;
const messages_repository_1 = require("./repositories/messages.repository");
const messages_service_1 = require("./messages.service");
const service = new messages_service_1.MessagesService(new messages_repository_1.FileMessagesRepository());
async function createConversation(req, res) {
    const uid = req.authUser?.uid;
    if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const conversation = await service.createConversation({
            participantIds: Array.isArray(req.body?.participantIds)
                ? req.body.participantIds.map(String)
                : [uid],
            participants: req.body?.participants && typeof req.body.participants === "object"
                ? req.body.participants
                : {
                    [uid]: {
                        fullName: req.authUser?.name ?? "",
                        photoURL: req.authUser?.picture ?? "",
                    },
                },
            listingId: String(req.body?.listingId ?? ""),
            listingSnapshot: {
                title: String(req.body?.listingSnapshot?.title ?? ""),
                primaryImageURL: String(req.body?.listingSnapshot?.primaryImageURL ?? ""),
            },
            createdBy: uid,
        });
        res.status(201).json({ success: true, conversation });
    }
    catch (error) {
        res.status(400).json({ success: false, message: String(error.message) });
    }
}
async function createMessage(req, res) {
    const uid = req.authUser?.uid;
    if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
    }
    try {
        const message = await service.createMessage({
            conversationId: req.params.conversationId,
            senderId: uid,
            type: req.body?.type ?? "text",
            text: String(req.body?.text ?? ""),
            attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
        });
        res.status(201).json({ success: true, message });
    }
    catch (error) {
        res.status(400).json({ success: false, message: String(error.message) });
    }
}
async function getConversation(req, res) {
    const conversation = await service.getConversation(req.params.conversationId);
    if (!conversation) {
        res.status(404).json({ success: false, message: "Conversation not found" });
        return;
    }
    res.json({ success: true, conversation });
}
async function getConversationMessages(req, res) {
    const messages = await service.getMessages(req.params.conversationId);
    res.json({ success: true, messages });
}
