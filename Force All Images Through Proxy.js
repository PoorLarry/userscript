// ==UserScript==
// @name         Force All Images Through Proxy
// @namespace    https://docs.scriptcat.org/
// @version      0.1.0
// @description  Ép toàn bộ ảnh (kể cả avatar, data.voz.vn và lazyload) qua Proxy
// @author       You
// @match        https://voz.vn/t/*
// @match        https://voz.vn/f/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const PROXY_PREFIX = 'https://images.weserv.nl/?url=';

    function getProxiedUrl(originalUrl) {
        if (!originalUrl) return originalUrl;

        // Bỏ qua nếu đã qua proxy hoặc là data base64/blob
        if (
            originalUrl.includes('images.weserv.nl') ||
            originalUrl.startsWith('data:') ||
            originalUrl.startsWith('blob:')
        ) {
            return originalUrl;
        }

        // Chuyển link tương đối thành tuyệt đối
        let absoluteUrl = originalUrl;
        if (originalUrl.startsWith('//')) {
            absoluteUrl = window.location.protocol + originalUrl;
        } else if (originalUrl.startsWith('/')) {
            absoluteUrl = window.location.origin + originalUrl;
        }

        // Bỏ qua ảnh giao diện tĩnh local (icon, emo mặc định của XenForo)
        if (absoluteUrl.includes('/styles/') || absoluteUrl.includes('/smilies/')) {
            return originalUrl;
        }

        // Chuyển sang proxy
        const cleanUrl = absoluteUrl.replace(/^https?:\/\//, '');
        return PROXY_PREFIX + encodeURIComponent(cleanUrl);
    }

    function rewriteElement(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

        // 1. Xử lý thẻ <img>
        if (node.tagName === 'IMG') {
            const attributes = ['src', 'data-src', 'data-url'];
            attributes.forEach(attr => {
                const val = node.getAttribute(attr);
                if (val && !val.includes('images.weserv.nl')) {
                    const newUrl = getProxiedUrl(val);
                    if (newUrl !== val) {
                        node.setAttribute(attr, newUrl);
                    }
                }
            });

            // Xóa srcset để tránh trình duyệt tự chọn link gốc
            if (node.hasAttribute('srcset')) {
                node.removeAttribute('srcset');
            }
        }

        // 2. Xử lý thẻ <a> (lightbox/xem ảnh phóng to)
        if (node.tagName === 'A') {
            const href = node.getAttribute('href');
            if (href && /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(href)) {
                if (!href.includes('images.weserv.nl')) {
                    node.setAttribute('href', getProxiedUrl(href));
                }
            }
        }
    }

    function scanAndRewrite(targetNode) {
        rewriteElement(targetNode);
        if (targetNode.querySelectorAll) {
            targetNode.querySelectorAll('img, a[href]').forEach(rewriteElement);
        }
    }

    // Theo dõi DOM thêm mới hoặc thay đổi thuộc tính (Lazyload)
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(scanAndRewrite);
            } else if (mutation.type === 'attributes' && (mutation.attributeName === 'src' || mutation.attributeName === 'data-src')) {
                rewriteElement(mutation.target);
            }
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src', 'data-src', 'data-url']
    });

    // Quét lại toàn trang khi DOM sẵn sàng
    document.addEventListener('DOMContentLoaded', () => {
        scanAndRewrite(document.body);
    });
})();
