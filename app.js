var express = require('express');
// var im = require('imagemagick');
var gm = require('gm').subClass({imageMagick: true});
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
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/js", express.static(__dirname + '/public/js'));

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.post('/upload', upload.single('photo'), function(req, res) {
    var filename = req.file.originalname.replace(" ", "+");
    console.log('raw image: ', AWS_PATH + 'raw/' + filename);
    console.log('from: ', AWS_PATH + 'raw/' + filename);
    console.log('to: ', AWS_PATH + 'final/' + req.file.originalname.replace(" ", "%2B"));

    gm(AWS_PATH + 'raw/' + filename)
        .resize(null, 366)
        .gravity('Center')
        .crop(366, 244, 0, 0)
        .fill('rgba(0,0,0,.7)')
        .drawRectangle(0, 180, 366, 244)
        .fill('#FFFFFF')
        .font("Helvetica-Bold")
        .fontSize(15)
        .drawText(0, 93, req.body.textCaption, 'Center')
        .toBuffer('JPG', function(err, buffer) {
                s3bucket.putObject({
                    Key: 'final/' + filename,
                    Body: buffer,
                    ContentType: 'image/jpeg'
                }, function(err, data) {
                    if (err) {
                        console.log('Failing to save to S3: ', err);
                    } else {
                        console.log('uploaded temp to s3');
                        res.render('photo.ejs', { imagePath: AWS_PATH + 'final/' + req.file.originalname.replace(" ", "%2B") });
                    }
                })
        });
});

var server = app.listen(process.env.PORT || 3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
});
