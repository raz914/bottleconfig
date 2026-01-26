<?php
/**
 * Plugin Name: Bottle Customizer for WooCommerce
 * Plugin URI: https://example.com
 * Description: Adds a "Personalize" button to bottle products that opens a fullscreen customizer and adds customized products to WooCommerce cart.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
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
    // Avoid fatal errors if WooCommerce isn't active (e.g. is_product()).
    if (!bottle_customizer_is_woocommerce_active() || !function_exists('is_product') || !function_exists('wc_get_product')) {
        return;
    }
    if (!bottle_customizer_is_enabled()) {
        return;
    }

    // Only load on the target product page
    if (!is_product()) {
        return;
    }

    // On some themes, global $product isn't ready yet during wp_enqueue_scripts.
    // Using queried object ID is more reliable.
    $product_id = function_exists('get_queried_object_id') ? absint(get_queried_object_id()) : 0;
    $product = $product_id ? wc_get_product($product_id) : null;

    if (!$product || !bottle_customizer_is_target_product($product)) {
        return;
    }
    
    $css_path = BOTTLE_CUSTOMIZER_PLUGIN_DIR . 'assets/css/frontend.css';
    $js_path  = BOTTLE_CUSTOMIZER_PLUGIN_DIR . 'assets/js/frontend.js';
    $css_ver  = file_exists($css_path) ? (string) filemtime($css_path) : BOTTLE_CUSTOMIZER_VERSION;
    $js_ver   = file_exists($js_path) ? (string) filemtime($js_path) : BOTTLE_CUSTOMIZER_VERSION;

    // Enqueue styles
    wp_enqueue_style(
        'bottle-customizer-frontend',
        BOTTLE_CUSTOMIZER_PLUGIN_URL . 'assets/css/frontend.css',
        array(),
        $css_ver
    );
    
    // Enqueue scripts
    wp_enqueue_script(
        'bottle-customizer-frontend',
        BOTTLE_CUSTOMIZER_PLUGIN_URL . 'assets/js/frontend.js',
        array(),
        $js_ver,
        true
    );

    // Helpful debug signal: confirms script loaded on the page.
    wp_add_inline_script(
        'bottle-customizer-frontend',
        'console.log("[BottleCustomizer] assets loaded", { productId: ' . (int) $product->get_id() . ' });',
        'after'
    );
    
    // Pass data to JavaScript
    wp_localize_script('bottle-customizer-frontend', 'bottleCustomizerData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('bottle_customizer_nonce'),
        'configuratorUrl' => BOTTLE_CUSTOMIZER_PLUGIN_URL . 'configurator/index.html',
        'productId' => $product->get_id(),
        'productName' => $product->get_name(),
        'productPrice' => $product->get_price(),
    ));
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
        <span class="btn-icon">✨</span>
        <span class="btn-text">PERSONALIZE</span>
    </button>';
    
    // Add the modal container
    echo '<div id="bottle-customizer-modal" class="bottle-customizer-modal">
        <div class="bottle-customizer-modal-content">
            <button type="button" class="bottle-customizer-close" aria-label="Close">&times;</button>
            <iframe id="bottle-customizer-iframe" class="bottle-customizer-iframe" src="" frameborder="0"></iframe>
        </div>
    </div>';
}
add_action('woocommerce_after_add_to_cart_button', 'bottle_customizer_add_personalize_button');

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
            'font' => sanitize_text_field($customization_data['font'] ?? ''),
            'monogram_style' => sanitize_text_field($customization_data['monogramStyle'] ?? ''),
            'front_image_url' => $front_image_url,
            'back_image_url' => $back_image_url,
        ),
        'unique_key' => md5(microtime() . rand()), // Make each customization unique
    );
    
    // Add to cart
    wc_clear_notices();

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
    
    if ($cart_item_key) {
        wp_send_json_success(array(
            'message' => 'Product added to cart',
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
 * Save base64 image to temporary directory
 */
