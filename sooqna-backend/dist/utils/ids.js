"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
const node_crypto_1 = require("node:crypto");
function generateId(prefix) {
    const id = `${Date.now()}_${(0, node_crypto_1.randomBytes)(6).toString("hex")}`;
    return prefix ? `${prefix}_${id}` : id;
}
