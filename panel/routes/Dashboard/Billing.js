const express = require("express");
const router = express.Router();
const { db } = require("../../handlers/db.js");
const { v4: uuidv4 } = require("uuid");
const { anyAdminPerm } = require("../../utils/isAdmin.js");

// =====================
// USER BILLING ROUTES
// =====================

router.get("/earn", async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const billingSettings = await db.get("billing_settings") || { enabled: false };
  res.render("dashboard/earn", { req, user: req.user, settings: billingSettings });
});

router.get("/billing", async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const [users, billingSettings, packages] = await Promise.all([
    db.get("users") || [],
    db.get("billing_settings") || { enabled: false, currency: "USD" },
    db.get("billing_packages") || []
  ]);

  const dbUser = users.find(u => u.userId === req.user.userId);

  res.render("dashboard/billing", {
    req,
    user: req.user,
    balance: dbUser.credits || 0,
    settings: billingSettings,
    packages
  });
});

// Admin add credits
router.post("/admin/billing/add-credits", anyAdminPerm, async (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || isNaN(amount)) return res.status(400).json({ error: "Invalid data" });

  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === userId);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  users[userIdx].credits = (parseFloat(users[userIdx].credits) || 0) + parseFloat(amount);
  await db.set("users", users);

  res.json({ success: true, newBalance: users[userIdx].credits });
});

// Daily Reward (Earn)
router.post("/billing/daily", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === req.user.userId);
  const user = users[userIdx];

  const now = new Date();
  const lastReward = user.lastDaily ? new Date(user.lastDaily) : new Date(0);

  if (now - lastReward < 24 * 60 * 60 * 1000) {
    const next = new Date(lastReward.getTime() + 24 * 60 * 60 * 1000);
    return res.status(400).json({ error: `Daily reward already claimed. Next in ${Math.ceil((next - now) / (1000 * 60))} minutes.` });
  }

  const settings = await db.get("billing_settings") || {};
  const amount = parseFloat(settings.dailyReward) || 5;
  user.credits = (parseFloat(user.credits) || 0) + amount;
  user.lastDaily = now.toISOString();

  await db.set("users", users);
  res.json({ success: true, amount, newBalance: user.credits });
});

// Coupon System
router.post("/billing/redeem", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code required" });

  const coupons = await db.get("coupons") || [];
  const couponIdx = coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());

  if (couponIdx === -1) return res.status(404).json({ error: "Invalid coupon code" });
  const coupon = coupons[couponIdx];

  if (coupon.uses <= 0) return res.status(400).json({ error: "Coupon expired or fully used" });

  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === req.user.userId);
  const user = users[userIdx];

  user.redeemedCoupons = user.redeemedCoupons || [];
  if (user.redeemedCoupons.includes(coupon.id)) return res.status(400).json({ error: "You already redeemed this coupon" });

  user.credits = (parseFloat(user.credits) || 0) + parseFloat(coupon.amount);
  user.redeemedCoupons.push(coupon.id);
  coupon.uses -= 1;

  await Promise.all([
    db.set("users", users),
    db.set("coupons", coupons)
  ]);

  res.json({ success: true, amount: coupon.amount });
});

// Admin Coupon Management
router.post("/admin/billing/coupons/add", anyAdminPerm, async (req, res) => {
  const { code, amount, uses } = req.body;
  const coupons = await db.get("coupons") || [];
  coupons.push({ id: uuidv4(), code: code.toUpperCase(), amount: parseFloat(amount), uses: parseInt(uses) });
  await db.set("coupons", coupons);
  res.redirect("/admin/settings/dashboard#coupons");
});

// AFK / Earn Logic
router.post("/billing/earn/afk", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === req.user.userId);
  const user = users[userIdx];

  const reward = 0.5; // 0.5 credits per claim
  user.credits = (parseFloat(user.credits) || 0) + reward;

  await db.set("users", users);
  res.json({ success: true, newBalance: user.credits });
});

// YouTube / Video Reward
router.post("/billing/earn/video", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === req.user.userId);
  const user = users[userIdx];

  const reward = 2.0; // 2 credits per video
  user.credits = (parseFloat(user.credits) || 0) + reward;

  await db.set("users", users);
  res.json({ success: true, newBalance: user.credits });
});

// User buy package (Simulated)
router.post("/billing/buy/:packageId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const packages = await db.get("billing_packages") || [];
  const pkg = packages.find(p => p.id === req.params.packageId);
  if (!pkg) return res.status(404).json({ error: "Package not found" });

  // In a real system, you'd integrate Stripe/PayPal here.
  // We'll simulate a successful purchase.
  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === req.user.userId);

  users[userIdx].credits = (parseFloat(users[userIdx].credits) || 0) + parseFloat(pkg.credits);
  await db.set("users", users);

  res.json({ success: true });
});

// Manual Renewal
router.post("/billing/renew/:instanceId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const instance = await db.get(`${req.params.instanceId}_instance`);
  if (!instance || instance.User !== req.user.userId) return res.status(404).json({ error: "Instance not found" });

  const settings = await db.get("billing_settings") || {};
  const cost = parseFloat(settings.renewalCost) || 10;
  const interval = parseInt(settings.renewalInterval) || 30;

  const users = await db.get("users") || [];
  const userIdx = users.findIndex(u => u.userId === req.user.userId);

  if ((users[userIdx].credits || 0) < cost) {
    return res.status(400).json({ error: "Insufficient credits" });
  }

  users[userIdx].credits -= cost;

  // Extend expiration by interval days
  const currentExpiry = instance.expiresAt ? new Date(instance.expiresAt) : new Date();
  const extensionMs = interval * 24 * 60 * 60 * 1000;

  if (currentExpiry < new Date()) {
    instance.expiresAt = new Date(Date.now() + extensionMs).toISOString();
  } else {
    instance.expiresAt = new Date(currentExpiry.getTime() + extensionMs).toISOString();
  }

  await Promise.all([
    db.set("users", users),
    db.set(`${req.params.instanceId}_instance`, instance)
  ]);

  res.json({ success: true, expiresAt: instance.expiresAt });
});

module.exports = router;