function bottle_customizer_save_temp_image($base64_image, $prefix) {
    $base64_image = (string) $base64_image;

    // Detect mime + strip data URI prefix if present.
    $ext = 'png';
    if (preg_match('/^data:image\/(\w+);base64,/', $base64_image, $m)) {
        $mime_ext = strtolower((string) $m[1]);
        if (in_array($mime_ext, array('png', 'jpg', 'jpeg', 'webp'), true)) {
            $ext = $mime_ext === 'jpeg' ? 'jpg' : $mime_ext;
        }
        $base64_image = preg_replace('/^data:image\/\w+;base64,/', '', $base64_image);
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
 * Display customization data in cart
 */
function bottle_customizer_cart_item_data($item_data, $cart_item) {
    if (isset($cart_item['bottle_customization'])) {
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

        // Preview images (works even in mini-cart/cart templates that don't render thumbnails)
        $front_url = !empty($customization['front_image_url']) ? esc_url($customization['front_image_url']) : '';
        $back_url  = !empty($customization['back_image_url']) ? esc_url($customization['back_image_url']) : '';
        if ($front_url || $back_url) {
            $html = '<span class="bottle-customizer-cart-images">';
            if ($front_url) {
                $html .= '<img src="' . $front_url . '" alt="Front View" class="bottle-preview-thumb" style="max-width: 80px; margin-right: 5px;" />';
            }
            if ($back_url) {
                $html .= '<img src="' . $back_url . '" alt="Back View" class="bottle-preview-thumb" style="max-width: 80px;" />';
            }
            $html .= '</span>';

            $item_data[] = array(
                'key' => __('Preview', 'bottle-customizer'),
                'value' => $html,
                'display' => $html,
            );
        }
    }
    
    return $item_data;
}
add_filter('woocommerce_get_item_data', 'bottle_customizer_cart_item_data', 10, 2);

/**
 * Override displayed order item meta (e.g. variation attribute "Color"/"Kleur") with configurator chosen color.
 */
function bottle_customizer_override_order_item_meta($formatted_meta, $item) {
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
add_filter('woocommerce_cart_item_thumbnail', 'bottle_customizer_cart_item_thumbnail', 10, 3);

/**
 * Save customization data to order item meta
 */
function bottle_customizer_add_order_item_meta($item, $cart_item_key, $values, $order) {
    if (isset($values['bottle_customization'])) {
        $item->add_meta_data('_bottle_customization', $values['bottle_customization'], true);
    }
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
        if (!empty($customization['front_text']) || !empty($customization['front_monogram']) || !empty($customization['front_graphic'])) {
            echo '<p>Front: ';
            $front = array();
            if (!empty($customization['front_text'])) $front[] = 'Text: ' . $customization['front_text'];
            if (!empty($customization['front_monogram'])) $front[] = 'Monogram: ' . $customization['front_monogram'];
            if (!empty($customization['front_graphic'])) $front[] = 'Graphic';
            echo esc_html(implode(', ', $front));
            echo '</p>';
        }
        
        // Back
        if (!empty($customization['back_text']) || !empty($customization['back_monogram']) || !empty($customization['back_graphic'])) {
            echo '<p>Back: ';
            $back = array();
            if (!empty($customization['back_text'])) $back[] = 'Text: ' . $customization['back_text'];
            if (!empty($customization['back_monogram'])) $back[] = 'Monogram: ' . $customization['back_monogram'];
            if (!empty($customization['back_graphic'])) $back[] = 'Graphic';
            echo esc_html(implode(', ', $back));
            echo '</p>';
        }
        
        // Preview images
        if (!empty($customization['front_image_url'])) {
            echo '<p><img src="' . esc_url($customization['front_image_url']) . '" alt="Front View" style="max-width: 150px;"></p>';
        }
        if (!empty($customization['back_image_url'])) {
            echo '<p><img src="' . esc_url($customization['back_image_url']) . '" alt="Back View" style="max-width: 150px;"></p>';
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
function bottle_customizer_add_cart_item_data($cart_item_data, $product_id, $variation_id) {
    if (isset($cart_item_data['bottle_customization'])) {
        $cart_item_data['unique_key'] = md5(microtime() . rand());
    }
    return $cart_item_data;
}
add_filter('woocommerce_add_cart_item_data', 'bottle_customizer_add_cart_item_data', 10, 3);

/**
 * Clean up old temporary images (scheduled task)
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
        glob($temp_dir . '*.webp') ?: array()
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
