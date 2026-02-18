<?php
/**
 * Plugin Name: Befit Bottle Customizer
 * Plugin URI: https://example.com
 * Description: Adds a "Personalize" button to bottle products that opens a fullscreen customizer and adds customized products to WooCommerce cart.
 * Version: 1.0.3
 * Author: razi ul hassan
 * Author URI: https://portfolio-razi.netlify.app/
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: bottle-customizer
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

define('BOTTLE_CUSTOMIZER_VERSION', '1.0.0');
define('BOTTLE_CUSTOMIZER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BOTTLE_CUSTOMIZER_PLUGIN_URL', plugin_dir_url(__FILE__));

// Target product slug
define('BOTTLE_CUSTOMIZER_PRODUCT_SLUG', 'be-fit-shakebeker');

// ── Customization pricing constants ──
define('BOTTLE_CUSTOMIZER_FRONT_SURCHARGE', 0.00);
define('BOTTLE_CUSTOMIZER_BACK_SURCHARGE',  6.00);

/**
 * Check whether a given side has any customization.
 */
function bottle_customizer_side_has_customization($customization, $side = 'front') {
    $side = ($side === 'back') ? 'back' : 'front';
    return !empty($customization[$side . '_text'])
        || !empty($customization[$side . '_monogram'])
        || !empty($customization[$side . '_graphic']);
}

/**
 * Return the surcharge amount (float) for a given side.
 */
function bottle_customizer_side_surcharge($side = 'front') {
    return ($side === 'back') ? BOTTLE_CUSTOMIZER_BACK_SURCHARGE : BOTTLE_CUSTOMIZER_FRONT_SURCHARGE;
}

/**
 * Compute total customization surcharge for a cart/order item.
 */
function bottle_customizer_total_surcharge($customization) {
    $total = 0;
    if (bottle_customizer_side_has_customization($customization, 'front')) {
        $total += bottle_customizer_side_surcharge('front');
    }
    if (bottle_customizer_side_has_customization($customization, 'back')) {
        $total += bottle_customizer_side_surcharge('back');
    }
    return $total;
}

/**
 * Return a formatted price string like "+€0,00" / "+€6,00" for a surcharge amount.
 */
function bottle_customizer_format_surcharge($amount) {
    $formatted = function_exists('wc_price') ? strip_tags(wc_price($amount)) : '€' . number_format($amount, 2, ',', '.');
    return '+' . $formatted;
}

/**
 * True when WooCommerce is active/loaded.
 */
function bottle_customizer_is_woocommerce_active() {
    return class_exists('WooCommerce') && function_exists('WC');
}

/**
 * Plugin enabled?
 */
function bottle_customizer_is_enabled() {
    return get_option('bottle_customizer_enabled', 'yes') === 'yes';
}

/**
 * Get target product ID (0 means "not set").
 */
function bottle_customizer_get_target_product_id() {
    return absint(get_option('bottle_customizer_target_product_id', 0));
}

/**
 * Check if the given product is the configured target.
 * Falls back to the legacy slug constant if no product ID is configured.
 */
function bottle_customizer_is_target_product($product) {
    if (!$product || !is_object($product) || !method_exists($product, 'get_id')) {
        return false;
    }

    $target_id = bottle_customizer_get_target_product_id();
    if ($target_id > 0) {
        return absint($product->get_id()) === $target_id;
    }

    // Backwards-compatible fallback (legacy behavior)
    return method_exists($product, 'get_slug') && $product->get_slug() === BOTTLE_CUSTOMIZER_PRODUCT_SLUG;
}

/**
 * Convert a slug like "dark-blue" to "Dark Blue" for display.
 */
function bottle_customizer_pretty_value($value) {
    $value = (string) $value;
    $value = str_replace(array('-', '_'), ' ', $value);
    return trim(ucwords($value));
}

/**
 * Attempt to detect a "color" attribute name on a variable product.
 * Examples: "pa_color", "pa_kleur", "color", "kleur".
 */
function bottle_customizer_detect_color_attribute_name($product) {
    if (!is_object($product) || !method_exists($product, 'get_attributes')) {
        return '';
    }
    $attrs = $product->get_attributes();
    foreach ($attrs as $attr) {
        // $attr can be WC_Product_Attribute or string depending on context, be defensive.
        $name = '';
        if (is_object($attr) && method_exists($attr, 'get_name')) {
            $name = (string) $attr->get_name();
        } elseif (is_string($attr)) {
            $name = $attr;
        }
        $lname = strtolower($name);
        if ($lname && (strpos($lname, 'color') !== false || strpos($lname, 'kleur') !== false)) {
            return $name;
        }
    }
    return '';
}

/**
 * Format the chosen color for display, attempting to resolve a term name when possible.
 */
function bottle_customizer_format_color_display($color_slug, $color_attr_name = '') {
    $color_slug = sanitize_title((string) $color_slug);
    if ($color_attr_name && function_exists('taxonomy_exists') && taxonomy_exists($color_attr_name) && function_exists('get_term_by')) {
        $term = get_term_by('slug', $color_slug, $color_attr_name);
        if ($term && !is_wp_error($term) && !empty($term->name)) {
            return (string) $term->name;
        }
    }
    return bottle_customizer_pretty_value($color_slug);
}

/**
 * Check if WooCommerce is active
 */
function bottle_customizer_check_woocommerce() {
    if (!bottle_customizer_is_woocommerce_active()) {
        add_action('admin_notices', function() {
            echo '<div class="error"><p><strong>Bottle Customizer</strong> requires WooCommerce to be installed and active.</p></div>';
        });
        return false;
    }
    return true;
}
add_action('plugins_loaded', 'bottle_customizer_check_woocommerce');

/**
 * Allow <details> and <summary> tags in wp_kses_post so the cart dropdown renders correctly.
 */
function bottle_customizer_allow_details_summary_tags($allowed_tags, $context = '') {
    if ($context === 'post') {
        $allowed_tags['details'] = array(
            'class' => true,
            'open'  => true,
        );
        $allowed_tags['summary'] = array(
            'class' => true,
        );
    }
    return $allowed_tags;
}
add_filter('wp_kses_allowed_html', 'bottle_customizer_allow_details_summary_tags', 10, 2);

/**
 * Register settings + admin page
 */
