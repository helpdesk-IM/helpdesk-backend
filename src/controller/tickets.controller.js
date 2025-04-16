require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const ftp = require("basic-ftp");
const { Client } = require("basic-ftp");
const sendEmail = require('../controller/email.controller.js')




// model

const ticketModel = require('../models/tickets.model.js');
const userModel = require('../models/users.model.js')
const mongoose = require('mongoose')

// const storage = new Storage(path.join(__dirname, 'service-account.json'))
const storage = new Storage({
  credentials: {
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
});

// Google bucket reference
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME);

// Upload function

const createTicket = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => {
      console.error(err);
      return res.status(500).send('Upload failed');
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${blob.name}`;
      res.status(200).send({ message: 'File uploaded successfully', url: publicUrl });
    });

    // Use buffer directly for upload
    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// const createTicket = async (req, res) => {
//   try {
//     const { clientId, title, description, menuPath, module, comment } = req.body;

//     // Check if the clientId exists in the User collection
//     const user = await userModel.findById(clientId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Generate a unique ticket number (Example: TICK-12345)
//     const ticketNumber = `TICK-${Math.floor(10000 + Math.random() * 90000)}`;

//     // Create the ticket with the clientId reference
//     const newTicket = new Ticket({
//       ticketNumber,
//       clientId: user._id, // Reference to the User model
//       title,
//       description,
//       menuPath,
//       module,
//       comment,
//     });

//     await newTicket.save();
//     res.status(201).json({ message: "Ticket created successfully", data: newTicket });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const createTicket = async (req, res) => {
//   try {
//     const { clientId, title, description, menuPath, module, comment } = req.body;

//     // Check if clientId is provided
//     if (!clientId) {
//       return res.status(400).json({ error: 'Client ID is required' });
//     }

//     // Find the user by clientId
//     const user = await userModel.findOne({ clientId });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     let publicUrl = null;

//     // Check if a file is uploaded
//     if (req.file) {
//       const blob = bucket.file(req.file.originalname);
//       const blobStream = blob.createWriteStream({
//         resumable: false,
//       });

//       blobStream.on('error', (err) => {
//         console.error(err);
//         return res.status(500).json({ error: 'File upload failed' });
//       });

//       blobStream.on('finish', async () => {
//         publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${blob.name}`;

//         // Create the ticket after the file is uploaded
//         const newTicket = new ticketModel({
//           ticketNumber: `TKT-${Date.now()}`,
//           clientId: user.clientId,
//           title,
//           description,
//           attatchment: publicUrl,
//           menuPath,
//           module,
//           comment,
//           status: 'raised',
//         });

//         await newTicket.save();
//         res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
//       });

//       // Upload the file
//       blobStream.end(req.file.buffer);
//     } else {
//       // If no file, create ticket without attachment
//       const newTicket = new ticketModel({
//         ticketNumber: `TKT-${Date.now()}`,
//         clientId: user.clientId,
//         title,
//         description,
//         attatchment: publicUrl,
//         menuPath,
//         module,
//         comment,
//         status: 'raised',
//       });

//       await newTicket.save();
//       res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };




// post tickets
const postTickets = async (req, res) => {
  try {
    const { clientId, title, raisedBy, status, createdBy, attachment, comments, } = req.body;

    // Validate status if provided
    const validStatuses = ["raised", "onGoing", "resolved"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Create a new ticket
    const newTicket = new ticketModel({
      clientId,
      title,
      raisedBy,
      status,
      createdBy,
      attachment: attachment || null,
      comments: comments || []
    });

    await newTicket.save();
    res.status(201).json({ message: "Ticket created successfully", newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: error.message });
  }
};

const postTicketAttachment = async (req, res) => {
  try {
    const { clientId, title, description, menuPath, module } = req.body;

    if (!clientId || !title || !description || !menuPath || !module) {
      return res.status(400).json({ error: "Please enter all required fields" });
    }

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => {
      console.error(err);
      return res.status(500).json({ error: 'Upload failed' });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${blob.name}` || null;

      // Generate new ticket number
      const lastTicket = await ticketModel.findOne().sort({ createdAt: -1 });
      let newTicketNumber = "TKT-001";

      if (lastTicket && lastTicket.ticketNumber) {
        const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[1], 10);
        newTicketNumber = `TKT-${String(lastNumber + 1).padStart(4, "0")}`;
      }

      // Create a new ticket
      const newTicket = new ticketModel({
        ticketNumber: newTicketNumber,
        clientId,
        title,
        description,
        menuPath,
        module,
        attatchment: publicUrl,
      });

      await newTicket.save();
      res.status(201).json({ message: "Ticket created successfully", newTicket });
    });

    blobStream.end(req.file.buffer);

  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: error.message });
  }
};

// post attatchments

// const postTicketAttachmentFtp = async (req, res) => {
//   try {
//     const { clientId, title, description, menuPath, module } = req.body;

//     if (!clientId || !title || !description || !menuPath || !module) {
//       return res.status(400).json({ error: "Please enter all required fields" });
//     }

//     if (!req.file) {
//       return res.status(400).send("No file uploaded.");
//     }

//     const remoteFolder = "helpdesk";
//     const remoteFileName = req.file.originalname;

//     const tempFilePath = path.join(__dirname, "../../uploads", remoteFileName);
//     fs.writeFileSync(tempFilePath, req.file.buffer);

//     const client = new ftp.Client();
//     client.ftp.verbose = false;

//     const FTP_CONFIG = {
//       host: "srv680.main-hosting.eu",  // Your FTP hostname
//       user: "u948610439",       // Your FTP username
//       password: "Bsrenuk@1993",   // Your FTP password
//       secure: false                    // Set to true if using FTPS
//   };

//     try {
//       // await client.access({
//       //   host: process.env.FTP_HOST,
//       //   user: process.env.FTP_USER,
//       //   password: process.env.FTP_PASSWORD,
//       //   secure: false,
//       // });

//       await client.access(FTP_CONFIG);


//       await client.ensureDir(remoteFolder);

//       // Debug: confirm file exists
//       if (!fs.existsSync(tempFilePath)) {
//         console.error("Local file not found before FTP upload:", tempFilePath);
//         return res.status(500).send("Temporary file not found.");
//       }

//       console.log("Uploading to:", `${remoteFolder}/${remoteFileName}`);
//       await client.uploadFrom(tempFilePath, `${remoteFolder}/${remoteFileName}`);
//     } catch (ftpError) {
//       console.error("FTP Upload error:", ftpError);
//       return res.status(500).json({ error: "Failed to upload to FTP" });
//     } finally {
//       client.close();
//       fs.unlinkSync(tempFilePath);
//     }

//     const publicUrl = `ftp://${process.env.FTP_HOST}/${remoteFolder}/${remoteFileName}`;

//     const lastTicket = await ticketModel.findOne().sort({ createdAt: -1 });
//     let newTicketNumber = "TKT-0001";

//     if (lastTicket && lastTicket.ticketNumber) {
//       const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[1], 10);
//       newTicketNumber = `TKT-${String(lastNumber + 1).padStart(4, "0")}`;
//     }

//     const newTicket = new ticketModel({
//       ticketNumber: newTicketNumber,
//       clientId,
//       title,
//       description,
//       menuPath,
//       module,
//       attachment: publicUrl, // fixed typo here
//     });

//     await newTicket.save();

//     res.status(201).json({ message: "Ticket created successfully", newTicket });
//   } catch (error) {
//     console.error("Error creating ticket:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


// const postTicketAttachmentFtp = async (req, res) => {
//   try {
//     const { clientId, title, description, menuPath, module } = req.body;

//     if (!clientId || !title || !description || !menuPath || !module) {
//       return res
//         .status(400)
//         .json({ error: "Please enter all required fields" });
//     }

//     if (!req.file) {
//       return res.status(400).send("No file uploaded.");
//     }

//     console.log("Received file:", req.file.originalname);
//      const fileName = req.file.originalname;
//     const tempFilePath = path.join(__dirname, fileName);
//     fs.writeFileSync(tempFilePath, req.file.buffer);
//     console.log("File written to temp path");

//     const remoteFilePath = `/public_html/helpdesk/${fileName}`;
//     console.log(tempFilePath, remoteFilePath)

//     try {
//       await uploadToFTP(tempFilePath, remoteFilePath);
//     } catch (err) {
//       fs.unlinkSync(tempFilePath);
//       return res
//         .status(500)
//         .json({ error: "FTP Upload Failed", details: err.message });
//     }

//     fs.unlinkSync(tempFilePath);
//     const publicUrl = `https://inventionminds.com/helpdesk/${fileName}`;

//     // const publicUrl = ftp://${process.env.FTP_HOST}/${remoteFolder}/${remoteFileName};

//     const lastTicket = await ticketModel.findOne().sort({ createdAt: -1 });
//     let newTicketNumber = "TKT-0001";

//     if (lastTicket && lastTicket.ticketNumber) {
//       const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[1], 10);
//       newTicketNumber = `TKT-${String(lastNumber + 1).padStart(4, "0")}`;
//     }

//     const newTicket = new ticketModel({
//       ticketNumber: newTicketNumber,
//       clientId,
//       title,
//       description,
//       menuPath,
//       module,
//       attatchment: publicUrl,
//     });

//     await newTicket.save();
//     console.log("Ticket saved successfully.");

//     res.status(201).json({ message: "Ticket created successfully", newTicket });
//   } catch (error) {
//     console.error("Error creating ticket:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// const postTicketAttachmentFtp = async (req, res) => {
//   try {
//     const { clientId, title, description, menuPath, module, prefix, productName, clientName, ticketFor } = req.body;

//     // Check only the required fields (file is now optional)
//     if (!clientId || !title || !description || !menuPath || !prefix || !productName || !clientName || !ticketFor) {
//       return res
//         .status(400)
//         .json({ error: "Please enter all required fields" });
//     }

//     let publicUrl = null; // Default to null if no file is uploaded

//     if (typeof req.body.menuPath === 'string') {
//       try {
//         req.body.menuPath = JSON.parse(req.body.menuPath);
//       } catch (err) {
//         console.error('Error parsing menuPath:', err);
//         req.body.menuPath = []; // fallback
//       }
//     }

//     // Handle file upload if a file is provided
//     if (req.file) {
//       console.log("Received file:", req.file.originalname);
//       const fileName = req.file.originalname;
//       const tempFilePath = path.join(__dirname, fileName);
//       fs.writeFileSync(tempFilePath, req.file.buffer);
//       console.log("File written to temp path");

//       const remoteFilePath = `/public_html/helpdesk/${fileName}`;
//       console.log(tempFilePath, remoteFilePath);

//       try {
//         await uploadToFTP(tempFilePath, remoteFilePath);
//       } catch (err) {
//         fs.unlinkSync(tempFilePath);
//         return res
//           .status(500)
//           .json({ error: "FTP Upload Failed", details: err.message });
//       }

//       fs.unlinkSync(tempFilePath);
//       publicUrl = `https://inventionminds.com/helpdesk/${fileName}`;
//     }

//     const upperPrefix = prefix.toUpperCase();

//     // Find the latest ticket for the specific prefix
//     const lastTicket = await ticketModel
//       .findOne({ ticketNumber: { $regex: `^TKT-${upperPrefix}-\\d{4}$` } })
//       .sort({ createdAt: -1 });

//     let newTicketNumber = `TKT-${upperPrefix}-0001`;

//     if (lastTicket && lastTicket.ticketNumber) {
//       const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[2], 10);
//       newTicketNumber = `TKT-${upperPrefix}-${String(lastNumber + 1).padStart(4, "0")}`;
//     }
//     // Create new ticket (attachment is optional)
//     const newTicket = new ticketModel({
//       ticketNumber: newTicketNumber,
//       clientId,
//       title,
//       description,
//       menuPath,
//       module,
//       attatchment: publicUrl, // Will be null if no file was uploaded,
//       productName,
//       clientName,
//       ticketFor,
//       adminNotification : true
//     });

//     await newTicket.save();
//     console.log("Ticket saved successfully.");

//     res.status(201).json({ message: "Ticket created successfully", newTicket });
//   } catch (error) {
//     console.error("Error creating ticket:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

const postTicketAttachmentFtp = async (req, res) => {
  try {
    const { clientId, title, description, menuPath, module, prefix, productName, clientName, ticketFor } = req.body;

    // Check only the required fields (file is now optional)
    if (!clientId || !title || !description || !menuPath || !prefix || !productName || !clientName || !ticketFor) {
      return res
        .status(400)
        .json({ error: "Please enter all required fields" });
    }

    // Parse menuPath if it’s a string
    let parsedMenuPath = menuPath;
    if (typeof menuPath === 'string') {
      try {
        parsedMenuPath = JSON.parse(menuPath);
        // Validate that parsedMenuPath is an array of objects with a 'name' property
        if (!Array.isArray(parsedMenuPath) || !parsedMenuPath.every(item => typeof item === 'object' && 'name' in item)) {
          throw new Error('Invalid menuPath format: Expected an array of objects with a "name" property');
        }
      } catch (err) {
        console.error('Error parsing menuPath:', err.message);
        return res.status(400).json({ error: 'Invalid menuPath data format', details: err.message });
      }
    } else if (!Array.isArray(parsedMenuPath)) {
      return res.status(400).json({ error: 'menuPath must be an array or valid JSON string' });
    }

    let publicUrl = null; // Default to null if no file is uploaded

    // Handle file upload if a file is provided
    if (req.file) {
      console.log("Received file:", req.file.originalname);
      const fileName = req.file.originalname;
      const tempFilePath = path.join(__dirname, fileName);
      fs.writeFileSync(tempFilePath, req.file.buffer);
      console.log("File written to temp path");

      const remoteFilePath = `/public_html/helpdesk/${fileName}`;
      console.log(tempFilePath, remoteFilePath);

      try {
        await uploadToFTP(tempFilePath, remoteFilePath);
      } catch (err) {
        fs.unlinkSync(tempFilePath);
        return res
          .status(500)
          .json({ error: "FTP Upload Failed", details: err.message });
      }

      fs.unlinkSync(tempFilePath);
      publicUrl = `https://inventionminds.com/helpdesk/${fileName}`;
      console.log(publicUrl, "public url")
    }

    const upperPrefix = prefix.toUpperCase();

    // Find the latest ticket for the specific prefix
    const lastTicket = await ticketModel
      .findOne({ ticketNumber: { $regex: `^TKT-${upperPrefix}-\\d{4}$` } })
      .sort({ createdAt: -1 });

    let newTicketNumber = `TKT-${upperPrefix}-0001`;

    if (lastTicket && lastTicket.ticketNumber) {
      const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[2], 10);
      newTicketNumber = `TKT-${upperPrefix}-${String(lastNumber + 1).padStart(4, "0")}`;
    }

    // Create new ticket (attachment is optional)
    const newTicket = new ticketModel({
      ticketNumber: newTicketNumber,
      clientId,
      title,
      description,
      menuPath: parsedMenuPath, // Use the parsed and validated menuPath
      module,
      attatchment: publicUrl, // Fixed typo: 'attatchment' to 'attachment'
      productName,
      clientName,
      ticketFor,
      adminNotification: true
    });

    await newTicket.save();
    console.log("Ticket saved successfully.");

    res.status(201).json({ message: "Ticket created successfully", newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: error.message });
  }
};

const FTP_CONFIG = {
  host: "srv680.main-hosting.eu",  // Your FTP hostname
  user: "u948610439",       // Your FTP username
  password: "Bsrenuk@1993",   // Your FTP password
  secure: false                    // Set to true if using FTPS
};

async function uploadToFTP(localFilePath, fileName) {
  const client = new Client();
  client.ftp.verbose = true;

  try {
    await client.access(FTP_CONFIG);

    console.log("Connected to FTP Server!");
    await client.ensureDir("/public_html/helpdesk"); // 🔥 Correct path
    await client.uploadFrom(localFilePath, fileName); // ✅ Upload just the filename

    console.log(`Uploaded: ${fileName}`);
    await client.close();
  } catch (error) {
    console.error("FTP Upload Error:", error);
    throw new Error("FTP upload failed: " + error.message);
  }
}

// Helper function to create and save the ticket

// const postTicketAttachment = async (req, res) => {
//   try {
//     let { clientId, title, description, menuPath, module, comment } = req.body;

//     // Convert clientId to ObjectId if it is a valid MongoDB ID
//     if (!mongoose.Types.ObjectId.isValid(clientId)) {
//       return res.status(400).json({ error: "Invalid clientId format" });
//     }

//     clientId = new mongoose.Types.ObjectId(clientId);

//     if (!title || !description || !menuPath || !module) {
//       return res.status(400).json({ error: "Please enter all required fields" });
//     }

//     // File Handling
//     let attachment = "";
//     if (req.file) {
//       attachment = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${req.file.originalname}`;
//     }

//     // Generate new ticket number
//     const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
//     let newTicketNumber = "TKT-001";

//     if (lastTicket && lastTicket.ticketNumber) {
//       const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[1], 10);
//       newTicketNumber = `TKT-${String(lastNumber + 1).padStart(4, "0")}`;
//     }

//     // Create new ticket
//     const newTicket = new Ticket({
//       ticketNumber: newTicketNumber,
//       clientId,
//       title,
//       description,
//       menuPath,
//       module,
//       attachment,
//       comment,
//       status: "raised",
//     });

//     await newTicket.save();
//     res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });

//   } catch (error) {
//     console.error("Error saving ticket:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


const getAllTickets = async (req, res) => {
  try {
    const allTickets = await ticketModel.find()
      .populate('userDetails') // <-- populates based on the virtual field
    res.status(201).json(allTickets)
  }
  catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTicketsByClientId = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Fetch tickets
    const ticketsById = await ticketModel.find({ clientId });

    // Fetch user manually
    const userDetails = await userModel.findOne({ clientId });

    if (!ticketsById.length) {
      return res.status(404).json({ message: "No tickets found for this clientId" });
    }

    // Merge user details into tickets manually
    const result = ticketsById.map(ticket => ({
      ...ticket._doc,
      userDetails
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const id = req.params.id
    const { description } = req.body
    const updateTicket = await ticketModel.findByIdAndUpdate(
      id,
      { $set: { description } },
      { new: true }
    )

    return res.status(201).json(updateTicket)
  }
  catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

// const addCommentToTicket = async (req, res) => {
//   const ticketId = req.params.id;
//   const { comment, commentedBy } = req.body;

//   if (!comment || !commentedBy) {
//     return res.status(400).json({ error: 'Comment and commentedBy are required.' });
//   }

//   try {
//     const updatedTicket = await ticketModel.findOneAndUpdate(
//       { ticketNumber: ticketId },
//       {
//         $push: {
//           comments: {
//             comment,
//             commentedBy,
//             commentedAt: new Date()
//           }
//         }
//       },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({ error: 'Ticket not found.' });
//     }

//     res.status(200).json(updatedTicket);
//   } catch (error) {
//     console.error('Add Comment Error:', error);
//     res.status(500).json({ error: 'Server error while adding comment.' });
//   }
// };


// const updateTicketFields = async (req, res) => {
//   try {
//     const { ticketNumber } = req.params;
//     const { clientPriority, status, adminStatus } = req.body;

//     const updateFields = {};
//     const currentTime = new Date();

//     // ✅ Handle clientPriority update and its timestamp
//     if (clientPriority) {
//       updateFields.clientPriority = clientPriority;
//       updateFields[`clientPriorityTimestamps.${clientPriority}`] = currentTime;
//     }

//     // ✅ Handle status update and its timestamp
//     if (status) {
//       updateFields.status = status;
//       updateFields[`statusTimestamps.${status.replace('-', '')}`] = currentTime;
//     }

//     // ✅ Handle adminStatus update and its timestamp
//     if (adminStatus) {
//       updateFields.adminStatus = adminStatus;

//       // Format adminStatus key like "Dev done" => "devDone"
//       const camelKey = adminStatus
//         .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
//           index === 0 ? word.toLowerCase() : word.toUpperCase()
//         )
//         .replace(/\s+/g, '');

//       updateFields[`adminStatusTimestamps.${camelKey}`] = currentTime;
//     }

//     const updatedTicket = await ticketModel.findOneAndUpdate(
//       { ticketNumber },
//       { $set: updateFields },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({ message: 'Ticket not found' });
//     }

//     res.status(200).json({ message: 'Ticket updated', ticket: updatedTicket });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error updating ticket', error });
//   }
// };

// const addCommentToTicket = async (req, res) => {
//   const ticketId = req.params.id;
//   const { comment, commentedBy } = req.body;

//   if (!comment || !commentedBy) {
//     return res.status(400).json({ error: 'Comment and commentedBy are required.' });
//   }

//   try {
//     let commentAttachmentUrl = null;

//     // Handle file upload if a file is provided
//     if (req.file) {
//       const blob = bucket.file(req.file.originalname);
//       const blobStream = blob.createWriteStream({
//         resumable: false,
//       });

//       // Wrap blobStream in a Promise to handle async upload
//       await new Promise((resolve, reject) => {
//         blobStream.on('error', (err) => {
//           console.error('Upload Error:', err);
//           reject(err);
//         });

//         blobStream.on('finish', () => {
//           commentAttachmentUrl = `https://storage.googleapis.com/${process.env.GOOGLE_STORAGE_BUCKET_NAME}/${blob.name}`;
//           resolve();
//         });

//         blobStream.end(req.file.buffer);
//       });
//     }

//     // Update the ticket with the new comment
//     const updatedTicket = await ticketModel.findOneAndUpdate(
//       { ticketNumber: ticketId },
//       {
//         $push: {
//           comments: {
//             comment,
//             commentedBy,
//             commentAttachment: commentAttachmentUrl, // Store the URL or null if no file
//             commentedAt: new Date(),
//           },
//         },
//       },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({ error: 'Ticket not found.' });
//     }

//     res.status(200).json(updatedTicket);
//   } catch (error) {
//     console.error('Add Comment Error:', error);
//     res.status(500).json({ error: 'Server error while adding comment.' });
//   }
// };  


const addCommentToTicket = async (req, res) => {
  const ticketId = req.params.id;
  const { comment, commentedBy } = req.body;

  if (!comment || !commentedBy) {
    return res.status(400).json({ error: 'Comment and commentedBy are required.' });
  }

  try {
    let commentAttachmentUrl = null;

    // Handle file upload if a file is provided
    if (req.file) {
      console.log("Received file:", req.file.originalname);

      // Generate a file path
      const fileName = req.file.originalname;
      const tempFilePath = path.join(__dirname, fileName);
      fs.writeFileSync(tempFilePath, req.file.buffer); // Write the file to temp storage
      console.log("File written to temp path");

      // FTP Upload logic
      const remoteFilePath = `/public_html/helpdesk/${fileName}`;
      console.log(`Uploading file to: ${remoteFilePath}`);

      const ftpClient = new Client();
      try {
        await ftpClient.access({
          host: "srv680.main-hosting.eu",  // Your FTP hostname
          user: "u948610439",       // Your FTP username
          password: "Bsrenuk@1993",   // Your FTP password
          secure: false  
        });

        // Upload file to FTP server
        await ftpClient.uploadFrom(tempFilePath, remoteFilePath);
        console.log("File uploaded to FTP successfully");

        // Set the public URL to access the file from the FTP server
        commentAttachmentUrl = `https://inventionminds.com/helpdesk/${fileName}`;
      } catch (err) {
        console.error("FTP Upload Failed:", err.message);
        return res.status(500).json({ error: "FTP Upload Failed", details: err.message });
      } finally {
        ftpClient.close();
        // Remove the temporary file after upload
        fs.unlinkSync(tempFilePath);
      }
    }

    // Update the ticket with the new comment
    const updatedTicket = await ticketModel.findOneAndUpdate(
      { ticketNumber: ticketId },
      {
        $push: {
          comments: {
            comment,
            commentedBy,
            commentAttachment: commentAttachmentUrl, // Store the FTP file URL if uploaded
            commentedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ error: "Server error while adding comment." });
  }
};

const updateClientPriority = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { clientPriority } = req.body;
    const ticket = await ticketModel.findOne({ ticketNumber });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.clientPriority === clientPriority) {
      return res.status(200).json({ message: "No update needed. Same priority." });
    }

    const updateFields = {
      clientPriority,
      [`clientPriorityTimestamps.${clientPriority}`]: new Date(),
    };

    const updated = await ticketModel.findOneAndUpdate(
      { ticketNumber },
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ message: "Client priority updated", ticket: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error", error });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { status } = req.body;
    const ticket = await ticketModel.findOne({ ticketNumber });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.status === status) {
      return res.status(200).json({ message: "No update needed. Same status." });
    }

    const formattedStatusKey = status.replace('-', '');
    const updateFields = {
      status,
      clientNotification : true,
      [`statusTimestamps.${formattedStatusKey}`]: new Date(),
    };

    const updated = await ticketModel.findOneAndUpdate(
      { ticketNumber },
      { $set: updateFields },
      { new: true }
    );

    if (status === 'resolved') {
      const to = 'rithish.manohar006@gmail.com'; // or wherever you store the client's email
      const subject = `Ticket #${ticketNumber} has been resolved ✅`;
      const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #4CAF50;">Your ticket has been resolved!</h2>
          <p style="color: #000; font-family: 'Trebuchet MS', Tahoma, sans-serif; font-size: 16px;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p style="color: #000; font-family: 'Trebuchet MS', Tahoma, sans-serif; font-size: 16px;"><strong>Status:</strong> ${status}</p>
          <p style="font-family: 'Trebuchet MS'">Thank you for your patience. If you have further concerns, feel free to reply to this email.</p>
          <br/>
          <p style="font-size: 12px; color: gray;">&copy; 2025 Your Company</p>
        </div>
      `;

      await sendEmail(to, subject, html); // your custom mail function
    }

    res.status(200).json({ message: "Status updated", ticket: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error", error });
  }


};

const updateAdminStatus = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { adminStatus } = req.body;
    const ticket = await ticketModel.findOne({ ticketNumber });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.adminStatus === adminStatus) {
      return res.status(200).json({ message: "No update needed. Same admin status." });
    }

    const camelKey = adminStatus
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');

    const updateFields = {
      adminStatus,
      [`adminStatusTimestamps.${camelKey}`]: new Date(),
    };

    const updated = await ticketModel.findOneAndUpdate(
      { ticketNumber },
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ message: "Admin status updated", ticket: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error", error });
  }
};

const clientNotificationFalse = async(req, res) => {
  try{
    const {ticketNumber} = req.params

    if (!ticketNumber) return res.status(404).json({ message: "Ticket not found" });

    const updated = await ticketModel.findOneAndUpdate(
      { ticketNumber },
      { $set: {clientNotification : false} },
    );

    res.status(200).json({ message: "Status updated", ticket: updated });

  }
  catch(error){
    res.status(500).json({ message: error.message })
  }
}

const adminNotificationFalse = async(req, res) => {
  try{
    const {ticketNumber} = req.params

    if (!ticketNumber) return res.status(404).json({ message: "Ticket not found" });

    const updated = await ticketModel.findOneAndUpdate(
      { ticketNumber },
      { $set: {adminNotification : false} },
    );

    res.status(200).json({ message: "Status updated", ticket: updated });

  }
  catch(error){
    res.status(500).json({ message: error.message })
  }
}



module.exports = { postTickets, createTicket, getAllTickets, postTicketAttachment, getTicketsByClientId, updateTicket, postTicketAttachmentFtp, addCommentToTicket, updateClientPriority, updateStatus, updateAdminStatus, clientNotificationFalse, adminNotificationFalse };
