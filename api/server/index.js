const express = require('express');
const app = express();
const multer = require('multer');
import bodyParser from 'body-parser';
const fs = require('fs');
const path = require('path');
import http from "http";

app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure the file storage destination and filename using Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Create a file filter to accept only JSON files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JSON files are allowed.'), false);
  }
};

// Configure Multer with storage and file filter
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded or invalid file type.');
  }

  // Read and parse the uploaded JSON file
  fs.readFile(req.file.path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading uploaded file.');
    }

    try {
      const jsonData = JSON.parse(data);
      // Process the JSON data as needed
      console.log('Uploaded JSON data:', jsonData);
      res.status(200).json({ message: 'File uploaded and processed successfully', data: jsonData });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(400).send('Invalid JSON file.');
    }
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send('File upload error: ' + err.message);
  } else if (err) {
    res.status(500).send('Server error: ' + err.message);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, async (error) => {
  if (error) {
    return error;
  }

  return console.log(`server started on port here now ${PORT}`);
});