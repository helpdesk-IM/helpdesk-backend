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
      required : true
    },
    comment : {
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

module.exports = mongoose.model('Ticket', ticketSchema);