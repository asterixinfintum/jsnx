"use strict";

var express = require('express');
var app = express();
var multer = require('multer');
var fs = require('fs');
var path = require('path');

// Configure the file storage destination and filename using Multer
var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Create a file filter to accept only JSON files
var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JSON files are allowed.'), false);
  }
};

// Configure Multer with storage and file filter
var upload = multer({
  storage: storage,
  fileFilter: fileFilter
});
app.post('/upload', upload.single('file'), function (req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded or invalid file type.');
  }

  // Read and parse the uploaded JSON file
  fs.readFile(req.file.path, 'utf8', function (err, data) {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error reading uploaded file.');
    }
    try {
      var jsonData = JSON.parse(data);
      // Process the JSON data as needed
      console.log('Uploaded JSON data:', jsonData);
      res.status(200).json({
        message: 'File uploaded and processed successfully',
        data: jsonData
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      res.status(400).send('Invalid JSON file.');
    }
  });
});
app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.status(400).send('File upload error: ' + err.message);
  } else if (err) {
    res.status(500).send('Server error: ' + err.message);
  } else {
    next();
  }
});
app.listen(3000, function () {
  return console.log('Server is running on port 3000');
});