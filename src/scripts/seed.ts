import { loadEnvConfig } from "@next/env";
// Load env configs synchronously before imports compile
loadEnvConfig(process.cwd());

import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const categoriesData = [
  { name: "Mobile Accessories", slug: "mobile-accessories", order: 1 },
  { name: "Computer Accessories", slug: "computer-accessories", order: 2 },
  { name: "Laptop Accessories", slug: "laptop-accessories", order: 3 },
  { name: "Desktop Accessories", slug: "desktop-accessories", order: 4 },
  { name: "Chargers", slug: "chargers", order: 5 },
  { name: "Charging Cables", slug: "charging-cables", order: 6 },
  { name: "Power Banks", slug: "power-banks", order: 7 },
  { name: "Earbuds", slug: "earbuds", order: 8 },
  { name: "Headphones", slug: "headphones", order: 9 },
  { name: "Smartwatches", slug: "smartwatches", order: 10 },
  { name: "Phone Cases", slug: "phone-cases", order: 11 },
  { name: "Screen Protectors", slug: "screen-protectors", order: 12 },
  { name: "USB Hubs", slug: "usb-hubs", order: 13 },
  { name: "Keyboards", slug: "keyboards", order: 14 },
  { name: "Mice", slug: "mice", order: 15 },
  { name: "Gaming Accessories", slug: "gaming-accessories", order: 16 },
  { name: "Car Accessories", slug: "car-accessories", order: 17 },
  { name: "Storage Devices", slug: "storage-devices", order: 18 },
  { name: "Smart Gadgets", slug: "smart-gadgets", order: 19 },
  { name: "Everyday Essentials", slug: "everyday-essentials", order: 20 },
];

