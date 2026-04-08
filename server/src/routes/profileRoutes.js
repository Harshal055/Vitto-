const express = require('express');
const router = express.Router();
const { createProfile, getProfile } = require('../controllers/profileController');
const { validateProfile, validateUUIDParam } = require('../middleware/validateRequest');

router.post('/', validateProfile, createProfile);
router.get('/:id', validateUUIDParam, getProfile);

module.exports = router;
