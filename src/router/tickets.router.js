const express = require('express');
const router = express.Router();
const multer = require('multer');
const {verifyAdmin, verifyUser, authMiddleware} = require('../auth/verifyToken.js')
const { postTickets, createTicket, getAllTickets, postTicketAttachment, getTicketsByClientId, updateTicket, postTicketAttachmentFtp } = require('../controller/tickets.controller.js');

// Ensure uploads folder exists
const upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 50 * 1024 * 1024} });

router.get('/tickets', verifyAdmin, getAllTickets)
router.post('/tickets', verifyAdmin, upload.single('file'), createTicket);
router.post('/tickets-post', upload.single('file'), postTicketAttachmentFtp);
router.get('/tickets/:id', verifyUser, getTicketsByClientId)
router.put('/tickets/:id', updateTicket)

module.exports = router;