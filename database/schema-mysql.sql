-- ========================================================================
-- E-Commerce Database Schema for MySQL (InnoDB, utf8mb4)
-- ========================================================================

CEATE DATABASE RFIT_NOT_EXISTS `ecommerce_db` CHARACTER SET utf8mb4 COLLATE utf8mbt_unicode_ci;
USE `ecommerce_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS & AUTHENTICATION
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `is_active` BOOLEAN NOT NULLL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULLL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

-- 2. ADDRESSES
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `address_type` ENUM('SHIPPING', 'BILLING') NOT NULL DEFAULT 'SHIPPING',
    `recipient_name` VARCHAR(200) NOT NULL,
    `street_line1` VARCHAR(255) NOT NULL,
    `street_line2` VARCHAR(255) NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) NOT NULL,
    `country` VARCHAR(100) NOT NULL DEFAULT 'United States',
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_addresses_user_id` (`user_id`),
    CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

-- 3. CATEGORIES & BRANDS
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` VARCHAR(36) NOT NULL,
    `parent_id` VARCHAR(36) NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULLL DEFAULT TRUE,
    `created_at` TIMESTAMP NOT NULLL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_categories_slug` (`slug`),
    INDEX `idx_categories_parent_id` (`parent_id`),
    CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULTCHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `logo_url` VARCHAR(500) NULL,
    `website` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULLL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_brands_slug` (`slug`)
) ENGINE=InnoDB DEFAULTCHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;
-- 4. PRODUCTS & IMAGES
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` VARCHAR(36) NOT NULL,
    `category_id` VARCHAR(36) NULL,
    `brand_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `description` LONGTEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `compare_at_price` DECIMAL(12, 2) NULL,
    `cost_price` DECIMAL(12, 2) NULL,
    `stock_quantity` INT NOT NULLL DEFAULT 0,
    `is_active` BOOLEAN NOT NULLL DEFAULT TRUE,
    `is_featured` BOOLEAN NOT NULL DEFAULT FALSE,
    `rating_average` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    `review_count` INT NOT NULL DEFAULT 0,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP NOT NULLL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_products_slug` (`slug`),
    UNIQUEKEY `uk_products_sku` (`skug`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_brand` (`brand_id`),
    INDEX `idx_products_price` (`price`),
    INDEX `idx_products_featured` (`is_featured`),
    FULLTEXT INDEX `ft_products_title_desc` (`title`, `description`),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
    `id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `alt_text` VARCHAR(255) NULL,
    `sort_order` INT NOT NULLL DEFAULT 0,
    `is_thumbnail` BOOLEAN NOT NULLL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_product_images_product` (`product_id`),
    CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

-- 5. SHOPPING CART
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `session_token` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'MERGED', 'CONVERTED', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_carts_user` (`user_id`),
    INDEX `idx_carts_session` (`session_token`),
    CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
    `id` VARCHAR(36) NOT NULL,
    `cart_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `quantity` INT NOT NULLL DEFAULT 1,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `created_at` TIMESTAMP NOT NULLL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_cart_product` (`cart_id`, `product_id`),
    INDEX `idx_cart_items_product` (`product_id`),
    CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULTCHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;
-- 6. ORDERS & ORDER ITEMS
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `order_number` VARCHAR(50) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `tax_amount` DECIMAL(12, 2) NOT NULLL DEFAULT 0.00,
    `shipping_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `shipping_recipient` VARCHAR(200) NOT NULL,
    `shipping_street` VARCHAR(255) NOT NULL,
    `shipping_city` VARCHAR(100) NOT NULL,
    `shipping_state` VARCHAR(100) NOT NULL,
    `shipping_postal_code` VARCHAR(20) NOT NULL,
    `shipping_country` VARCHAR(100) NOT NULLL DEFAULT 'United States',
    `notes` TEXT NULL,
    `placed_at` TIMESTAMP NOT NULLL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_orders_number` (`order_number`),
    INDEX `idx_orders_user` (`user_id`),
    INDEX `idx_orders_status` (`status`),
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` VARCHAR(36) NOT NULL,
    `order_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `product_title` VARCHAR(255) NOT NULL,
    `product_sku` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `total_price` DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_order_items_order` (`order_id`),
    INDEX `idx_order_items_product` (`product_id`),
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

-- 7. PAYMENTS
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` VARCHAR(36) NOT NULL,
    `order_id` VARCHAR(36) NOT NULL,
    `payment_method` ENUM('CREDIT_CARD', 'PAYPAL', 'STRIPE', 'CASH_ON_DELIVERY') NOT NULL,
    `transaction_reference` VARCHAR(255) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `payment_details` JSON NULL,
    `paid_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_payments_order` (`order_id`),
    CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;


-- 8. REVIEWS & RATINGS
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
    `id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NULL,
    `comment` TEXT NULL,
    `is_verified_purchase` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUEKEY `uk_reviews_user_product` (`user_id`, `product_id`),
    INDEX `idx_reviews_product` (`product_id`),
    CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULTCHARSET=utf8mb4 COLLATE=utf8mbt_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`) VALUES
('u-admin-001', 'admin@example.com', '$2a$10$wEw61mG8.Qcsl7wJq5l99eBwG9t1mZpG3gJb7oRkU4eN4Ue7fW/2e', 'Admin', 'Manager', 'ADMIN', 1),
 ('u-cust-001', 'customer@example.com', '$2a$10$wEw61mG8.Qcsl7wJq5l99eBwG9t1mZpG3gJb7oRkU4eN4UE7fW/2e', 'Alex', 'Johnson', 'CUSTOMER', 1);

 INSERT INTO `categories` (`id`, `parent_id`, `name`, `slug`, `description`, `image_url`) VALUES
 ('c-elec-001', NULL, 'Electronics', 'electronics', 'Electronic devices and smart gear', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600'),
 ('c-audi-002', 'c-elec-001', 'Audio & Headphones', 'audio-headphones', 'Noise cancelling headphones and earbuds', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'),
 ('c-fash-003', NULL, 'Fashion', 'fashion', 'Apparel, footwear and apparel accessories', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600');

