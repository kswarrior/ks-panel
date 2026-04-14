const { db } = require('../utils/db');

async function isAdmin(req, res, next) {
    if (!req.session?.user) {
        return res.redirect('/auth/login');
    }

    const user = await db.get('users', req.session.user.userId);

    if (!user || user.admin !== true) {
        return res.redirect('/');
    }

    req.user = user;
    next();
}

module.exports = { isAdmin };
