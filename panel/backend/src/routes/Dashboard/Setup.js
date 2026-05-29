const express = require('express');
const router = express.Router();
const { db } = require('../../handlers/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

router.get('/setup/admin', async (req, res) => {
    const users = await db.get("users");
    if (users && users.length > 0) return res.status(403).json({ error: 'Setup already completed' });

    res.json({
        setupRequired: true,
        name: (await db.get('settings'))?.name || 'KS Panel'
    });
});

router.post('/api/setup/admin', async (req, res) => {
    const users = await db.get("users");
    if (users && users.length > 0) return res.status(403).json({ error: 'Setup already completed' });

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const newUsers = [{
        userId,
        username,
        email,
        password: hashedPassword,
        accessTo: [],
        admin: true,
        owner: true,
        verified: true,
    }];

    await db.set("users", newUsers);

    res.json({ success: true });
});

module.exports = router;
