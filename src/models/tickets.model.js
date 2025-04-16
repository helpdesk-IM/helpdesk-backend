const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attatchment: {
      type: String,
    },
    menuPath: [
      {
        name: {
          type: String,
          required: true,
        }
      }
    ],
    module: {
      type: String,
    },
    comments: [
      {
        comment: { type: String, required: true },
        commentAttachment: { type: String },
        commentedBy: { type: String, required: true },
        commentedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ['raised', 'on-going', 'resolved'],
      default: 'raised',
    },
    statusTimestamps: {
      raised: { type: Date },
      onGoing: { type: Date },
      resolved: { type: Date },
    },
    clientPriority: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    clientPriorityTimestamps: {
      low: { type: Date },
      medium: { type: Date },
      high: { type: Date },
    },
    adminStatus: {
      type: String,
      enum: ['In dev', 'Dev done', 'In QA', 'QA Done', 'Deployed', 'Resolved'],
    },
    adminStatusTimestamps: {
      inDev: { type: Date },
      devDone: { type: Date },
      inQA: { type: Date },
      qaDone: { type: Date },
      deployed: { type: Date },
      resolved: { type: Date },
    },
    ticketFor: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    clientNotification: {
      type: Boolean,
      default: false
    },
    adminNotification: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

ticketSchema.virtual("userDetails", {
  ref: "User",
  localField: "clientId",
  foreignField: "clientId",
  justOne: true, // Return a single user object
});

ticketSchema.set('toObject', { virtuals: true });
ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);