function bottle_customizer_register_settings() {
    register_setting(
        'bottle_customizer_settings',
        'bottle_customizer_enabled',
        array(
            'type' => 'string',
            'sanitize_callback' => function($value) {
                return $value === 'yes' ? 'yes' : 'no';
            },
            'default' => 'yes',
        )
    );

    register_setting(
        'bottle_customizer_settings',
        'bottle_customizer_target_product_id',
        array(
            'type' => 'integer',
            'sanitize_callback' => function($value) {
                $value = absint($value);
                if ($value === 0) {
                    return 0;
                }

                // Validate product exists (only if Woo is active).
                if (bottle_customizer_is_woocommerce_active() && function_exists('wc_get_product')) {
                    $p = wc_get_product($value);
                    if (!$p) {
                        add_settings_error(
                            'bottle_customizer_target_product_id',
                            'bottle_customizer_invalid_product',
                            __('Invalid product ID. Please enter a valid WooCommerce product ID.', 'bottle-customizer')
                        );
                        return 0;
                    }
                }

                return $value;
            },
            'default' => 0,
        )
    );

    add_settings_section(
        'bottle_customizer_main',
        __('Bottle Customizer Settings', 'bottle-customizer'),
        function() {
            echo '<p>' . esc_html__('Choose which product should show the “Personalize” button.', 'bottle-customizer') . '</p>';
        },
        'bottle-customizer'
    );

    add_settings_field(
        'bottle_customizer_enabled',
        __('Enable customizer', 'bottle-customizer'),
        'bottle_customizer_field_enabled',
        'bottle-customizer',
        'bottle_customizer_main'
    );

    add_settings_field(
        'bottle_customizer_target_product_id',
        __('Target product (ID)', 'bottle-customizer'),
        'bottle_customizer_field_target_product_id',
        'bottle-customizer',
        'bottle_customizer_main'
    );
}
add_action('admin_init', 'bottle_customizer_register_settings');

function bottle_customizer_add_admin_menu() {
    $cap = bottle_customizer_is_woocommerce_active() ? 'manage_woocommerce' : 'manage_options';
    $parent = bottle_customizer_is_woocommerce_active() ? 'woocommerce' : 'options-general.php';

    add_submenu_page(
        $parent,
        __('Bottle Customizer', 'bottle-customizer'),
        __('Bottle Customizer', 'bottle-customizer'),
        $cap,
        'bottle-customizer',
        'bottle_customizer_render_settings_page'
    );
}
add_action('admin_menu', 'bottle_customizer_add_admin_menu');

function bottle_customizer_render_settings_page() {
    if (!current_user_can(bottle_customizer_is_woocommerce_active() ? 'manage_woocommerce' : 'manage_options')) {
        return;
    }

    echo '<div class="wrap">';
    echo '<h1>' . esc_html__('Bottle Customizer', 'bottle-customizer') . '</h1>';
    echo '<form method="post" action="options.php">';
    settings_fields('bottle_customizer_settings');
    do_settings_sections('bottle-customizer');
    submit_button();
    echo '</form>';
    echo '</div>';
}

function bottle_customizer_field_enabled() {
    $value = get_option('bottle_customizer_enabled', 'yes');
    echo '<label>';
    echo '<input type="checkbox" name="bottle_customizer_enabled" value="yes" ' . checked($value, 'yes', false) . ' />';
    echo ' ' . esc_html__('Show the Personalize button on the configured product', 'bottle-customizer');
    echo '</label>';
}

function bottle_customizer_field_target_product_id() {
    $value = bottle_customizer_get_target_product_id();
    echo '<input type="number" min="0" step="1" name="bottle_customizer_target_product_id" value="' . esc_attr($value) . '" class="regular-text" />';

    $help = __('Enter a WooCommerce Product ID. Tip: edit a product in WP Admin and check the URL for “post=123”.', 'bottle-customizer');
    echo '<p class="description">' . esc_html($help) . '</p>';

    if ($value > 0 && bottle_customizer_is_woocommerce_active() && function_exists('wc_get_product')) {
        $p = wc_get_product($value);
        if ($p) {
            echo '<p class="description"><strong>' . esc_html__('Selected:', 'bottle-customizer') . '</strong> ' . esc_html($p->get_name()) . '</p>';
        }
    }
}

/**
 * Enqueue frontend styles and scripts
 */
function bottle_customizer_enqueue_assets() {
    // Avoid fatal errors if WooCommerce isn't active.
    if (!bottle_customizer_is_woocommerce_active()) {
        return;
    }
    if (!bottle_customizer_is_enabled()) {
        return;
    }

    $css_path = BOTTLE_CUSTOMIZER_PLUGIN_DIR . 'assets/css/frontend.css';
    $js_path  = BOTTLE_CUSTOMIZER_PLUGIN_DIR . 'assets/js/frontend.js';
    $css_ver  = file_exists($css_path) ? (string) filemtime($css_path) : BOTTLE_CUSTOMIZER_VERSION;
    $js_ver   = file_exists($js_path) ? (string) filemtime($js_path) : BOTTLE_CUSTOMIZER_VERSION;

    // Enqueue styles site-wide (needed for cart drawer / mini-cart on any page)
    wp_enqueue_style(
        'bottle-customizer-frontend',
        BOTTLE_CUSTOMIZER_PLUGIN_URL . 'assets/css/frontend.css',
        array(),
        $css_ver
    );

    // Enqueue scripts site-wide.
    // FunnelKit checkout pages are often regular WP pages (is_checkout() can be false),
    // but we still need the JS to add helper classes for thumbnail hiding/sizing.
    $is_target_product = false;
    $product_id = 0;

    if (function_exists('is_product') && is_product() && function_exists('wc_get_product')) {
        $product_id = function_exists('get_queried_object_id') ? absint(get_queried_object_id()) : 0;
        $product = $product_id ? wc_get_product($product_id) : null;
        if ($product && bottle_customizer_is_target_product($product)) {
            $is_target_product = true;
        }
    }

    wp_enqueue_script(
        'bottle-customizer-frontend',
        BOTTLE_CUSTOMIZER_PLUGIN_URL . 'assets/js/frontend.js',
        array(),
        $js_ver,
        true
    );

    if ($is_target_product) {
        // Helpful debug signal
        wp_add_inline_script(
            'bottle-customizer-frontend',
            'console.log("[BottleCustomizer] assets loaded", { productId: ' . (int) $product_id . ' });',
            'after'
        );

        // Build variation data for the frontend (empty array for simple products).
        $variations_data = array();
        if ($product && is_a($product, 'WC_Product_Variable')) {
            $variations_data = $product->get_available_variations();
        }

        // Pass data to JavaScript
        wp_localize_script('bottle-customizer-frontend', 'bottleCustomizerData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('bottle_customizer_nonce'),
            'configuratorUrl' => BOTTLE_CUSTOMIZER_PLUGIN_URL . 'configurator/index.html',
            'productId' => $product_id,
            'variations' => $variations_data,
        ));
    }
}
add_action('wp_enqueue_scripts', 'bottle_customizer_enqueue_assets');

/**
 * Add the "Personalize" button to product page
 */
