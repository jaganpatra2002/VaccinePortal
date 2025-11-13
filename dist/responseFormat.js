"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormat = void 0;
const ResponseFormat = (code, message, logs) => {
    return {
        statusCode: code,
        body: JSON.stringify({
            message: message,
            logs: logs
        })
    };
};
exports.ResponseFormat = ResponseFormat;
