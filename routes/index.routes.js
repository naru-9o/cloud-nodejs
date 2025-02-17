const express = require('express');
const multer = require('../config/multer.config'); // Import your multer configuration
const imageKit = require('../config/imagekit.config'); // Import ImageKit configuration
const fileModel = require('../models/files.model')
const authMiddleware = require('../middlewares/authe')

const router = express.Router();

// Serve the home page
router.get('/home', authMiddleware, async (req, res) => {

    const userFiles = await fileModel.find({ 
        user: req.user.userId 
    });
    res.render('home', {
        files: userFiles
    }); // Assuming you have a template engine like EJS or Pug configure
});

// Handle file upload
router.post('/upload-file', authMiddleware, multer.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('<h1>No file selected. Please go back and try again!</h1>');
        }

        // Upload file to ImageKit
        const uploadResponse = await imageKit.upload({
            file: req.file.buffer, // File buffer
            fileName: req.file.originalname, // Original file name
        });


        // Save file metadata to MongoDB
        const newFile = await fileModel.create({
            path: uploadResponse.url, // Store ImageKit URL as path
            orignalname: req.file.originalname, // The original file name
            user: req.user.userId, // User ID
        });
    

        // Send success response
        res.send(`
            <h1 style="color: blue; font-size: 2rem; text-align: center;">File Uploaded Successfully!</h1>
            <p style="color: gray; font-size: 1.2rem; text-align: center;">URL: <a href="${uploadResponse.url}" target="_blank" style="color: green; text-decoration: underline;">${uploadResponse.url}</a></p>
            <a href="/home" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: blue; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; ">Back to Home</a>
        `);          
          
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('<h1>Failed to upload file. Please try again later!</h1>');
    }
});




router.get('/download/:path', authMiddleware, async (req, res) => {
    try {
        console.log('Download request received');   // Log the request
        const loggedInUser = req.user.userId;
        const encodedPath = req.params.path;
        const decodedPath = decodeURIComponent(encodedPath);

        console.log('Encoded Path:', encodedPath);
        console.log('Decoded Path:', decodedPath);
        console.log('Logged-in User:', loggedInUser);

        // Find the file in the database
        const file = await fileModel.findOne({
            user: loggedInUser,
            path: decodedPath,
        });

        if (!file) {
            console.error('File not found or unauthorized access');
            return res.status(401).json({ message: 'Unauthorized' });
        }

         // Extract relative path
        const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
        const relativePath = decodedPath.replace(urlEndpoint, "");

        // Generate signed URL
        const signedUrl = imageKit.url({
            path: relativePath,  // Pass the correct file path here
            transformation: [],
            expirySeconds: 60, // URL will expire in 60 seconds
        });

        console.log('Signed URL:', signedUrl);
        res.redirect(signedUrl);
    } catch (error) {
        console.error('Error in download route:', error);
        res.status(500).json({ message: 'Server error' });
    }

});



module.exports = router;
