const express = require('express');
const router = express.Router();
const { fetchUnreadEmails } = require('../services/gmailService');

// @route   GET /api/gmail/fetch-emails
// @desc    Manually trigger fetching unread emails
// @access  Public (for now, will be protected later)
router.get('/fetch-emails', async (req, res) => {
  const emails = await fetchUnreadEmails();
  res.json({ message: `Found ${emails.length} emails.`, emails });
});

module.exports = router;