"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvFilePath = void 0;
const path_1 = require("path");
const getEnvFilePath = () => {
    const baseDir = (0, path_1.join)(__dirname, '../../../../');
    const envMode = process.env.NODE_ENV || 'dev';
    return [(0, path_1.join)(baseDir, `.env.${envMode}`), (0, path_1.join)(baseDir, '.env')];
};
exports.getEnvFilePath = getEnvFilePath;
//# sourceMappingURL=env-file-path.js.map