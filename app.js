var express = require('express');
var im = require('imagemagick');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
// var multer = multer({ dest: 'public/uploads/'});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/raw')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: storage })

var app = express();

// app.use(multer({dest: './public/uploads'}).single('photo'));

app.set('views', path.join(__dirname, 'views'));
app.set('view enginer', 'ejs');
app.use("/images", express.static(__dirname + '/public/images'));
app.use("/uploads", express.static(__dirname + '/public/uploads'));

var form = "<!DOCTYPE HTML><html><body>" +
"<form method='post' action='/upload' enctype='multipart/form-data'>" +
"<input type='file' name='photo'/>" + "<input type='text' name='textCaption' /> " +
"<input type='submit' /></form>" +
"</body></html>";

app.get('/', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(form);
});

app.post('/upload', upload.single('photo'), function(req, res) {
	console.log(req.file);
	// res.redirect('uploads/' + req.file.originalname);

	im.crop({
		srcPath: 'public/uploads/raw/' + req.file.originalname,
		dstPath: 'public/uploads/tmp/' + req.file.originalname,
		width: 366,
		height: 244,
		quality: 1,
		gravity: 'Center'
	}, function(err, stdout, stderr) {
		if (err) throw err;
		im.convert(['public/uploads/tmp/' + req.file.originalname, '-gravity', 'South', '-fill', 'rgba(0,0,0,.5)', '-draw', 'rectangle +0+170+366+244', '-fill', 'white', '-font', 'Helvetica', '-gravity', 'South', '-pointsize', '15', '-annotate', '+0+30', req.body.textCaption, 'public/uploads/final/' + req.file.originalname], function(err, stdout) {
			if (err) throw err;
			console.log('stdout: ', stdout);
			// res.render("index.ejs");
			fs.unlinkSync("public/uploads/tmp/" + req.file.originalname);
			fs.unlinkSync("public/uploads/raw/" + req.file.originalname);
			res.redirect('uploads/final/' + req.file.originalname)
		});
	});

});

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
});
