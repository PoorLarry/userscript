// ==UserScript==
// @name         YouTube Live Chat Lite
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Làm nhẹ khung chat YouTube bằng cách ẩn avatar và tối ưu render
// @author       Gemini
// @match        https://www.youtube.com/live_chat*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        /* Ẩn ảnh đại diện để giảm HTTP request và render
        yt-img-shadow { display: none !important; }*/

        /* Ẩn các icon badge của channel (member, verify) */
        .yt-live-chat-author-badge-renderer { display: none !important; }

        /* Giảm khoảng cách và làm gọn tin nhắn */
        yt-live-chat-text-message-renderer {
            padding: 2px 8px !important;
            font-size: 13px !important;
        }

        /* Ẩn phần sticker/super chat rườm rà (tùy chọn) */
        yt-live-chat-ticker-renderer { display: none !important; }

        /* Ẩn nút thả tim animation bay bay gây lag GPU */
        #reaction-control-panel { display: none !important; }
    `;
    document.head.appendChild(style);

    // Tự động dọn dẹp tin nhắn cũ để giải phóng RAM/DOM
    setInterval(() => {
        const chatItems = document.querySelectorAll('yt-live-chat-text-message-renderer');
        if (chatItems.length > 50) { // Chỉ giữ lại 50 tin nhắn mới nhất
            for (let i = 0; i < chatItems.length - 50; i++) {
                chatItems[i].remove();
            }
        }
    }, 5000);
})();
