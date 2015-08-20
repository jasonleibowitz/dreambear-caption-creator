[![bitHound Score](https://www.bithound.io/github/jasonleibowitz/dreambear-caption-creator/badges/score.svg)](https://www.bithound.io/github/jasonleibowitz/dreambear-caption-creator/master)

# Dreambear Caption Creator

This is a simple Node/Express app that uses graphicsmagick to resize, crop, and add a caption to uploaded images. Dimensions are pre-configured to make a consistent theme for exported images. Text caption are taken from the upload form. All images are saved to AWS S3.

The site is currently live on Heroku at [http://dreambear-captions.herokuapp.com/](http://dreambear-captions.herokuapp.com/).

## Installation

To save your own copy of this project fork the repo and run ```npm install``` on the repo to install all required node modules.

## Usage

All images are saved to AWS S3, so in order to use it you need to have AWS configured already. Add ```AWS_SECRET``` and ```AWS_ACCESS_KEY``` environment variables to your machine in order to have AWS work correctly.

Once you've configured AWS environment variables, to use this project locally just run ```npm start``` to host this on your local machine.

## Examples

This project will take this original image and output the following edited image:

#### Original Image

<div style="text-align: center;">
	<img src="examples/Matthew_Koma-original.jpg">
</div>

#### Edited Image

The outputted image is 366x244 with a 15px Helvetica bold text caption.

<div style="text-align: center;">
	<img src="examples/Matthew_Koma-final.jpg">
</div>

## Contributing

1. Fork it!
2. Create your feature branch: ```git checkout -b my-new-feature```
3. Commit your changes: ```git commit -am 'Add some feature'```
4. Push to the branch: ```git push origin my-new-feature```
5. Submit a pull request
6. Profit

## License
MIT &copy; [Jason Leibowitz](https://github.com/jasonleibowitz)
