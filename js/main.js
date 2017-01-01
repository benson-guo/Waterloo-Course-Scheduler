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

$.ajax({
    type     : "POST",
    cache    : false,
    url      : '/reqsub',
    success  : function(data) {
        for(var x=2; x<=data.length; x++){
            $('#subjectSelect').append($('<option>', {
                value: x,
                text: data[x-2]
            }));
        }
    }
});

$("#subjectSelect").change(function(){
    $('#courseSelect')
    .find('option')
    .remove()
    .end()
    $('#courseSelect').append($('<option>', {
        disabled : 'disabled',
        value: 1,
        text: 'Choose Course'
    }))
    $("#courseSelect").val("1");
    $.ajax({
        type     : "POST",
        cache    : false,
        url      : '/reqcourses',
        data     : { 'subj' : $('#subjectSelect :selected').text()},
        success  : function(data) {
            for(var x=2; x<=data['courses'].length+1; x++){
                $('#courseSelect').append($('<option>', {
                    value: x,
                    text: data['courses'][x-2]+' - '+data['titles'][x-2]
                }));
            }
        }
    });
});

$("#courseSelect").change(function(){
    console.log($('#courseSelect :selected').text());
    var subject=$('#subjectSelect :selected').text();
    var course=$('#courseSelect :selected').text();
    $('#courseTitle').html('<h3>'+subject+' '+course+"</h3>");
    var courseData={};
    courseData['courseSubject']=subject;
    courseData['courseCode']=course.substring(0,course.indexOf('-')-1);
    $.ajax({
        type     : "POST",
        cache    : false,
        url      : '/reqdescript',
        data     : courseData,
        success  : function(data) {
            if (data.length==0){
                $('#courseDescript').html('Description not available.');
                $('#coursePrereq').html('');
                $('#courseAntireq').html('');
                $('#courseCoreq').html('');
            } else{
                console.log('whatt');
                $('#courseDescript').html(data['description']);
                $('#coursePrereq').html('Prerequisites: '+data['prerequisites']);
                $('#courseAntireq').html('Antirequisites: '+data['antirequisites']);
                $('#courseCoreq').html('Corequisites: '+data['corequisites']);
            }
        }
    });
});

//coursetable setup and functions
function setup(){
    var table=document.getElementById("coursetable");
    var numCols=table.rows[0].cells.length;
    for(var x=0; x<7; x++){
        var row=table.insertRow(1);
        for (var y=0; y<numCols; y++){
            var cell = row.insertCell(y);
            cell.innerHTML = "<button id='addbutton'>Add</button>";
        }
    }
}
setup();
$("td").on("click", '#deletebutton', function(){
   $(this).closest("td").html("<button id='addbutton'>Add</button>");
});

$("td").on("click", '#addbutton', function(){
    $(this).closest("td").html("Mark <button id='deletebutton'>X</button>");
});