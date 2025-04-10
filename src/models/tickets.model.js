const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber : {
      type : String,
      required : true,
      unique : true,
    },
    clientId : {
      type : String,
      required : true,
    },
    title : {
      type : String,
      required : true,
    },
    description : {
      type : String,
      required : true
    },
    attatchment : {
      type : String,
    },
    menuPath : {
      type : String,
      required : true
    },
    module : {
      type: String,
    },
    comment : {
      type : String
    },
    commentedBy : {
      type : String
    },
    status : {
      type : String,
      enum : ['raised', 'on-going', 'resolved'],
      default : 'raised'
    },
  },
  {
    timestamps : true
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