var express = require('express');
// var im = require('imagemagick');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var s3 = require('multer-s3');
var AWS = require('aws-sdk');
var favicon = require('serve-favicon');

var app = express();
// AWS.config.loadFromPath('./aws-config.json');
AWS.config.credentials = {
    	"accessKeyId": process.env.AWS_ACCESS_KEY,
    	"secretAccessKey": process.env.AWS_SECRET,
    	"region": "us-east-1"
    };
var s3bucket = new AWS.S3({params: {Bucket: 'dreambear-captions', Body: 'EXPECTED CONTENTS'}});

const AWS_PATH = 'https://s3.amazonaws.com/dreambear-captions/';

// multer-s3
var upload = multer({
    storage: s3({
        dirname: './raw/',
        bucket: 'dreambear-captions',
        secretAccessKey: process.env.AWS_SECRET,
        accessKeyId: process.env.AWS_ACCESS_KEY,
        region: 'us-east-1',
    })
});

app.set('views', path.join(__dirname, 'views'));
app.set('view enginer', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use("/images", express.static(__dirname + '/public/images'));
app.use("/uploads", express.static(__dirname + '/public/uploads'));
app.use("/css", express.static(__dirname + '/public/css'));
app.use("/js", express.static(__dirname + '/public/js'));

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.post('/upload', upload.single('photo'), function(req, res) {
    if (req.body.imageType == 'videoThumbnail') {
        var filename = req.file.originalname.slice(0, -4).replace(/\s/g, "+");
        var extension = req.file.originalname.slice(-4);
        gm(AWS_PATH + 'raw/' + filename + extension)
            .resize(null, 366)
            .gravity('Center')
            .crop(366, 244, 0, 0)
            .fill('rgba(0,0,0,.8)')
            .drawRectangle(0, 180, 366, 244)
            .fill('#FFFFFF')
            .font("Helvetica-Bold")
            .fontSize(15)
            .drawText(0, 93, req.body.textCaption, 'Center')
            .toBuffer('JPG', function(err, buffer) {
                    s3bucket.putObject({
                        Key: 'final/' + filename + extension,
                        Body: buffer,
                        ContentType: 'image/jpeg'
                    }, function(err, data) {
                        if (err) {
                            console.log('Failed to save to S3: ', err);
                        } else {
                            console.log("Successfully edited and uploaded: " + filename + extension);
                            res.render('photo.ejs', { imagePath: AWS_PATH + 'final/' + req.file.originalname.replace(/\s/g, "%2B") });
                        }
                    });
            });
    } else {
        var filename = req.file.originalname.slice(0, -4).replace(/\s/g, "+");
        var extension = req.file.originalname.slice(-4);
        gm(AWS_PATH + 'raw/' + filename + extension)
            .fuzz('10%')
            .transparent('#ffffff')
            .recolor('0 0 0, 0 0 0, 0 0 0')
            .toBuffer('PNG', function(err, buffer) {
                s3bucket.putObject({
                    Key: 'final/' + filename + ".png",
                    Body: buffer,
                    ContentType: 'image/png'
                }, function(err, data) {
                    if (err) {
                        console.log('Failed to save to S3: ', err);
                    } else {
                        console.log("Successflly edited and uploaded: " + filename + ".png");
                        res.render('photo.ejs', { imagePath: AWS_PATH + 'final/' + req.file.originalname.slice(0, -4).replace(/\s/g, "%2B") + ".png" });
                    }
                });
            });
    }
});

var server = app.listen(process.env.PORT || 3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
});
