var express = require('express');
var im = require('imagemagick');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var s3 = require('multer-s3');
var AWS = require('aws-sdk');

var accessKeyId = process.env.AWS_ACCESS_KEY || "AKIAJFKOBOO2UC2YJ57A";
var secretAccessKey = process.env.AWS_SECRET_KEY || "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";

var app = express();
AWS.config.loadFromPath('./aws-config.json');
var s3bucket = new AWS.S3({params: {Bucket: 'dreambear-captions', Body: 'EXPECTED CONTENTS'}});

const AWS_PATH = 'https://s3.amazonaws.com/dreambear-captions/';

// multer-s3
var upload = multer({
    storage: s3({
        dirname: './raw/',
        bucket: 'dreambear-captions',
        secretAccessKey: "fZhQOYRyGUdWPIPAekX4d4acHKfh8InXloJM7GXW",
        accessKeyId: "AKIAJFKOBOO2UC2YJ57A",
        region: 'us-east-1',
    })
});

app.set('views', path.join(__dirname, 'views'));
app.set('view enginer', 'ejs');
app.use("/images", express.static(__dirname + '/public/images'));
app.use("/uploads", express.static(__dirname + '/public/uploads'));

app.get('/', function(req, res) {
	// res.writeHead(200, {'Content-Type': 'text/html'});
    console.log('path: ' + AWS_PATH);

	res.render('index.ejs');
});

app.post('/upload', upload.single('photo'), function(req, res) {
	// console.log('inside upload:', req.file);
    var filename = req.file.originalname;

	// im.crop({
	// 	srcPath: AWS_PATH + 'raw/' + filename,
	// 	dstPath: AWS_PATH + 'tmp/' + + filename,
	// 	width: 366,
	// 	height: 244,
	// 	quality: 1,
	// 	gravity: 'Center'
	// }, function(err, stdout, stderr) {
	// 	if (err) throw err;
	// 	im.convert([AWS_PATH + 'temp/' + filename, '-gravity', 'South', '-fill', 'rgba(0,0,0,.5)', '-draw', 'rectangle +0+170+366+244', '-fill', 'white', '-font', 'Helvetica', '-gravity', 'South', '-pointsize', '15', '-annotate', '+0+30', req.body.textCaption, AWS_PATH + 'final/' + filename], function(err, stdout) {
	// 		if (err) throw err;
	// 		// fs.unlinkSync("public/uploads/tmp/" + req.file.originalname);
	// 		// fs.unlinkSync("public/uploads/raw/" + req.file.originalname);
	// 		res.redirect('uploads/final/' + req.file.originalname)
	// 	});
	// });

    im.crop({
		srcPath: AWS_PATH + 'raw/' + filename,
		dstPath: 'uploads/tmp/test',
		width: 366,
		height: 244,
		quality: 1,
		gravity: 'Center'
	}, function(err, stdout, stderr) {
		if (err) throw err;

        s3bucket.putObject({
            Key: 'tmp/test.jpg',
            Body: new Buffer(stdout, 'binary'),
            ContentType: 'image/jpeg'
        }, function(err, data) {
            if (err) {
                console.log('Failing to save to S3: ', err);
            } else {
                console.log('uploaded to s3');
            }
        })
	});


});

var server = app.listen(process.env.PORT || 3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
});
