/**
 * Bottle Customizer Frontend JavaScript
 */
(function () {
    'use strict';

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function getConfig(buttonEl) {
        var data = window.bottleCustomizerData || {};
        var ds = (buttonEl && buttonEl.dataset) ? buttonEl.dataset : {};

        return {
            ajaxUrl: data.ajaxUrl || ds.ajaxUrl || '',
            nonce: data.nonce || ds.nonce || '',
            configuratorUrl: data.configuratorUrl || ds.configuratorUrl || '',
            productId: data.productId || ds.productId || ''
        };
    }

    function showNotification(message, type) {
        var existing = document.querySelectorAll('.bottle-customizer-notification');
        existing.forEach(function (el) { el.remove(); });

        var n = document.createElement('div');
        n.className = 'bottle-customizer-notification ' + (type || 'info');
        n.textContent = message;

        n.style.position = 'fixed';
        n.style.top = '20px';
        n.style.right = '20px';
        n.style.padding = '15px 25px';
        n.style.borderRadius = '8px';
        n.style.fontWeight = '600';
        n.style.zIndex = '1000000';
        n.style.animation = 'slideIn 0.3s ease';
        n.style.background = (type === 'success') ? '#4CAF50' : '#f44336';
        n.style.color = '#ffffff';
        n.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';

        document.body.appendChild(n);

        setTimeout(function () {
            n.style.opacity = '0';
            n.style.transition = 'opacity 300ms ease';
            setTimeout(function () { n.remove(); }, 350);
        }, 3000);
    }

    function updateCartCount(count) {
        var selectors = ['.cart-contents-count', '.cart-count', '.wc-cart-count', '.mini-cart-count'];
        selectors.forEach(function (sel) {
            var el = document.querySelector(sel);
            if (el) {
                el.textContent = String(count);
            }
        });

        // WooCommerce fragment refresh if available
        try {
            var evt = document.createEvent('Event');
            evt.initEvent('wc_fragment_refresh', true, true);
            document.body.dispatchEvent(evt);
        } catch (e) {
            // ignore
        }
    }

    function findCheckoutItemContainer(el) {
        if (!el || !el.closest) return null;
        var selectors = [
            'tr.cart_item',
            'li.cart_item',
            '.wfacp_cart_item',
            '.wfacp-cart-item',
            '.wfacp-order-item',
            '.wfacp-order-summary-item'
        ];
        for (var i = 0; i < selectors.length; i++) {
            var found = el.closest(selectors[i]);
            if (found) return found;
        }
        // Fallback: walk up a few levels and look for the thumb container.
        var node = el.parentElement;
        var depth = 0;
        while (node && node !== document.body && depth < 8) {
            if (node.querySelector && node.querySelector('.wfacp-pro-thumb')) {
                return node;
            }
            node = node.parentElement;
            depth++;
        }
        return null;
    }

    function swapCheckoutThumbnailImages(root) {
        var scope = root || document;
        var customImgs = scope.querySelectorAll('img.bottle-customizer-cart-thumb');
        if (!customImgs.length) return;

        customImgs.forEach(function (customImg) {
            // Skip if already processed
            if (customImg.dataset.bcSwapped === '1') return;

            var frame = customImg.closest('.bc-thumb-frame') || customImg;
            var item = findCheckoutItemContainer(frame);
            if (!item) return;

            // Find the original FunnelKit product thumbnail
            var originalThumb = item.querySelector('.wfacp-pro-thumb img');
            if (!originalThumb) return;

            // Swap original image src to our custom image src
            var customSrc = customImg.src;
            if (customSrc && originalThumb.src !== customSrc) {
                originalThumb.src = customSrc;
                // Remove srcset/sizes to prevent responsive swapping back to default
                originalThumb.removeAttribute('srcset');
                originalThumb.removeAttribute('sizes');
                // Optionally update alt
                if (customImg.alt) {
                    originalThumb.alt = customImg.alt;
                }
            }

            // Mark as processed
            customImg.dataset.bcSwapped = '1';

            // Remove/hide the duplicate custom thumb element
            if (frame && frame.parentNode) {
                frame.parentNode.removeChild(frame);
            }
        });
    }

    function initCheckoutThumbnailSwap() {
        // FunnelKit checkout pages can be used on non-standard templates,
        // so don't rely on body classes. Detect by WFACP container/thumb.
        if (!document.querySelector('#wfacp-e-form') && !document.querySelector('.wfacp-pro-thumb')) return;

        var root = document.querySelector('#wfacp-e-form')
            || document.querySelector('.wfacp-order-summary, .wfacp_order_summary, .wfacp_order_sum, .wfacp_mini_cart_items')
            || document.body;
        var scheduled = false;

        function scheduleSwap() {
            if (scheduled) return;
            scheduled = true;
            window.requestAnimationFrame(function () {
                scheduled = false;
                swapCheckoutThumbnailImages(root);
            });
        }

        swapCheckoutThumbnailImages(root);

        var observer = new MutationObserver(function () {
            scheduleSwap();
        });

        observer.observe(root, { childList: true, subtree: true });
    }

    function init() {
        var button = $('#bottle-customizer-btn');
        if (!button) return;

        var modal = $('#bottle-customizer-modal');
        var iframe = $('#bottle-customizer-iframe');
        if (modal && modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
        var closeBtn = modal ? $('.bottle-customizer-close', modal) : null;
        var config = getConfig(button);

        if (!modal || !iframe) {
            console.warn('[BottleCustomizer] Missing modal/iframe markup.');
            return;
        }

        var savedScrollTop = 0;

        function openModal() {
            if (!config.configuratorUrl) {
                showNotification('Customizer URL missing. Please contact support.', 'error');
                return;
            }

            // Save current scroll position
            savedScrollTop = window.scrollY || document.documentElement.scrollTop;

            document.body.classList.add('bottle-customizer-open');

            // Standard overflow hidden
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            // Mobile scroll lock: fix body position
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = '-' + savedScrollTop + 'px';

            modal.classList.add('active', 'loading');
            iframe.src = config.configuratorUrl;
        }

        function closeModal() {
            // Restore styles
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';

            document.body.classList.remove('bottle-customizer-open');
            modal.classList.remove('active', 'loading');
            iframe.src = '';

            // Restore scroll position
            window.scrollTo(0, savedScrollTop);
        }

        button.addEventListener('click', function (e) {
            e.preventDefault();
            openModal();
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                closeModal();
            });
        }

        document.addEventListener('keyup', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        iframe.addEventListener('load', function () {
            modal.classList.remove('loading');
        });

        // Helper to send status back to iframe
        function postStatusToIframe(status, message) {
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'BOTTLE_CUSTOMIZER_ADD_TO_CART_STATUS',
                    status: status,
                    message: message || ''
                }, '*');
            }
        }

        window.addEventListener('message', function (event) {
            var payload = event.data;
            if (!payload || !payload.type) return;

            if (payload.type === 'BOTTLE_CUSTOMIZER_CLOSE') {
                closeModal();
                return;
            }
            if (payload.type !== 'BOTTLE_CUSTOMIZER_ADD_TO_CART') return;

            if (!config.ajaxUrl || !config.nonce || !config.productId) {
                postStatusToIframe('error', 'Cart config missing. Please contact support.');
                showNotification('Cart config missing. Please contact support.', 'error');
                return;
            }

            // Show loading state on modal and notify iframe
            modal.classList.add('loading');
            postStatusToIframe('loading');

            var fd = new FormData();
            fd.append('action', 'bottle_customizer_add_to_cart');
            fd.append('nonce', config.nonce);
            fd.append('product_id', String(config.productId));
            fd.append('customization', JSON.stringify(payload.data || {}));

            fetch(config.ajaxUrl, {
                method: 'POST',
                credentials: 'same-origin',
                body: fd
            })
                .then(function (r) { return r.json(); })
                .then(function (response) {
                    console.log('[BottleCustomizer] add_to_cart response', response);
                    if (response && response.success) {
                        postStatusToIframe('success');
                        // Success notification disabled (requested).
                        if (response.data && response.data.cart_count != null) {
                            updateCartCount(response.data.cart_count);
                        }
                        // Close modal after a brief delay so the success state feels smooth
                        setTimeout(function () {
                            closeModal();
                        }, 300);
                    } else {
                        var msg = (response && response.data && response.data.message) ? response.data.message : 'Error adding to cart';
                        postStatusToIframe('error', msg);
                        showNotification(msg, 'error');
                        modal.classList.remove('loading');
                    }
                })
                .catch(function () {
                    var msg = 'Error adding to cart. Please try again.';
                    postStatusToIframe('error', msg);
                    showNotification(msg, 'error');
                    modal.classList.remove('loading');
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
            initCheckoutThumbnailSwap();
        });
    } else {
        init();
        initCheckoutThumbnailSwap();
    }
})();
