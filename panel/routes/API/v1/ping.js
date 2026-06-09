const { Router } = require('../../../lib/fastify-router-shim.js');
const router = Router();

router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
