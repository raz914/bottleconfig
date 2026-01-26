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

    function init() {
        var button = $('#bottle-customizer-btn');
        if (!button) return;

        var modal = $('#bottle-customizer-modal');
        var iframe = $('#bottle-customizer-iframe');
        var closeBtn = modal ? $('.bottle-customizer-close', modal) : null;
        var config = getConfig(button);

        if (!modal || !iframe) {
            console.warn('[BottleCustomizer] Missing modal/iframe markup.');
            return;
        }

        function openModal() {
            if (!config.configuratorUrl) {
                showNotification('Customizer URL missing. Please contact support.', 'error');
                return;
            }

            document.body.classList.add('bottle-customizer-open');
            document.body.style.overflow = 'hidden';
            modal.classList.add('active', 'loading');
            iframe.src = config.configuratorUrl;
        }

        function closeModal() {
            document.body.style.overflow = '';
            document.body.classList.remove('bottle-customizer-open');
            modal.classList.remove('active', 'loading');
            iframe.src = '';
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

        window.addEventListener('message', function (event) {
            var payload = event.data;
            if (!payload || payload.type !== 'BOTTLE_CUSTOMIZER_ADD_TO_CART') return;

            if (!config.ajaxUrl || !config.nonce || !config.productId) {
                showNotification('Cart config missing. Please contact support.', 'error');
                return;
            }

            modal.classList.add('loading');

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
                        closeModal();
                        showNotification('Product added to cart!', 'success');
                        if (response.data && response.data.cart_count != null) {
                            updateCartCount(response.data.cart_count);
                        }
                    } else {
                        var msg = (response && response.data && response.data.message) ? response.data.message : 'Error adding to cart';
                        showNotification(msg, 'error');
                        modal.classList.remove('loading');
                    }
                })
                .catch(function () {
                    showNotification('Error adding to cart. Please try again.', 'error');
                    modal.classList.remove('loading');
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