function bottle_customizer_add_personalize_button() {
    if (!bottle_customizer_is_woocommerce_active()) {
        return;
    }
    if (!bottle_customizer_is_enabled()) {
        return;
    }

    global $product;
    
    if (!$product || !bottle_customizer_is_target_product($product)) {
        return;
    }

    $configurator_url = BOTTLE_CUSTOMIZER_PLUGIN_URL . 'configurator/index.html';
    $ajax_url = admin_url('admin-ajax.php');
    $nonce = wp_create_nonce('bottle_customizer_nonce');

    echo '<button type="button"
        id="bottle-customizer-btn"
        class="bottle-customizer-btn"
        data-configurator-url="' . esc_url($configurator_url) . '"
        data-ajax-url="' . esc_url($ajax_url) . '"
        data-nonce="' . esc_attr($nonce) . '"
        data-product-id="' . esc_attr($product->get_id()) . '">
        <span class="btn-text">PERSONALIZE</span>
    </button>';
    
}
add_action('woocommerce_after_add_to_cart_button', 'bottle_customizer_add_personalize_button');

/**
 * Render the modal at body level to avoid stacking context issues with sticky headers.
 */
function bottle_customizer_render_modal() {
    static $rendered = false;
    if ($rendered) {
        return;
    }
    $rendered = true;

    if (!bottle_customizer_is_woocommerce_active()) {
        return;
    }
    if (!bottle_customizer_is_enabled()) {
        return;
    }
    if (!function_exists('is_product') || !is_product()) {
        return;
    }
    if (!function_exists('wc_get_product')) {
        return;
    }

    $product_id = function_exists('get_queried_object_id') ? absint(get_queried_object_id()) : 0;
    $product = $product_id ? wc_get_product($product_id) : null;
    if (!$product || !bottle_customizer_is_target_product($product)) {
        return;
    }

    echo '<div id="bottle-customizer-modal" class="bottle-customizer-modal" aria-hidden="true">
        <div class="bottle-customizer-modal-content" role="dialog" aria-modal="true">
            <iframe id="bottle-customizer-iframe" class="bottle-customizer-iframe" src="" frameborder="0"></iframe>
        </div>
    </div>';
}
add_action('wp_footer', 'bottle_customizer_render_modal', 5);

/**
 * Disable WooCommerce "added to cart" notices for customizer flow.
 */
function bottle_customizer_disable_add_to_cart_notice($message = '', $products = array(), $show_qty = false) {
    return '';
}

/**
 * Handle AJAX request to add customized product to cart
 */
