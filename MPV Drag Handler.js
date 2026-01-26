// ==UserScript==
// @name        MPV Drag Handler
// @match       *://*/*
// @grant       none
// @version     1.2
// @description dùng mpv-hander, kéo link sang phải hoặc trái để mở trong mpv
// @author      Gemini-Assistant
// ==/UserScript==

(function() {
    'use strict';

    // Hàm làm sạch URL (Clean URL)
    function cleanURL(url) {
        try {
            let nUrl = new URL(url);
            // Giữ lại các tham số video quan trọng
            const keepParams = ['v', 'list', 't', 'index']; 
            let searchParams = new URLSearchParams(nUrl.search);
            let keys = Array.from(searchParams.keys());
            
            for (let key of keys) {
                if (!keepParams.includes(key)) {
                    searchParams.delete(key);
                }
            }
            nUrl.search = searchParams.toString();
            return nUrl.toString();
        } catch (e) {
            return url;
        }
    }

    // Hàm mã hóa Base64 ĐÚNG CHUẨN script gốc của bạn
    // Script gốc dùng btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "")
    function GM_btoaUrl(url) {
        try {
            return btoa(unescape(encodeURIComponent(url)))
                .replace(/\//g, "_")
                .replace(/\+/g, "-")
                .replace(/\=/g, "");
        } catch (e) {
            return btoa(url).replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "");
        }
    }

    function openMPV(url, clean = false) {
        const finalUrl = clean ? cleanURL(url) : url;
        const bs = GM_btoaUrl(finalUrl);
        const ref = GM_btoaUrl(window.location.href);
        
        // SỬA LỖI TẠI ĐÂY: Sử dụng window.location.assign để Chromium nhận diện Scheme tốt hơn
        // Cấu trúc: mpv://app/base64url/
        const mpvProtocol = `mpv-handler://play/${bs}/?referer=${ref}`;
        
        console.log("Calling Protocol:", mpvProtocol);
        
        // Thay vì gán trực tiếp href, ta dùng cách này để tránh Chromium hiểu lầm là file hệ thống
        const link = document.createElement('a');
        link.href = mpvProtocol;
        link.click();
    }

    function attachDrag(elem) {
        let x1, y1;

        elem.addEventListener('dragstart', function(e) {
            x1 = e.clientX;
            y1 = e.clientY;
            // Cần thiết để Chromium cho phép dragend hoạt động
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = "copyMove";
                e.dataTransfer.setData('text/plain', ''); 
            }
        }, false);

        elem.addEventListener('dragend', function(e) {
            let x2 = e.clientX;
            let y2 = e.clientY;
            
            let diffX = x2 - x1;
            let diffY = y2 - y1;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                // Tìm link trong trường hợp kéo thumbnail hoặc icon
                let target = e.target;
                while (target && !target.href) {
                    target = target.parentNode;
                }
                const targetHref = target ? target.href : null;

                if (targetHref && targetHref.startsWith('http')) {
                    e.preventDefault();
                    if (diffX > 0) {
                        openMPV(targetHref, false); // Phải: Normal
                    } else {
                        openMPV(targetHref, true);  // Trái: Clean
                    }
                }
            }
        }, false);
    }

    attachDrag(document);

    // Hỗ trợ Shadow DOM (YouTube)
    document.addEventListener('mouseover', function(e) {
        if (e.target.shadowRoot && !e.target.dataset.mpvAttached) {
            attachDrag(e.target.shadowRoot);
            e.target.dataset.mpvAttached = "true";
        }
    });
})();
