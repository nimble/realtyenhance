const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5678;


/* Enable CORS with more specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); */

// Parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, 'public')));

// Test route to verify the server is working
app.get('/test', (req, res) => {
  res.send('Server is working!');
});

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JPG, JPEG, and PNG image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Handle image enhancement requests - explicitly define as POST
app.post('/enhance', upload.single('image'), async (req, res) => {
  console.log('POST /enhance received');
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).send('No image file uploaded');
    }

    const imageFile = req.file;
    console.log(`Received image: ${imageFile.filename}`);

    // Read the image file
    const imageBuffer = fs.readFileSync(imageFile.path);
    
    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Use OpenAI API for image enhancement
    const enhancedImage = await enhanceImageWithOpenAI(base64Image);
    
    // Save the enhanced image
    const enhancedImagePath = path.join(__dirname, 'uploads', 'enhanced-' + imageFile.filename);
    fs.writeFileSync(enhancedImagePath, enhancedImage, 'base64');
    
    // Send the enhanced image back to the client
    res.sendFile(enhancedImagePath);
    
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image: ' + error.message);
  }
});

// Function to enhance image using OpenAI DALL-E API
async function enhanceImageWithOpenAI(base64Image) {
  try {
    // Make sure you have your OpenAI API key in .env file
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing. Please add it to your .env file.');
    }
    
    console.log('Calling OpenAI API...');
    
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/generations',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      data: {
        model: "dall-e-3",
        prompt: "Enhance this house photo. Improve lighting, contrast, and clarity. Make colors vibrant and remove any noise or imperfections. Make it look professional and high quality.",
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      }
    });

    console.log('OpenAI API response received');
    
    // Extract and return the base64 image data
    return response.data.data[0].b64_json;
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    throw new Error('Image enhancement failed: ' + (error.response?.data?.error?.message || error.message));
  }
}

// Options request handler (for CORS preflight)
app.options('/enhance', cors());

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Routes available:');
  console.log('- GET /test - Test if server is running');
  console.log('- POST /enhance - Upload and enhance an image');
});