function bottle_customizer_add_to_cart() {
    if (!bottle_customizer_is_woocommerce_active()) {
        wp_send_json_error(array('message' => 'WooCommerce is not active'));
        return;
    }

    // Verify nonce
    $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
    if (!$nonce || !wp_verify_nonce($nonce, 'bottle_customizer_nonce')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }
    
    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
    $customization_data = isset($_POST['customization']) ? $_POST['customization'] : array();

    // Support JSON payloads (e.g. fetch/FormData) in addition to jQuery's nested POST object.
    if (is_string($customization_data)) {
        $decoded = json_decode(wp_unslash($customization_data), true);
        if (is_array($decoded)) {
            $customization_data = $decoded;
        } else {
            $customization_data = array();
        }
    }

    if ($product_id <= 0) {
        wp_send_json_error(array('message' => 'Invalid product'));
        return;
    }

    // Ensure cart/session is loaded in admin-ajax context.
    if (function_exists('wc_load_cart')) {
        wc_load_cart();
    } else {
        if (method_exists(WC(), 'frontend_includes')) {
            WC()->frontend_includes();
        }
        if (method_exists(WC(), 'initialize_session')) {
            WC()->initialize_session();
        }
        if (method_exists(WC(), 'initialize_cart')) {
            WC()->initialize_cart();
        }
    }
    if (!WC()->cart) {
        wp_send_json_error(array('message' => 'Cart is not available'));
        return;
    }
    if (WC()->session && method_exists(WC()->session, 'set_customer_session_cookie')) {
        WC()->session->set_customer_session_cookie(true);
    }
    
    // Validate product
    $product = wc_get_product($product_id);
    if (!$product) {
        wp_send_json_error(array('message' => 'Product not found'));
        return;
    }
    if (method_exists($product, 'is_purchasable') && !$product->is_purchasable()) {
        wp_send_json_error(array('message' => 'Product is not purchasable'));
        return;
    }
    
    // Process and save images temporarily
    $front_image_url = '';
    $back_image_url = '';
    
    if (!empty($customization_data['frontImage'])) {
        $front_image_url = bottle_customizer_save_temp_image($customization_data['frontImage'], 'front');
    }
    
    if (!empty($customization_data['backImage'])) {
        $back_image_url = bottle_customizer_save_temp_image($customization_data['backImage'], 'back');
    }
    
    $front_design_url = '';
    $back_design_url = '';
    $preview_pdf_url = '';

    if (!empty($customization_data['frontDesignImage'])) {
        $front_design_url = bottle_customizer_save_temp_image($customization_data['frontDesignImage'], 'front-design');
    }

    if (!empty($customization_data['backDesignImage'])) {
        $back_design_url = bottle_customizer_save_temp_image($customization_data['backDesignImage'], 'back-design');
    }

    if (!empty($customization_data['previewPdf'])) {
        $preview_pdf_url = bottle_customizer_save_temp_image($customization_data['previewPdf'], 'preview');
    }

    // Prepare cart item data
    $cart_item_data = array(
        'bottle_customization' => array(
            'color' => sanitize_text_field($customization_data['color'] ?? ''),
            'front_text' => sanitize_text_field($customization_data['frontText'] ?? ''),
            'back_text' => sanitize_text_field($customization_data['backText'] ?? ''),
            'front_monogram' => sanitize_text_field($customization_data['frontMonogram'] ?? ''),
            'back_monogram' => sanitize_text_field($customization_data['backMonogram'] ?? ''),
            'front_graphic' => sanitize_text_field($customization_data['frontGraphic'] ?? ''),
            'back_graphic' => sanitize_text_field($customization_data['backGraphic'] ?? ''),
            'front_graphic_src' => bottle_customizer_sanitize_graphic_src($customization_data['frontGraphicSrc'] ?? ''),
            'back_graphic_src' => bottle_customizer_sanitize_graphic_src($customization_data['backGraphicSrc'] ?? ''),
            'font' => sanitize_text_field($customization_data['font'] ?? ''),
            'monogram_style' => sanitize_text_field($customization_data['monogramStyle'] ?? ''),
            'front_monogram_style' => sanitize_text_field($customization_data['frontMonogramStyle'] ?? ''),
            'back_monogram_style' => sanitize_text_field($customization_data['backMonogramStyle'] ?? ''),
            'front_image_url' => $front_image_url,
            'back_image_url' => $back_image_url,
            'front_design_url' => $front_design_url,
            'back_design_url' => $back_design_url,
            'preview_pdf_url' => $preview_pdf_url,
        ),
        'unique_key' => md5(microtime() . rand()), // Make each customization unique
    );

    // Compute and store per-side surcharges so display helpers and price hooks have stable values.
    $c = &$cart_item_data['bottle_customization'];
    $c['front_amount'] = bottle_customizer_side_has_customization($c, 'front') ? bottle_customizer_side_surcharge('front') : 0;
    $c['back_amount']  = bottle_customizer_side_has_customization($c, 'back')  ? bottle_customizer_side_surcharge('back')  : 0;
    unset($c);
    
    // Add to cart
    wc_clear_notices();
    add_filter('wc_add_to_cart_message_html', 'bottle_customizer_disable_add_to_cart_notice', 10, 3);
    add_filter('woocommerce_add_to_cart_message_html', 'bottle_customizer_disable_add_to_cart_notice', 10, 3);

    $quantity = 1;
    $variation_id = 0;
    $variation = array();
    $color_attr_name = '';

    // If target product is variable, we must provide a variation_id + attributes.
    if (is_a($product, 'WC_Product_Variable')) {
        $color_raw = isset($customization_data['color']) ? (string) $customization_data['color'] : '';
        $color = $color_raw !== '' ? sanitize_title($color_raw) : '';
        $color_attr_name = bottle_customizer_detect_color_attribute_name($product);

        // Try to find a purchasable variation that matches the selected color.
        $variations = $product->get_available_variations();
        $chosen = null;
        $available_attr_values = array();

        foreach ($variations as $v) {
            if (empty($v['variation_id']) || empty($v['attributes']) || !is_array($v['attributes'])) {
                continue;
            }

            $variation_product = wc_get_product((int) $v['variation_id']);
            if (!$variation_product || (method_exists($variation_product, 'is_purchasable') && !$variation_product->is_purchasable())) {
                continue;
            }
            if (method_exists($variation_product, 'is_in_stock') && !$variation_product->is_in_stock()) {
                continue;
            }

            $attrs = $v['attributes'];
            foreach ($attrs as $k => $val) {
                $available_attr_values[$k][] = (string) $val;
            }

            if ($color) {
                foreach ($attrs as $k => $val) {
                    $val_norm = sanitize_title((string) $val);
                    // Exact match OR fuzzy contains match (handles e.g. "aqua-blue", "aqua_blue", etc.)
                    if ($val_norm !== '' && ($val_norm === $color || strpos($val_norm, $color) !== false || strpos($color, $val_norm) !== false)) {
                        $chosen = $v;
                        break 2;
                    }
                }
            }
        }

        // If no color match found, fall back to the first purchasable/in-stock variation.
        if (!$chosen) {
            foreach ($variations as $v) {
                if (empty($v['variation_id']) || empty($v['attributes']) || !is_array($v['attributes'])) {
                    continue;
                }
                $variation_product = wc_get_product((int) $v['variation_id']);
                if (!$variation_product || (method_exists($variation_product, 'is_purchasable') && !$variation_product->is_purchasable())) {
                    continue;
                }
                if (method_exists($variation_product, 'is_in_stock') && !$variation_product->is_in_stock()) {
                    continue;
                }
                $chosen = $v;
                break;
            }
        }

        // As a last resort, try child variations directly (some configs return empty available variations).
        if (!$chosen) {
            $children = $product->get_children();
            foreach ($children as $child_id) {
                $variation_product = wc_get_product((int) $child_id);
                if (!$variation_product || (method_exists($variation_product, 'is_purchasable') && !$variation_product->is_purchasable())) {
                    continue;
                }
                if (method_exists($variation_product, 'is_in_stock') && !$variation_product->is_in_stock()) {
                    continue;
                }

                $variation_id = (int) $child_id;
                if (method_exists($variation_product, 'get_variation_attributes')) {
                    $variation = $variation_product->get_variation_attributes();
                }
                break;
            }
        } else {
            $variation_id = (int) $chosen['variation_id'];
            foreach ($chosen['attributes'] as $k => $val) {
                $variation[$k] = (string) $val;
            }
        }

        if ($variation_id <= 0) {
            wp_send_json_error(array(
                'message' => 'No purchasable variation found for this product',
                'debug' => array(
                    'product_id' => $product_id,
                    'color' => $color_raw,
                    'available_variations_count' => is_array($variations) ? count($variations) : 0,
                    'available_attribute_values' => $available_attr_values,
                ),
            ));
            return;
        }
    }

    // Store detected color attribute name for later display override (cart/checkout/order).
    if ($color_attr_name) {
        $cart_item_data['bottle_customization']['color_attribute'] = $color_attr_name;
    }

    $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, $variation_id, $variation, $cart_item_data);
    wc_clear_notices();
    remove_filter('wc_add_to_cart_message_html', 'bottle_customizer_disable_add_to_cart_notice', 10);
    remove_filter('woocommerce_add_to_cart_message_html', 'bottle_customizer_disable_add_to_cart_notice', 10);
    
    if ($cart_item_key) {
        wp_send_json_success(array(
            'cart_url' => wc_get_cart_url(),
            'cart_count' => WC()->cart->get_cart_contents_count(),
        ));
    } else {
        $errors = wc_get_notices('error');
        $msg = 'Failed to add product to cart';
        if (!empty($errors) && is_array($errors)) {
            $first = reset($errors);
            if (is_array($first) && !empty($first['notice'])) {
                $msg = wp_strip_all_tags($first['notice']);
            }
        }
        wp_send_json_error(array(
            'message' => $msg,
            'debug' => array(
                'product_id' => $product_id,
                'variation_id' => $variation_id,
                'color' => isset($customization_data['color']) ? (string) $customization_data['color'] : '',
            ),
        ));
    }
}
add_action('wp_ajax_bottle_customizer_add_to_cart', 'bottle_customizer_add_to_cart');
add_action('wp_ajax_nopriv_bottle_customizer_add_to_cart', 'bottle_customizer_add_to_cart');

/**
 * Save base64 media (images + generated preview PDF) to temporary directory.
 */
function bottle_customizer_save_temp_image($base64_image, $prefix) {
    $base64_image = (string) $base64_image;

    // Detect mime + strip data URI prefix if present.
    $ext = 'png';
    if (preg_match('/^data:([a-z0-9.+\/-]+);base64,/i', $base64_image, $m)) {
        $mime = strtolower((string) $m[1]);
        if ($mime === 'image/png') {
            $ext = 'png';
        } elseif ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            $ext = 'jpg';
        } elseif ($mime === 'image/webp') {
            $ext = 'webp';
        } elseif ($mime === 'application/pdf') {
            $ext = 'pdf';
        } else {
            return '';
        }
        $base64_image = preg_replace('/^data:[a-z0-9.+\/-]+;base64,/i', '', $base64_image);
    }

    $base64_image = preg_replace('/\s+/', '', $base64_image);
    $image_data = base64_decode($base64_image, true);

    if (!$image_data) {
        return '';
    }
    
    // Create temp directory if it doesn't exist
    $upload_dir = wp_upload_dir();
    $temp_dir = trailingslashit($upload_dir['basedir']) . 'bottle-customizer-temp/';
    
    if (!file_exists($temp_dir)) {
        wp_mkdir_p($temp_dir);
        // Add index.php for security
        file_put_contents($temp_dir . 'index.php', '<?php // Silence is golden');
    }
    
    // Generate unique filename
    $filename = $prefix . '-' . uniqid() . '.' . $ext;
    $filepath = $temp_dir . $filename;
    
    // Save the image
    $written = @file_put_contents($filepath, $image_data);
    if (!$written || !file_exists($filepath)) {
        return '';
    }
    
    // Return the URL
    return trailingslashit($upload_dir['baseurl']) . 'bottle-customizer-temp/' . $filename;
}

