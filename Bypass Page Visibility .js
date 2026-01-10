// ==UserScript==
// @name         Bypass Page Visibility Detection
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Ngăn chặn trang web phát hiện khi bạn chuyển tab hoặc rời khỏi cửa sổ.
// @author       Gemini
// @match        *://missav.ws/*
// @match        *://*.missav.ws/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Ghi đè thuộc tính visibilityState và hidden
    const overwriteProp = (obj, prop, value) => {
        Object.defineProperty(obj, prop, {
            get: () => value,
            set: () => {},
            configurable: true
        });
    };

    overwriteProp(document, 'visibilityState', 'visible');
    overwriteProp(document, 'hidden', false);
    overwriteProp(document, 'webkitVisibilityState', 'visible');

    // 2. Chặn các sự kiện thay đổi trạng thái hiển thị
    const stopEvents = (e) => {
        if (e.type === 'visibilitychange' || e.type === 'webkitvisibilitychange' || e.type === 'blur' || e.type === 'blur') {
            e.stopImmediatePropagation();
        }
    };

    window.addEventListener('visibilitychange', stopEvents, true);
    window.addEventListener('webkitvisibilitychange', stopEvents, true);
    window.addEventListener('blur', stopEvents, true);
    window.addEventListener('mouseleave', stopEvents, true);
    window.addEventListener('focusout', stopEvents, true);

    // 3. Vô hiệu hóa Page Visibility API hoàn toàn
    document.addEventListener('visibilitychange', function(e) {
        e.stopImmediatePropagation();
    }, true);

    console.log("Userscript: Đã kích hoạt chế độ ẩn danh tab!");
})();
