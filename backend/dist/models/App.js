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
exports.AppModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AppSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['creating', 'building', 'running', 'stopped', 'terminated'],
        default: 'creating'
    },
    image: { type: String, required: true },
    port: { type: Number, required: true },
    url: { type: String },
    userId: { type: String, required: true, index: true },
    namespace: { type: String, required: true },
    resources: {
        cpu: { type: String, required: true },
        memory: { type: String, required: true },
        gpu: { type: String }
    },
    environment: { type: Map, of: String, default: {} },
    volumes: [{
            name: { type: String, required: true },
            mountPath: { type: String, required: true },
            size: { type: String, required: true }
        }],
    logs: [{ type: String }],
    metrics: {
        cpu: { type: Number, default: 0 },
        memory: { type: Number, default: 0 },
        networkIn: { type: Number, default: 0 },
        networkOut: { type: Number, default: 0 }
    },
    kubernetesConfig: {
        deploymentName: { type: String },
        serviceName: { type: String },
        ingressName: { type: String },
        podName: { type: String }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
AppSchema.index({ userId: 1, status: 1 });
AppSchema.index({ namespace: 1 });
AppSchema.index({ createdAt: -1 });
exports.AppModel = mongoose_1.default.model('App', AppSchema);
//# sourceMappingURL=App.js.map