/**
 * Sanitize a configurator gallery graphic src (relative path like "gallery/.../file.svg").
 * We only accept gallery paths to avoid loading arbitrary remote URLs.
 */
function bottle_customizer_sanitize_graphic_src($src) {
    $src = trim((string) $src);
    if ($src === '') return '';
    $src = str_replace('\\', '/', $src);

    // Disallow URLs, data URIs, blobs, and path traversal.
    if (preg_match('#^(https?:)?//#i', $src)) return '';
    if (strpos($src, 'data:') === 0) return '';
    if (strpos($src, 'blob:') === 0) return '';
    if (strpos($src, '..') !== false) return '';

    // Only allow built-in gallery assets.
    if (strpos($src, 'gallery/') !== 0) return '';

    return $src;
}

/**
 * Build a URL to a configurator asset by relative path (e.g. "gallery/.../icon.svg").
 */
function bottle_customizer_configurator_asset_url($relative_path) {
    $relative_path = ltrim((string) $relative_path, '/');
    return BOTTLE_CUSTOMIZER_PLUGIN_URL . 'configurator/' . $relative_path;
}

/**
 * Monogram glyph mapping for 3-character circle/N-gram fonts (right position).
 */
function bottle_customizer_monogram_right_glyph_map() {
    return array(
        'A' => '1', 'B' => '2', 'C' => '3', 'D' => '4', 'E' => '5',
        'F' => '6', 'G' => '7', 'H' => '8', 'I' => '9', 'J' => '0',
        'K' => '!', 'L' => '@', 'M' => '#', 'N' => '$', 'O' => '%',
        'P' => '^', 'Q' => '&', 'R' => '*', 'S' => '(', 'T' => ')',
        'U' => '-', 'V' => '+', 'W' => '[', 'X' => ']', 'Y' => '\\\\', 'Z' => ':',
    );
}

function bottle_customizer_monogram_convert_circle_glyphs($input) {
    $input = (string) $input;
    if ($input === '') return '';

    $upper = strtoupper($input);
    $len = strlen($upper);

    if ($len === 2) {
        return strtolower($upper[0]) . $upper[1];
    }
    if ($len === 3) {
        $map = bottle_customizer_monogram_right_glyph_map();
        $left = strtolower($upper[0]);
        $middle = $upper[1];
        $right = isset($map[$upper[2]]) ? $map[$upper[2]] : $upper[2];
        return $left . $middle . $right;
    }

    return $input;
}

function bottle_customizer_monogram_convert_ngram_glyphs($input) {
    $input = (string) $input;
    if ($input === '') return '';

    $upper = strtoupper($input);
    $len = strlen($upper);

    if ($len === 2) {
        return '?' . strtolower($upper[0]) . $upper[1];
    }
    if ($len === 3) {
        $map = bottle_customizer_monogram_right_glyph_map();
        $left = strtolower($upper[0]);
        $middle = $upper[1];
        $right = isset($map[$upper[2]]) ? $map[$upper[2]] : $upper[2];
        return '?' . $left . $middle . $right;
    }

    return $input;
}

/**
 * Render a monogram as text using the correct font/glyph rules.
 * Returns HTML (safe to echo into the cart item display block).
 */
function bottle_customizer_render_monogram_html($monogram, $monogram_style) {
    $monogram = (string) $monogram;
    $monogram_style = (string) $monogram_style;
    $len = strlen($monogram);

    if ($monogram === '') return '';

    // Circle glyph fonts (rJ#)
    if ($monogram_style === 'rJ#') {
        $class = ($len === 3) ? 'bc-monogram--circle3' : 'bc-monogram--circle2';
        $value = bottle_customizer_monogram_convert_circle_glyphs($monogram);
        return '<span class="bc-monogram ' . esc_attr($class) . '">' . esc_html($value) . '</span>';
    }

    // N-Gram glyph fonts
    if ($monogram_style === 'N-Gram') {
        $class = ($len === 3) ? 'bc-monogram--ngram3' : 'bc-monogram--ngram2';
        $value = bottle_customizer_monogram_convert_ngram_glyphs($monogram);
        return '<span class="bc-monogram ' . esc_attr($class) . '">' . esc_html($value) . '</span>';
    }

    // Regular monogram fonts by style name.
    $class_map = array(
        'ITC Modern' => 'bc-monogram--itc-modern',
        'Nexa Script' => 'bc-monogram--nexa-script',
        'Roman' => 'bc-monogram--roman',
        'Vine' => 'bc-monogram--vine',
    );
    $class = isset($class_map[$monogram_style]) ? $class_map[$monogram_style] : 'bc-monogram--roman';

    // Roman monogram: middle letter larger when 3 characters.
    if ($monogram_style === 'Roman' && $len === 3) {
        $chars = str_split($monogram);
        return '<span class="bc-monogram ' . esc_attr($class) . ' bc-monogram--roman-split">'
            . '<span class="bc-monogram__left">' . esc_html($chars[0]) . '</span>'
            . '<span class="bc-monogram__middle">' . esc_html($chars[1]) . '</span>'
            . '<span class="bc-monogram__right">' . esc_html($chars[2]) . '</span>'
            . '</span>';
    }

    return '<span class="bc-monogram ' . esc_attr($class) . '">' . esc_html($monogram) . '</span>';
}

/**
 * Build a one-line text summary for a side.
 */
function bottle_customizer_build_side_summary($customization, $side, $include_amount = true) {
    $side = ($side === 'back') ? 'back' : 'front';
    $parts = array();

    if (!empty($customization[$side . '_text'])) {
        $parts[] = 'TEXT';
        $parts[] = $customization[$side . '_text'];
    } elseif (!empty($customization[$side . '_monogram'])) {
        $parts[] = 'MONOGRAM';
        $parts[] = $customization[$side . '_monogram'];
    } elseif (!empty($customization[$side . '_graphic'])) {
        $parts[] = 'GRAPHIC';
        $name = !empty($customization[$side . '_graphic']) ? basename($customization[$side . '_graphic']) : '';
        // Strip file extension for cleaner display.
        $name = preg_replace('/\.[^.]+$/', '', $name);
        if ($name) {
            $parts[] = ucfirst($name);
        }
    }

    if (empty($parts)) {
        return '';
    }

    if ($include_amount) {
        $amount = bottle_customizer_side_has_customization($customization, $side)
            ? bottle_customizer_format_surcharge(bottle_customizer_side_surcharge($side))
            : bottle_customizer_format_surcharge(0);
        $parts[] = $amount;
    }
    return implode(', ', $parts);
}

/**
 * Render the customization preview for a side (front/back).
 */
