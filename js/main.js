$('form').on('submit',function(e){
	e.preventDefault();
	console.log("submitted");

    $.ajax({
        type     : "POST",
        cache    : false,
        url      : $(this).attr('action'),
        data     : $(this).serialize(),
        success  : function(data) {
        	console.log(data);
        }
    });
});