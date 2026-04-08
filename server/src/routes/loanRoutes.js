const express = require('express');
const router = express.Router();
const { createLoan, getLoan } = require('../controllers/loanController');
const { validateLoan, validateUUIDParam } = require('../middleware/validateRequest');

router.post('/', validateLoan, createLoan);
router.get('/:id', validateUUIDParam, getLoan);

module.exports = router;
