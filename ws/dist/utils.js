"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoId = exports.isValidYoutubeURL = void 0;
exports.sendError = sendError;
const YT_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?(?!.*\blist=)(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/;
const isValidYoutubeURL = (data) => {
    return data.match(YT_REGEX);
};
exports.isValidYoutubeURL = isValidYoutubeURL;
const getVideoId = (url) => {
    var _a;
    return (_a = url.match(YT_REGEX)) === null || _a === void 0 ? void 0 : _a[1];
};
exports.getVideoId = getVideoId;
function sendError(ws, message) {
    ws.send(JSON.stringify({ type: "error", data: { message } }));
}
