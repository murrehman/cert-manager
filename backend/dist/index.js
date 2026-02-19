"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sslChecker_1 = require("./services/sslChecker");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/check-ssl', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, detailed } = req.query;
    if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'Missing or invalid URL parameter' });
        return;
    }
    try {
        const isDetailed = detailed === 'true';
        const result = yield (0, sslChecker_1.checkSSL)(url, isDetailed);
        res.json(result);
    }
    catch (error) {
        console.error('SSL check error:', error);
        res.status(500).json({ error: error.message || 'Failed to check SSL' });
    }
}));
app.listen(port, () => {
    console.log(`Backend server running at port ${port}`);
});
