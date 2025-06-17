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
      enum: ['New', 'Open', 'Hold', 'In Process', 'Requirement Not Finalized', 'Requirement Not Finalized', 'Commercial Approved', 'Ready', 'Deployed', 'Specification Sent', 'Commercial Sent', 'Complete', 'Closed'],
      default: 'New',
    },
    statusTimestamps: {
      raised: { type: Date },
      onGoing: { type: Date },
      resolved: { type: Date },
    },
    clientPriority: {
      type: String,
      enum: ['Level 1', 'Level 2', 'Level 3'],
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
    ticketType: {
      type: String,
      enum: ['Incident', 'Change Request', 'Understanding the Issue', 'Training / Guidance']
    },
    ticketSubType: {
      type: String,
      enum: ['Limited Impact', 'Business Critical', 'Function Critical', 'Cosmetic Impact', 'Chargeable', 'Non-Chargeable']
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
    },
    lastlyRepliedBy: {
      type : String
    },
    assignedTo : {
      type : String
    }
  },
  {
    timestamps: true,
  },
);

ticketSchema.virtual("userDetails", {
  ref: "User",
  localField: "clientId",
  foreignField: "clientId",
  justOne: true,
});

ticketSchema.set('toObject', { virtuals: true });
ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);