function bottle_customizer_render_side_preview_html($customization, $side) {
    $side = ($side === 'back') ? 'back' : 'front';

    $text_key = $side . '_text';
    $mono_key = $side . '_monogram';
    $graphic_key = $side . '_graphic';
    $graphic_src_key = $side . '_graphic_src';
    $design_url_key = $side . '_design_url';

    $text = !empty($customization[$text_key]) ? (string) $customization[$text_key] : '';
    $monogram = !empty($customization[$mono_key]) ? (string) $customization[$mono_key] : '';
    $graphic = !empty($customization[$graphic_key]) ? (string) $customization[$graphic_key] : '';
    $graphic_src = !empty($customization[$graphic_src_key]) ? (string) $customization[$graphic_src_key] : '';
    $design_url = !empty($customization[$design_url_key]) ? (string) $customization[$design_url_key] : '';
    // Prefer per-side monogram style, fall back to shared monogram_style for backward compatibility.
    $monogram_style_key = $side . '_monogram_style';
    $monogram_style = !empty($customization[$monogram_style_key])
        ? (string) $customization[$monogram_style_key]
        : (!empty($customization['monogram_style']) ? (string) $customization['monogram_style'] : '');

    // Prefer showing the monogram as real text if present.
    if ($monogram !== '') {
        return bottle_customizer_render_monogram_html($monogram, $monogram_style);
    }

    // If a graphic exists, try to show original gallery SVG, else fall back to captured design image.
    if ($graphic !== '') {
        $safe_src = bottle_customizer_sanitize_graphic_src($graphic_src);
        if ($safe_src !== '') {
            $url = bottle_customizer_configurator_asset_url($safe_src);
            return '<img src="' . esc_url($url) . '" alt="' . esc_attr__('Graphic', 'bottle-customizer') . '" class="bc-graphic-img" />';
        }
        if ($design_url !== '') {
            return '<img src="' . esc_url($design_url) . '" alt="' . esc_attr__('Graphic', 'bottle-customizer') . '" class="bc-graphic-img" />';
        }
        return '<span class="bc-text">' . esc_html__('Graphic', 'bottle-customizer') . '</span>';
    }

    // Text fallback
    if ($text !== '') {
        return '<span class="bc-text">' . esc_html($text) . '</span>';
    }

    return '<span class="bc-text">—</span>';
}

/**
 * Adjust line-item price to include the back-side surcharge when applicable.
 */
function bottle_customizer_adjust_cart_prices($cart) {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }
    if (did_action('woocommerce_before_calculate_totals') >= 2) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item) {
        if (empty($cart_item['bottle_customization'])) {
            continue;
        }
        $c = $cart_item['bottle_customization'];
        $surcharge = bottle_customizer_total_surcharge($c);
        if ($surcharge > 0) {
            $product = $cart_item['data'];
            $base_price = (float) $product->get_regular_price();
            // Use sale price if available.
            if ($product->get_sale_price() !== '') {
                $base_price = (float) $product->get_sale_price();
            }
            $product->set_price($base_price + $surcharge);
        }
    }
}
add_action('woocommerce_before_calculate_totals', 'bottle_customizer_adjust_cart_prices', 20, 1);

/**
 * Display customization data in cart
 */
