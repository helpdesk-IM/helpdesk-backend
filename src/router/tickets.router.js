const express = require('express');
const router = express.Router();
const multer = require('multer');
const {verifyAdmin, verifyUser, authMiddleware} = require('../auth/verifyToken.js')
const { postTickets, createTicket, getAllTickets, postTicketAttachment, getTicketsByClientId, updateTicket, postTicketAttachmentFtp, addCommentToTicket, updateAdminStatus, updateStatus, updateClientPriority, clientNotificationFalse, adminNotificationFalse } = require('../controller/tickets.controller.js');

// Ensure uploads folder exists
const upload = multer({ storage: multer.memoryStorage(), limits: {fileSize: 50 * 1024 * 1024} });

router.get('/tickets', verifyAdmin, getAllTickets)
router.post('/tickets', verifyAdmin, upload.single('file'), createTicket);
router.post('/tickets-post', upload.single('file'), postTicketAttachmentFtp);
router.get('/tickets/:id', verifyUser, getTicketsByClientId);
router.put('/tickets/:id', updateTicket);
router.post('/tickets/:id/comments', verifyAdmin, upload.single('file'), addCommentToTicket);
// router.put('/ticket/:ticketNumber/update-fields', updateTicketFields);
router.put("/update-client-priority/:ticketNumber", updateClientPriority);
router.put("/update-status/:ticketNumber", updateStatus);
router.put("/update-admin-status/:ticketNumber", updateAdminStatus);
router.put("/update-clientNotification/ticket/:ticketNumber", clientNotificationFalse)
router.put("/update-adminNotification/ticket/:ticketNumber", adminNotificationFalse)
module.exports = router;