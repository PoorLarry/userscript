// ==UserScript==
// @name         VOZ Custom Navigation
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Cấu hình link VOZ ngay tại menu Tampermonkey
// @author       Gemini
// @match        https://voz.vn/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Lấy danh sách link đã lưu hoặc dùng mặc định nếu chưa có
    let defaultLinks = [
        { text: 'F17', url: 'https://voz.vn/f/chuyen-tro-linh-tinh.17/' },
        { text: 'F33', url: 'https://voz.vn/f/diem-bao.33/' }
    ];
    let myLinks = GM_getValue('voz_custom_links', defaultLinks);

    // Đăng ký menu trong Tampermonkey
    GM_registerMenuCommand("⚙️ Cấu hình danh sách Link", function() {
        const currentLinks = JSON.stringify(myLinks, null, 2);
        const newLinksStr = prompt("Nhập danh sách link dạng JSON (hoặc sửa bên dưới):", currentLinks);
        
        if (newLinksStr !== null) {
            try {
                const parsed = JSON.parse(newLinksStr);
                GM_setValue('voz_custom_links', parsed);
                alert("Đã lưu! Đang làm mới trang...");
                location.reload();
            } catch (e) {
                alert("Lỗi định dạng JSON! Hãy kiểm tra kỹ dấu phẩy và ngoặc.");
            }
        }
    });

    function addCustomLinks() {
        const navList = document.querySelector('.p-nav-list');
        if (navList) {
            myLinks.forEach(linkData => {
                const existId = `custom-nav-${linkData.text.replace(/\s+/g, '')}`;
                if (document.getElementById(existId)) return;

                const newLi = document.createElement('li');
                newLi.id = existId;
                newLi.innerHTML = `
                    <div class="p-navEl">
                        <a href="${linkData.url}" class="p-navEl-link" data-nav-id="custom-${linkData.text}">
                            ${linkData.text}
                        </a>
                    </div>
                `;
                navList.appendChild(newLi);
            });
        }
    }

    // Chạy và theo dõi thay đổi giao diện
    addCustomLinks();
    const observer = new MutationObserver(() => addCustomLinks());
    observer.observe(document.body, { childList: true, subtree: true });

})();
