var express = require('express');
var im = require('imagemagick');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
// var s3 = require('multer-s3');
// var upload = multer();
var AWS = require('aws-sdk');

// default multer disk storage
// var multer = multer({ dest: 'public/uploads/'});
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads/raw')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// })

// multer-s3
// var upload = multer({
//     storage: s3({
//         dirname: './raw/',
//         bucket: 'dreambear-captions',
//         secretAccessKey: "fZhQOYRyGUdWPIPAekX4d4acHKfh8InXloJM7GXW",
//         accessKeyId: "AKIAJFKOBOO2UC2YJ57A",
//         region: 'us-east-1'
//     })
// });

var accessKeyId = process.env.AWS_ACCESS_KEY || "AKIAJFKOBOO2UC2YJ57A";
var secretAccessKey = process.env.AWS_SECRET_KEY || "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";

// var upload = multer({ storage: storage })
// app.use(multer({dest: './public/uploads'}).single('photo'));
// var s3 = new AWS.S3();

var app = express();

// aws-sdk
app.use(multer({
  limits : { fileSize:100000 },
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase();
  },
  onFileUploadData: function (file, data, req, res) {
    // file : { fieldname, originalname, name, encoding, mimetype, path, extension, size, truncated, buffer }
    var params = {
      Bucket: 'dreambear-captions',
      Key: file.name,
      Body: data,
      ContentType: 'image/jpgeg'
    };

    s3.putObject(params, function (perr, pres) {
      if (perr) {
        console.log("Error uploading data: ", perr);
      } else {
        console.log("Successfully uploaded data to myBucket/myKey");
      }
    });
  }
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view enginer', 'ejs');
app.use("/images", express.static(__dirname + '/public/images'));
app.use("/uploads", express.static(__dirname + '/public/uploads'));

app.get('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.render('index.ejs');
});

app.post('/upload', upload.single('photo'), function(req, res) {
	console.log(req.file);

	// im.crop({
	// 	srcPath: 'public/uploads/raw/' + req.file.originalname,
	// 	dstPath: 'public/uploads/tmp/' + req.file.originalname,
	// 	width: 366,
	// 	height: 244,
	// 	quality: 1,
	// 	gravity: 'Center'
	// }, function(err, stdout, stderr) {
	// 	if (err) throw err;
	// 	im.convert(['public/uploads/tmp/' + req.file.originalname, '-gravity', 'South', '-fill', 'rgba(0,0,0,.5)', '-draw', 'rectangle +0+170+366+244', '-fill', 'white', '-font', 'Helvetica', '-gravity', 'South', '-pointsize', '15', '-annotate', '+0+30', req.body.textCaption, 'public/uploads/final/' + req.file.originalname], function(err, stdout) {
	// 		if (err) throw err;
	// 		// console.log('stdout: ', stdout);
	// 		// res.render("index.ejs");
	// 		fs.unlinkSync("public/uploads/tmp/" + req.file.originalname);
	// 		fs.unlinkSync("public/uploads/raw/" + req.file.originalname);
	// 		res.redirect('uploads/final/' + req.file.originalname)
	// 	});
	// });

    res.send("Successfully Uploaded!");

});

var server = app.listen(process.env.PORT || 3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
});
