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
exports.adminAuth = void 0;
exports.ensureFirebaseAdmin = ensureFirebaseAdmin;
const fs = __importStar(require("node:fs"));
const admin = __importStar(require("firebase-admin"));
const env_1 = require("./env");
let initialized = false;
function buildCredential() {
    if (env_1.env.firebaseServiceAccountPath && fs.existsSync(env_1.env.firebaseServiceAccountPath)) {
        const raw = fs.readFileSync(env_1.env.firebaseServiceAccountPath, "utf8");
        return admin.credential.cert(JSON.parse(raw));
    }
    if (env_1.env.firebaseProjectId && env_1.env.firebaseClientEmail && env_1.env.firebasePrivateKey) {
        return admin.credential.cert({
            projectId: env_1.env.firebaseProjectId,
            clientEmail: env_1.env.firebaseClientEmail,
            privateKey: env_1.env.firebasePrivateKey,
        });
    }
    return undefined;
}
function ensureFirebaseAdmin() {
    if (initialized || admin.apps.length) {
        initialized = true;
        return;
    }
    const credential = buildCredential();
    if (credential) {
        admin.initializeApp({ credential, projectId: env_1.env.firebaseProjectId || undefined });
    }
    else {
        admin.initializeApp({ projectId: env_1.env.firebaseProjectId || undefined });
    }
    initialized = true;
}
ensureFirebaseAdmin();
exports.adminAuth = admin.auth();