async function seed() {
  const DATA_DIR = path.join(process.cwd(), "src/data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let dbConnected = false;
  let connectDB, Category, Product, Admin, StoreSettings, Coupon: any;

  try {
    console.log("Connecting to MongoDB...");
    const mongooseMods = await import("../lib/mongodb");
    connectDB = mongooseMods.default;
    
    Category = (await import("../models/Category")).default;
    Product = (await import("../models/Product")).default;
    Admin = (await import("../models/Admin")).default;
    StoreSettings = (await import("../models/StoreSettings")).default;
    Coupon = (await import("../models/Coupon")).default;

    await connectDB();
    dbConnected = true;
    console.log("MongoDB connection successful. Seeding database...");
  } catch (err) {
    console.warn("MongoDB connection failed. Writing seed data to local JSON files instead.", (err as any).message);
  }

  // Generate category list with IDs
  const categoriesList: any[] = [];
  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const _id = new mongoose.Types.ObjectId().toString();
    const categoryDoc = {
      _id,
      ...cat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categoriesList.push(categoryDoc);
    categoriesMap[cat.slug] = _id;
  }

  // Hash Admin details
  const adminEmail = "rehanmuhammad546@gmail.com";
  const adminPassword = "admin123";
  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  const adminDoc = {
    _id: new mongoose.Types.ObjectId().toString(),
    email: adminEmail,
    passwordHash,
    name: "Store Administrator",
    role: "superadmin" as "superadmin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Default Store Settings
  const storeSettingsDoc = {
    _id: new mongoose.Types.ObjectId().toString(),
    announcementText: "⚡ Free shipping on orders over $50 | COD Nationwide",
    shippingFee: 5,
    freeShippingThreshold: 50,
    vatRate: 0,
    contactPhone: "+92 300 1234567",
    contactEmail: "rehanmuhammad546@gmail.com",
    address: "Get Online HQ, Lahore, Pakistan",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Seed Products list
  const productsData = [
    {
      name: "SonicWave Buds Pro",
      slug: "sonicwave-buds-pro",
      shortDescription: "Best Active Noise Cancelling premium wireless earbuds.",
      fullDescription: "Pristine acoustic separation meets advanced smart noise filtering. Engineered with deep carbon dynamic drivers, these custom earbuds provide up to 40dB of sound isolation, touch-swipe controls, and a total of 32 hours of play time.",
      category: categoriesMap["earbuds"],
      brand: "SonicWave",
      basePrice: 249,
      costPrice: 120,
      SKU: "GG-SW-BUDS-PRO",
      stockQuantity: 45,
      lowStockThreshold: 5,
      status: "active" as const,
      featured: true,
      bestSeller: false,
      newArrival: true,
      tags: ["wireless", "audio", "noise-cancelling"],
      specifications: [
        { key: "Driver Size", value: "11mm Custom Dynamic" },
        { key: "Battery Life", value: "8 hours (earbuds) + 24 hours (case)" },
        { key: "Bluetooth Version", value: "Bluetooth 5.3" },
      ],
      features: ["Active Noise Cancellation (ANC)", "Wireless Qi Charging", "IPX5 Water Resistant"],
      compatibilityInfo: "All Bluetooth-enabled devices (iOS, Android, macOS, Windows)",
      warrantyInfo: "2-Year official Get Online warranty",
      shippingInfo: "Ships within 24 hours. COD available.",
      images: [{ url: "/images/prod-buds.png", publicId: "prod_buds", order: 0 }],
      variants: [
        { name: "White", color: "White", sku: "GG-SW-BUDS-PRO-WHT", price: 249, stock: 25 },
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-SW-BUDS-PRO-BLK", price: 249, stock: 20 },
      ],
    },
    {
      name: "HyperCharge 120W GaN Adaptor",
      slug: "hypercharge-120w-gan",
      shortDescription: "Triple Device Super-Fast Charging station blocks.",
      fullDescription: "Unleash high-efficiency charging power. Engineered with safe GaN (Gallium Nitride) semiconductor material, this compact adaptor offers dual USB-C ports (100W max) and an additional USB-A port, capable of charging laptops, tablets, and phones simultaneously.",
      category: categoriesMap["chargers"],
      brand: "HyperCharge",
      basePrice: 79,
      costPrice: 35,
      SKU: "GG-HC-120W-GAN",
      stockQuantity: 60,
      lowStockThreshold: 10,
      status: "active" as const,
      featured: true,
      bestSeller: true,
      newArrival: false,
      tags: ["charging", "gan", "adaptor"],
      specifications: [
        { key: "Max Power Output", value: "120W Total" },
        { key: "Ports", value: "2x USB-C (PD 3.0), 1x USB-A (QC 4.0)" },
        { key: "Material", value: "Flame Retardant Polycarbonate" },
      ],
      features: ["GaN Fast Charge Tech", "Over-current protection", "Foldable plug design"],
      compatibilityInfo: "MacBook Pro, iPad Pro, iPhone, Samsung Galaxy, and other USB-C laptops",
      warrantyInfo: "2-Year official Get Online warranty",
      shippingInfo: "Ships in robust packaging. COD available.",
      images: [{ url: "/images/gan-charger.png", publicId: "gan_charger", order: 0 }],
      variants: [
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-HC-120W-GAN-BLK", price: 79, stock: 35 },
        { name: "White", color: "White", sku: "GG-HC-120W-GAN-WHT", price: 79, stock: 25 },
      ],
    },
    {
      name: "TactileAir Slim Mechanical Keyboard",
      slug: "tactileair-slim-mechanical",
      shortDescription: "Ultra-quiet Brown Switches wireless keyboard.",
      fullDescription: "Premium workspace aesthetic meets responsive, comfortable typing. Constructed with a low-profile anodized aluminum case and keycaps, this mechanical keyboard offers custom quiet brown tactile switches and a long-lasting rechargeable battery.",
      category: categoriesMap["keyboards"],
      brand: "TactileAir",
      basePrice: 189,
      costPrice: 90,
      SKU: "GG-TA-KEYBOARD",
      stockQuantity: 30,
      lowStockThreshold: 4,
      status: "active" as const,
      featured: true,
      bestSeller: false,
      newArrival: false,
      tags: ["wireless", "mechanical", "keyboard"],
      specifications: [
        { key: "Layout", value: "75% Minimalist" },
        { key: "Switches", value: "Low-profile Tactile Brown" },
        { key: "Backlight", value: "Subtle Warm Amber LED" },
      ],
      features: ["Multi-device Bluetooth connection", "USB-C wired option", "Aluminum chassis"],
      compatibilityInfo: "macOS, Windows, iOS, Android, iPadOS",
      warrantyInfo: "2-Year official Get Online warranty",
      shippingInfo: "Ships in design-forward packaging.",
      images: [{ url: "/images/prod-keyboard.png", publicId: "prod_keyboard", order: 0 }],
      variants: [
        { name: "Space Grey", color: "Space Grey", sku: "GG-TA-KEY-SGRY", price: 189, stock: 18 },
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-TA-KEY-BLK", price: 189, stock: 12 },
      ],
    },
    {
      name: "Horizon Watch Series X",
      slug: "horizon-watch-series-x",
      shortDescription: "Rugged smartwatch with 7-Day battery life.",
      fullDescription: "Crafted for performance. Features an aerospace-grade titanium watch cover, scratch-resistant sapphire crystal screen, heart-rate tracking, and smart notifications. Includes a comfortable sport band.",
      category: categoriesMap["smartwatches"],
      brand: "Horizon",
      basePrice: 329,
      compareAtPrice: 399,
      costPrice: 160,
      SKU: "GG-HZ-WATCH-X",
      stockQuantity: 20,
      lowStockThreshold: 3,
      status: "active" as const,
      featured: true,
      bestSeller: false,
      newArrival: true,
      tags: ["wearables", "smartwatch", "fitness"],
      specifications: [
        { key: "Display", value: "1.9-inch Always-on AMOLED" },
        { key: "Battery Life", value: "Up to 7 days normal use" },
        { key: "Waterproofing", value: "IP68 & 5ATM water resistant" },
      ],
      features: ["Heart Rate monitor", "Sleep analytics", "Dual-band GPS"],
      compatibilityInfo: "iOS 14+ and Android 8.0+",
      warrantyInfo: "2-Year official warranty",
      shippingInfo: "Express shipping options. COD available.",
      images: [{ url: "/images/cat-smartwatch.png", publicId: "cat_smartwatch", order: 0 }],
      variants: [
        { name: "Titanium Grey", color: "Titanium Grey", sku: "GG-HZ-WT-TGRY", price: 329, stock: 12 },
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-HZ-WT-BLK", price: 329, stock: 8 },
      ],
    },
    {
      name: "Precision Mouse X1",
      slug: "precision-mouse-x1",
      shortDescription: "Ergonomic high-precision optical tracking mouse.",
      fullDescription: "Designed for absolute comfort and precision. The Precision Mouse X1 offers a dual Bluetooth + wireless receiver connection, customizable scroll wheel sensitivity, and custom side navigation buttons.",
      category: categoriesMap["mice"],
      brand: "Get Online",
      basePrice: 89,
      costPrice: 40,
      SKU: "GG-GG-MOUSE-X1",
      stockQuantity: 40,
      lowStockThreshold: 5,
      status: "active" as const,
      featured: false,
      bestSeller: true,
      newArrival: false,
      tags: ["wireless", "mouse", "ergonomic"],
      specifications: [
        { key: "Resolution", value: "Up to 4000 DPI" },
        { key: "Weight", value: "95g" },
        { key: "Battery", value: "USB-C rechargeable, 70-day range" },
      ],
      features: ["Flow multi-device control", "Silent click buttons", "Infinite scroll toggle"],
      compatibilityInfo: "Windows, macOS, Linux, iPadOS",
      warrantyInfo: "2-Year official warranty",
      images: [{ url: "/images/hero.png", publicId: "hero_desk", order: 0 }],
      variants: [
        { name: "Space Grey", color: "Space Grey", sku: "GG-GG-MS-SGRY", price: 89, stock: 25 },
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-GG-MS-BLK", price: 89, stock: 15 },
      ],
    },
    {
      name: "Nexus 8-in-1 USB Hub",
      slug: "nexus-8-in-1-hub",
      shortDescription: "Dual HDMI output, USB-C pass-through expansion dock.",
      fullDescription: "Maximize your desktop connectivity. Instantly adds dual HDMI outputs (4K@60Hz support), 3x USB 3.0 ports, SD/MicroSD card readers, and a high-power 100W USB-C Power Delivery pass-through port.",
      category: categoriesMap["usb-hubs"],
      brand: "Get Online",
      basePrice: 69,
      costPrice: 30,
      SKU: "GG-GG-HUB-NEXUS",
      stockQuantity: 50,
      lowStockThreshold: 8,
      status: "active" as const,
      featured: false,
      bestSeller: true,
      newArrival: false,
      tags: ["hub", "usb-c", "desktop"],
      specifications: [
        { key: "Input Port", value: "USB-C" },
        { key: "Material", value: "Anodized Space Grey Aluminum" },
        { key: "Data Speeds", value: "Up to 5Gbps" },
      ],
      features: ["Dual 4K Display supports", "SD card reader", "100W power throughput"],
      compatibilityInfo: "MacBook Pro, USB-C iPads, and windows laptops",
      warrantyInfo: "2-Year official warranty",
      images: [{ url: "/images/cat-computer.png", publicId: "cat_computer", order: 0 }],
      variants: [
        { name: "Titanium Grey", color: "Titanium Grey", sku: "GG-GG-HB-TGRY", price: 69, stock: 30 },
        { name: "Space Grey", color: "Space Grey", sku: "GG-GG-HB-SGRY", price: 69, stock: 20 },
      ],
    },
    {
      name: "ProLink 2m Braided Cable",
      slug: "prolink-2m-braided-cable",
      shortDescription: "100W Power Delivery certified braided design cable.",
      fullDescription: "Built to last. The ProLink cable features double-braided nylon weave covering, reinforced metallic connectors, and internal smart e-marker chip verifying 100W safe charge transfer.",
      category: categoriesMap["charging-cables"],
      brand: "Get Online",
      basePrice: 15,
      costPrice: 5,
      SKU: "GG-GG-CBL-PROLINK",
      stockQuantity: 120,
      lowStockThreshold: 15,
      status: "active" as const,
      featured: false,
      bestSeller: true,
      newArrival: false,
      tags: ["cable", "braided", "usb-c"],
      specifications: [
        { key: "Length", value: "2 Meters / 6.6 Feet" },
        { key: "Charging Speed", value: "Up to 100W (20V/5A)" },
        { key: "Data Transfer", value: "USB 2.0 (480Mbps)" },
      ],
      features: ["Reinforced connector points", "Tangle-free storage strap", "Premium braided weave"],
      compatibilityInfo: "Any USB-C charger, laptop, phone, or tablet",
      warrantyInfo: "1-Year replacement warranty",
      images: [{ url: "/images/gan-charger.png", publicId: "gan_charger_reused", order: 0 }],
      variants: [
        { name: "Space Grey", color: "Space Grey", sku: "GG-GG-CB-SGRY", price: 15, stock: 50 },
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-GG-CB-BLK", price: 15, stock: 40 },
        { name: "White", color: "White", sku: "GG-GG-CB-WHT", price: 15, stock: 30 },
      ],
    },
    {
      name: "VoltCase Mini Travel Shell",
      slug: "voltcase-mini-travel-shell",
      shortDescription: "Weatherproof hard shell tech accessories organizer case.",
      fullDescription: "Consolidate and protect your daily items. Constructed with high-density EVA shell covering and weatherproof zippers. The internal layout features mesh organizing pockets and flexible straps.",
      category: categoriesMap["storage-devices"],
      brand: "Get Online",
      basePrice: 25,
      costPrice: 10,
      SKU: "GG-GG-CASE-VOLT",
      stockQuantity: 70,
      lowStockThreshold: 10,
      status: "active" as const,
      featured: false,
      bestSeller: true,
      newArrival: false,
      tags: ["case", "storage", "travel"],
      specifications: [
        { key: "Dimensions", value: "20cm x 12cm x 6cm" },
        { key: "Weight", value: "120g" },
        { key: "Water Resistance", value: "Splashproof EVA" },
      ],
      features: ["Hard shell shield", "Structured zip tracks", "Interior soft mesh linings"],
      compatibilityInfo: "Chargers, cables, power banks, keys, and memory hubs",
      warrantyInfo: "1-Year warranty",
      images: [{ url: "/images/cat-mobile.png", publicId: "cat_mobile_reused", order: 0 }],
      variants: [
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-GG-CS-BLK", price: 25, stock: 45 },
        { name: "Royal Blue", color: "Royal Blue", sku: "GG-GG-CS-RBLU", price: 25, stock: 25 },
      ],
    },
    {
      name: "BoltCharge 65W GaN Charger",
      slug: "boltcharge-65w-gan-charger",
      shortDescription: "Pocket-sized dual USB-C fast wall charger block.",
      fullDescription: "High speed, minimal footprints. Up to 65W total charging output in a block no larger than a keycard. Ideal for charging laptops and phones on a tight schedule.",
      category: categoriesMap["chargers"],
      brand: "Get Online",
      basePrice: 45,
      costPrice: 18,
      SKU: "GG-BC-65W-GAN",
      stockQuantity: 80,
      lowStockThreshold: 12,
      status: "active" as const,
      featured: false,
      bestSeller: false,
      newArrival: true,
      tags: ["charger", "gan", "65w"],
      specifications: [
        { key: "Max Power Output", value: "65W" },
        { key: "Ports", value: "2x USB-C" },
      ],
      features: ["Pocket-sized design", "Universal compatibility", "Overheating prevention"],
      compatibilityInfo: "MacBook Air, iPad, iPhone, Pixel, Galaxy",
      warrantyInfo: "2-Year warranty",
      images: [{ url: "/images/gan-charger.png", publicId: "gan_charger_default", order: 0 }],
      variants: [
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-BC-65W-GAN-BLK", price: 45, stock: 50 },
        { name: "White", color: "White", sku: "GG-BC-65W-GAN-WHT", price: 45, stock: 30 },
      ],
    },
    {
      name: "Crystal Buds AI Earphones",
      slug: "crystal-buds-ai-earphones",
      shortDescription: "Smart Ambient Mode earbuds with translation features.",
      fullDescription: "Pristine acoustic fidelity boosted by edge-AI algorithms. Features crystal-clear ambient pass-through, real-time audio translation assistance, and a design profile that seals comfortably in the ear canal.",
      category: categoriesMap["earbuds"],
      brand: "Get Online",
      basePrice: 199,
      costPrice: 85,
      SKU: "GG-CR-BUDS-AI",
      stockQuantity: 40,
      lowStockThreshold: 5,
      status: "active" as const,
      featured: false,
      bestSeller: false,
      newArrival: true,
      tags: ["wireless", "audio", "earbuds", "ai"],
      specifications: [
        { key: "Processor", value: "Custom Audio AI chip" },
        { key: "Battery Life", value: "7 hours ANC + 21 hours case" },
      ],
      features: ["Adaptive smart ANC", "Integrated touch control options", "Clear voice mic arrays"],
      compatibilityInfo: "iOS, Android, Windows, macOS",
      warrantyInfo: "2-Year warranty",
      images: [{ url: "/images/prod-buds.png", publicId: "prod_buds_reused", order: 0 }],
      variants: [
        { name: "White", color: "White", sku: "GG-CR-BUDS-WHT", price: 199, stock: 25 },
        { name: "Royal Blue", color: "Royal Blue", sku: "GG-CR-BUDS-RBLU", price: 199, stock: 15 },
      ],
    },
    {
      name: "Titan Keyboard Pro",
      slug: "titan-keyboard-pro",
      shortDescription: "Full layout heavy duty aluminum mechanical keyboard.",
      fullDescription: "The ultimate typing battle station. Formed from solid CNC-machined aluminum with custom dual-shot keycaps, hot-swappable tactile linear red switches, and full RGB backlighting.",
      category: categoriesMap["keyboards"],
      brand: "Get Online",
      basePrice: 229,
      costPrice: 110,
      SKU: "GG-TT-KEY-PRO",
      stockQuantity: 25,
      lowStockThreshold: 3,
      status: "active" as const,
      featured: false,
      bestSeller: false,
      newArrival: true,
      tags: ["keyboard", "mechanical", "rgb", "wired"],
      specifications: [
        { key: "Layout", value: "100% Full Layout" },
        { key: "Switches", value: "Red Linear Hot-swappable" },
        { key: "Weight", value: "1.8 kg" },
      ],
      features: ["Solid aluminum frame", "Double-shot PBT keycaps", "Detachable Type-C cable"],
      compatibilityInfo: "Windows, macOS, Linux",
      warrantyInfo: "2-Year warranty",
      images: [{ url: "/images/prod-keyboard.png", publicId: "prod_keyboard_reused", order: 0 }],
      variants: [
        { name: "Phantom Black", color: "Phantom Black", sku: "GG-TT-KEY-PRO-BLK", price: 229, stock: 25 },
      ],
    },
    {
      name: "GridMouse Pro Wireless",
      slug: "gridmouse-pro-wireless",
      shortDescription: "Ultralight weight multi-device connection mouse.",
      fullDescription: "Shed weight, keep absolute control. The GridMouse Pro weighs only 62 grams, featuring zero-lag latency, up to 26000 DPI sensors, and dual-mode high-polling-rate connections.",
      category: categoriesMap["mice"],
      brand: "Get Online",
      basePrice: 89,
      costPrice: 38,
      SKU: "GG-GM-PRO-WIRELESS",
      stockQuantity: 35,
      lowStockThreshold: 5,
      status: "active" as const,
      featured: false,
      bestSeller: false,
      newArrival: true,
      tags: ["gaming", "mouse", "wireless", "ultralight"],
      specifications: [
        { key: "Weight", value: "62 Grams" },
        { key: "DPI Range", value: "100 - 26,000 DPI" },
        { key: "Battery Life", value: "90 hours in performance mode" },
      ],
      features: ["62g super lightweight shape", "High speed optical switches", "Triple connection setup"],
      compatibilityInfo: "Windows, macOS, Linux",
      warrantyInfo: "2-Year warranty",
      images: [{ url: "/images/hero.png", publicId: "hero_desk_reused", order: 0 }],
      variants: [
        { name: "Space Grey", color: "Space Grey", sku: "GG-GM-PRO-SGRY", price: 89, stock: 20 },
        { name: "White", color: "White", sku: "GG-GM-PRO-WHT", price: 89, stock: 15 },
      ],
    },
  ];

  const productsList: any[] = [];
  for (const prod of productsData) {
    productsList.push({
      _id: new mongoose.Types.ObjectId().toString(),
      ...prod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Write backups
  console.log("Writing seed backups to local JSON files...");
  fs.writeFileSync(path.join(DATA_DIR, "categories.json"), JSON.stringify(categoriesList, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "products.json"), JSON.stringify(productsList, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "admins.json"), JSON.stringify([adminDoc], null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "store_settings.json"), JSON.stringify(storeSettingsDoc, null, 2));
  console.log("JSON backups written successfully!");

  // If online, insert to MongoDB
  if (dbConnected && connectDB && Category && Product && Admin && StoreSettings && Coupon) {
    try {
      console.log("Clearing existing MongoDB collections...");
      await Category.deleteMany({});
      await Admin.deleteMany({});
      await StoreSettings.deleteMany({});
      await Product.deleteMany({});
      await Coupon.deleteMany({});

      console.log("Inserting categories to MongoDB...");
      await Category.insertMany(categoriesList);

      console.log("Inserting admin to MongoDB...");
      await Admin.create(adminDoc);
      console.log("Inserting settings to MongoDB...");
      await StoreSettings.create(storeSettingsDoc);
      console.log("Inserting products to MongoDB...");
      await Product.insertMany(productsList);
      console.log("Inserting coupons to MongoDB...");
      await Coupon.create([
        {
          code: "WELCOME10",
          discountType: "percentage",
          discountValue: 10,
          minOrderValue: 0,
          expiryDate: new Date("2030-12-31T23:59:59Z"),
          active: true,
          usageLimit: 1000,
          usageCount: 0,
        },
        {
          code: "GIZMO20",
          discountType: "percentage",
          discountValue: 20,
          minOrderValue: 50,
          expiryDate: new Date("2030-12-31T23:59:59Z"),
          active: true,
          usageLimit: 1000,
          usageCount: 0,
        }
      ]);
      console.log("All records written to MongoDB Atlas successfully!");
    } catch (dbErr) {
      console.error("Failed to seed MongoDB Atlas database:", dbErr);
    } finally {
      mongoose.connection.close();
    }
  }

  console.log("Database seeding completed!");
}

seed().catch((err) => {
  console.error("Error during database seeding:", err);
  process.exit(1);
});
