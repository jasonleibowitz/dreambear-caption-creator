$(document).on('ready', function() {
	$(".form-submit-button").on('click', function(){
		$(".container").children().fadeOut();
		var spinner = new Spinner().spin();
		$(".container").append(spinner.el);
	})
})