function bottle_customizer_cart_item_data($item_data, $cart_item = array()) {
    if (!is_array($cart_item) || !isset($cart_item['bottle_customization'])) {
        return $item_data;
    }

    $customization = $cart_item['bottle_customization'];
        
        // Override displayed variation color (e.g. "Kleur" / "Color") with configurator chosen color.
        $chosen_color_slug = !empty($customization['color']) ? (string) $customization['color'] : '';
        $color_attr_name = !empty($customization['color_attribute']) ? (string) $customization['color_attribute'] : '';
        $chosen_color_display = $chosen_color_slug ? bottle_customizer_format_color_display($chosen_color_slug, $color_attr_name) : '';

        if ($chosen_color_display) {
            $possible_keys = array();
            if ($color_attr_name && function_exists('wc_attribute_label')) {
                // Strip "pa_" for label lookup if needed.
                $possible_keys[] = wc_attribute_label(str_replace('pa_', '', $color_attr_name));
                $possible_keys[] = wc_attribute_label($color_attr_name);
            }
            // Fallback key names (multilingual-ish).
            $possible_keys[] = __('Color', 'bottle-customizer');
            $possible_keys[] = 'Color';
            $possible_keys[] = 'Kleur';

            $replaced = false;
            foreach ($item_data as &$row) {
                if (!is_array($row) || empty($row['key'])) {
                    continue;
                }
                $key = (string) $row['key'];
                $lkey = strtolower($key);
                $is_color_key = in_array($key, $possible_keys, true) || strpos($lkey, 'color') !== false || strpos($lkey, 'kleur') !== false;
                if ($is_color_key) {
                    $row['value'] = $chosen_color_display;
                    $replaced = true;
                    break;
                }
            }
            unset($row);

            // If we couldn't find an existing variation "color" row, add our own.
            if (!$replaced) {
                $item_data[] = array(
                    'key' => __('Color', 'bottle-customizer'),
                    'value' => $chosen_color_display,
                );
            }
        }
        
        /*
        // Front customization
        $front_details = array();
        if (!empty($customization['front_text'])) {
            $front_details[] = 'Text: ' . $customization['front_text'];
        }
        if (!empty($customization['front_monogram'])) {
            $front_details[] = 'Monogram: ' . $customization['front_monogram'];
        }
        if (!empty($customization['front_graphic'])) {
            $front_details[] = 'Graphic: ' . basename($customization['front_graphic']);
        }
        if (!empty($front_details)) {
            $item_data[] = array(
                'key' => __('Front', 'bottle-customizer'),
                'value' => implode(', ', $front_details),
            );
        }
        
        /*
        // Back customization
        $back_details = array();
        if (!empty($customization['back_text'])) {
            $back_details[] = 'Text: ' . $customization['back_text'];
        }
        if (!empty($customization['back_monogram'])) {
            $back_details[] = 'Monogram: ' . $customization['back_monogram'];
        }
        if (!empty($customization['back_graphic'])) {
            $back_details[] = 'Graphic: ' . basename($customization['back_graphic']);
        }
        if (!empty($back_details)) {
            $item_data[] = array(
                'key' => __('Back', 'bottle-customizer'),
                'value' => implode(', ', $back_details),
            );
        }

        */

        // --- Personalized Options Dropdown (skip on checkout) ---
        $is_checkout = function_exists('is_checkout') && is_checkout();
        $has_front = bottle_customizer_side_has_customization($customization, 'front');
        $has_back  = bottle_customizer_side_has_customization($customization, 'back');
        $front_has_visual_preview = !empty($customization['front_monogram']) || !empty($customization['front_graphic']);
        $back_has_visual_preview  = !empty($customization['back_monogram']) || !empty($customization['back_graphic']);

        // Build descriptive summary for each side.
        $front_summary = bottle_customizer_build_side_summary($customization, 'front', false);
        $back_summary  = bottle_customizer_build_side_summary($customization, 'back', false);
        $front_amount_display = bottle_customizer_format_surcharge(bottle_customizer_side_surcharge('front'));
        $back_amount_display  = bottle_customizer_format_surcharge(bottle_customizer_side_surcharge('back'));

        if (!$is_checkout && ($has_front || $has_back)) {
            ob_start();
            ?>
            <details class="bottle-customizer-options" open>
                <summary class="bc-dropdown-summary"><?php esc_html_e('Gepersonaliseerde opties', 'bottle-customizer'); ?></summary>
                <div class="bc-dropdown-content">
                    <div class="bc-rows">
                        <?php if ($has_front): ?>
                            <div class="bc-row">
                                <?php $front_label = $front_summary . ($front_has_visual_preview ? '' : ', ' . $front_amount_display); ?>
                                <span class="bc-label"><?php echo esc_html__('Front:', 'bottle-customizer') . ' ' . esc_html($front_label); ?></span>
                                <?php if ($front_has_visual_preview): ?>
                                    <div class="bc-value">
                                        <?php echo bottle_customizer_render_side_preview_html($customization, 'front'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                                        <span class="bc-side-amount"><?php echo esc_html($front_amount_display); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>

                        <?php if ($has_back): ?>
                            <div class="bc-row">
                                <?php $back_label = $back_summary . ($back_has_visual_preview ? '' : ', ' . $back_amount_display); ?>
                                <span class="bc-label"><?php echo esc_html__('Back:', 'bottle-customizer') . ' ' . esc_html($back_label); ?></span>
                                <?php if ($back_has_visual_preview): ?>
                                    <div class="bc-value">
                                        <?php echo bottle_customizer_render_side_preview_html($customization, 'back'); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                                        <span class="bc-side-amount"><?php echo esc_html($back_amount_display); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                </div>
            </details>
            <?php
            $html = ob_get_clean();

            $item_data[] = array(
                'key' => '',
                'value' => '',
                'display' => $html,
            );
        }

    return $item_data;
}
add_filter('woocommerce_get_item_data', 'bottle_customizer_cart_item_data', 10, 2);

/**
 * Override displayed order item meta (e.g. variation attribute "Color"/"Kleur") with configurator chosen color.
 */
function bottle_customizer_override_order_item_meta($formatted_meta, $item = null) {
    if (!is_object($item) || !method_exists($item, 'get_meta')) {
        return $formatted_meta;
    }

    $customization = $item->get_meta('_bottle_customization');
    if (!$customization || !is_array($customization) || empty($customization['color'])) {
        return $formatted_meta;
    }

    $color_attr_name = !empty($customization['color_attribute']) ? (string) $customization['color_attribute'] : '';
    $chosen_color_display = bottle_customizer_format_color_display((string) $customization['color'], $color_attr_name);

    $possible_keys = array('Color', 'Kleur');
    if ($color_attr_name && function_exists('wc_attribute_label')) {
        $possible_keys[] = wc_attribute_label(str_replace('pa_', '', $color_attr_name));
        $possible_keys[] = wc_attribute_label($color_attr_name);
    }

    foreach ($formatted_meta as $meta) {
        // $meta is usually an object with display_key/display_value
        if (!is_object($meta) || !isset($meta->display_key)) {
            continue;
        }
        $key = (string) $meta->display_key;
        $lkey = strtolower($key);
        $is_color_key = in_array($key, $possible_keys, true) || strpos($lkey, 'color') !== false || strpos($lkey, 'kleur') !== false;
        if ($is_color_key) {
            $meta->display_value = $chosen_color_display;
            break;
        }
    }

    return $formatted_meta;
}
add_filter('woocommerce_order_item_get_formatted_meta_data', 'bottle_customizer_override_order_item_meta', 10, 2);

/**
 * Display preview images in cart
 */
function bottle_customizer_cart_item_thumbnail($thumbnail, $cart_item, $cart_item_key) {
    if (isset($cart_item['bottle_customization'])) {
        $customization = $cart_item['bottle_customization'];
        
        $images_html = '<div class="bottle-customizer-cart-images">';
        
        if (!empty($customization['front_image_url'])) {
            $images_html .= '<img src="' . esc_url($customization['front_image_url']) . '" alt="Front View" class="bottle-preview-thumb" style="max-width: 80px; margin-right: 5px;">';
        }
        
        if (!empty($customization['back_image_url'])) {
            $images_html .= '<img src="' . esc_url($customization['back_image_url']) . '" alt="Back View" class="bottle-preview-thumb" style="max-width: 80px;">';
        }
        
        $images_html .= '</div>';
        
        return $images_html;
    }
    
    return $thumbnail;
}
// NOTE: This filter is intentionally not registered.
// We use `bottle_customizer_cart_thumbnail` (priority 99) as the single source of truth.

/**
 * Save customization data to order item meta
 */
function bottle_customizer_add_order_item_meta($item, $cart_item_key = '', $values = array(), $order = null) {
    if (!is_array($values) || !isset($values['bottle_customization'])) {
        return;
    }
    if (!is_object($item) || !method_exists($item, 'add_meta_data')) {
        return;
    }
    $item->add_meta_data('_bottle_customization', $values['bottle_customization'], true);
}
add_action('woocommerce_checkout_create_order_line_item', 'bottle_customizer_add_order_item_meta', 10, 4);

/**
 * Display customization in order details (admin)
 */
function bottle_customizer_order_item_meta($item_id, $item, $order = null, $plain_text = false) {
    $customization = $item->get_meta('_bottle_customization');
    
    if ($customization) {
        echo '<div class="bottle-customization-details">';
        echo '<p><strong>' . __('Bottle Customization:', 'bottle-customizer') . '</strong></p>';
        
        if (!empty($customization['color'])) {
            echo '<p>Color: ' . esc_html(ucfirst($customization['color'])) . '</p>';
        }
        
        // Front
        if (bottle_customizer_side_has_customization($customization, 'front')) {
            $front_summary = bottle_customizer_build_side_summary($customization, 'front');
            echo '<p><strong>' . esc_html__('Front:', 'bottle-customizer') . '</strong> ' . esc_html($front_summary) . '</p>';
        }
        
        // Back
        if (bottle_customizer_side_has_customization($customization, 'back')) {
            $back_summary = bottle_customizer_build_side_summary($customization, 'back');
            echo '<p><strong>' . esc_html__('Back:', 'bottle-customizer') . '</strong> ' . esc_html($back_summary) . '</p>';
        }
        
        // Preview images
        if (!empty($customization['front_image_url'])) {
            echo '<p><img src="' . esc_url($customization['front_image_url']) . '" alt="Front View" style="max-width: 150px;"></p>';
        }
        if (!empty($customization['back_image_url'])) {
            echo '<p><img src="' . esc_url($customization['back_image_url']) . '" alt="Back View" style="max-width: 150px;"></p>';
        }
        if (!empty($customization['preview_pdf_url'])) {
            echo '<p><a href="' . esc_url($customization['preview_pdf_url']) . '" target="_blank" rel="noopener noreferrer">' . esc_html__('Download preview PDF', 'bottle-customizer') . '</a></p>';
        }
        
        echo '</div>';
    }
}
// This action commonly passes 3 args; keep our callback flexible to avoid ArgumentCountError.
add_action('woocommerce_after_order_itemmeta', 'bottle_customizer_order_item_meta', 10, 3);
// This action passes 4 args ($item_id, $item, $order, $plain_text).
add_action('woocommerce_order_item_meta_end', 'bottle_customizer_order_item_meta', 10, 4);

/**
 * Ensure each customized item is treated as unique in cart
 */
function bottle_customizer_add_cart_item_data($cart_item_data, $product_id = 0, $variation_id = 0) {
    if (isset($cart_item_data['bottle_customization'])) {
        $cart_item_data['unique_key'] = md5(microtime() . rand());
    }
    return $cart_item_data;
}
add_filter('woocommerce_add_cart_item_data', 'bottle_customizer_add_cart_item_data', 10, 3);

/**
 * Clean up old temporary media files (scheduled task)
 */
function bottle_customizer_cleanup_temp_images() {
    $upload_dir = wp_upload_dir();
    $temp_dir = $upload_dir['basedir'] . '/bottle-customizer-temp/';
    
    if (!file_exists($temp_dir)) {
        return;
    }
    
    $files = array_merge(
        glob($temp_dir . '*.png') ?: array(),
        glob($temp_dir . '*.jpg') ?: array(),
        glob($temp_dir . '*.webp') ?: array(),
        glob($temp_dir . '*.pdf') ?: array()
    );
    $now = time();
    
    foreach ($files as $file) {
        // Delete files older than 24 hours
        if ($now - filemtime($file) > 86400) {
            unlink($file);
        }
    }
}

/**
 * Schedule cleanup task on plugin activation
 */
function bottle_customizer_activate() {
    if (!wp_next_scheduled('bottle_customizer_cleanup_hook')) {
        wp_schedule_event(time(), 'daily', 'bottle_customizer_cleanup_hook');
    }
}
register_activation_hook(__FILE__, 'bottle_customizer_activate');

/**
 * Clear scheduled task on plugin deactivation
 */
function bottle_customizer_deactivate() {
    wp_clear_scheduled_hook('bottle_customizer_cleanup_hook');
}
register_deactivation_hook(__FILE__, 'bottle_customizer_deactivate');

add_action('bottle_customizer_cleanup_hook', 'bottle_customizer_cleanup_temp_images');

/**
 * Helper: Get preferred custom image URL (Prioritize Back > Front)
 */
function bottle_customizer_get_custom_image_url($customization) {
    if (!empty($customization['back_image_url'])) {
        return $customization['back_image_url'];
    }
    if (!empty($customization['front_image_url'])) {
        return $customization['front_image_url'];
    }
    return false;
}

/**
 * Filter: Swap Cart Item Thumbnail with Custom Image(s)
 */
function bottle_customizer_cart_thumbnail($product_image, $cart_item = array(), $cart_item_key = '') {
    // Show custom thumbnail on both cart and checkout pages.
    if (isset($cart_item['bottle_customization'])) {
        $c = $cart_item['bottle_customization'];
        $front = !empty($c['front_image_url']) ? $c['front_image_url'] : false;
        $back  = !empty($c['back_image_url']) ? $c['back_image_url'] : false;

        if ($front || $back) {
            $product = $cart_item['data'];
            $alt = $product->get_name();
            
            // Show only the customized BACK preview (fallback to front if needed).
            $src = $back ? $back : $front;
            $label = $back ? __('Back', 'bottle-customizer') : __('Front', 'bottle-customizer');
            // FKCart hides `img:not(.fkcart-image)` inside its drawer; include that class for compatibility.
            // Wrap in .bc-thumb-frame for gradient border styling.
            return '<span class="bc-thumb-frame"><img src="' . esc_url($src) . '" alt="' . esc_attr($alt . ' - ' . $label) . '" class="fkcart-image bottle-customizer-cart-thumb" /></span>';
        }
    }
    return $product_image;
}
add_filter('woocommerce_cart_item_thumbnail', 'bottle_customizer_cart_thumbnail', 99, 3);

/**
 * Filter: Swap Order Item Thumbnail (Checkout/Emails) with Custom Image(s)
 *
 * In email context we skip the replacement so the large custom back image
 * does not appear; the two smaller front/back previews rendered by
 * bottle_customizer_order_item_meta() are kept.
 */
function bottle_customizer_order_thumbnail($product_image, $item = null, $visible = true) {
    // Skip in emails – the smaller previews are shown via order_item_meta instead.
    // Return empty string so neither the custom back image nor the default product image appears.
    if (doing_action('woocommerce_email_order_details') || did_action('woocommerce_email_header')) {
        return '';
    }

    if (is_a($item, 'WC_Order_Item_Product')) {
        $c = $item->get_meta('_bottle_customization');
        if ($c && is_array($c)) {
            $front = !empty($c['front_image_url']) ? $c['front_image_url'] : false;
            $back  = !empty($c['back_image_url']) ? $c['back_image_url'] : false;

            if ($front || $back) {
                // Show only the customized BACK preview (fallback to front if needed).
                $src = $back ? $back : $front;
                $label = $back ? __('Back', 'bottle-customizer') : __('Front', 'bottle-customizer');
                // FKCart hides `img:not(.fkcart-image)` inside its drawer; include that class for compatibility.
                // Wrap in .bc-thumb-frame for gradient border styling.
                return '<span class="bc-thumb-frame"><img src="' . esc_url($src) . '" alt="' . esc_attr($label) . '" class="fkcart-image bottle-customizer-cart-thumb" /></span>';
            }
        }
    }
    return $product_image;
}
add_filter('woocommerce_order_item_thumbnail', 'bottle_customizer_order_thumbnail', 10, 3);

/**
 * Render expected delivery note per-item in the mini-cart (drawer) for customized items.
 * Hooked to run after each cart item in the mini-cart widget.
 */
function bottle_customizer_mini_cart_item_delivery_note($cart_item = array(), $cart_item_key = '') {
    // Only show for customized items.
    if (empty($cart_item['bottle_customization'])) {
        return;
    }
    ?>
    <div class="bc-mini-cart-note-row">
        <div class="bc-mini-cart-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bc-note-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div class="bc-note-text">
                <strong><?php esc_html_e('Expected delivery:', 'bottle-customizer'); ?></strong>
                <?php esc_html_e('Allow 7 business days for personalization and 2–3 days for delivery. Delivery date cannot be guaranteed. All purchases are final.', 'bottle-customizer'); ?>
            </div>
        </div>
    </div>
    <?php
}
add_action('woocommerce_widget_shopping_cart_after_cart_item', 'bottle_customizer_mini_cart_item_delivery_note', 20, 2);
