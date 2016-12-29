$('form').on('submit',function(e){
	e.preventDefault();
	for (var x=0; x<4; x++){
		document.getElementById("o"+(x+1)).style.visibility = "hidden";
	}
    $.ajax({
        type     : "POST",
        cache    : false,
        url      : $(this).attr('action'),
        data     : $(this).serialize(),
        success  : function(data) {
        	console.log(data);
        	if (data.length==0){
        		document.getElementById("o1").style.visibility = "visible";
        		return;
        	}
        	if (data.indexOf('F')>-1)
        		document.getElementById("o2").style.visibility = "visible";
        	if (data.indexOf('W')>-1)
        		document.getElementById("o3").style.visibility = "visible";
        	if (data.indexOf('S')>-1)
        		document.getElementById("o4").style.visibility = "visible";
        },
        error    : function () {
        	document.getElementById("o1").style.visibility = "visible";
        }
    });
});