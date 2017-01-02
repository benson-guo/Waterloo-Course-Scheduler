function getCourseData(courseSubject,courseCode,courseData){
    $.ajax({
        type     : "POST",
        cache    : false,
        url      : '/reqdescript',
        data     : courseData,
        success  : function(data) {
            $('#coursedialogue').html('');
            $('#courseTitle').html('<h3>'+courseSubject.toUpperCase()+' '+courseCode.toUpperCase()+' - '+data['title']+"</h3>");
            if (data.length==0){
                $('#courseDescript').html('Description not available.');
                $('#coursePrereq').html('');
                $('#courseAntireq').html('');
                $('#courseCoreq').html('');
            } else{
                $('#courseDescript').html(data['description']);
                $('#coursePrereq').html('Prerequisites: '+data['prerequisites']);
                $('#courseAntireq').html('Antirequisites: '+data['antirequisites']);
                $('#courseCoreq').html('Corequisites: '+data['corequisites']);
            }
        }
    });
}

function getCourseOfferrings(courseSubject,courseCode,courseData){
    for (var x=0; x<4; x++){
        document.getElementById("o"+(x+1)).style.visibility = "hidden";
    }
    $.ajax({
        type     : "POST",
        cache    : false,
        url      : '/reqoff',
        data     : courseData,
        success  : function(data) {
            if (data=='invalid'){
                $('#coursedialogue').html('Invalid course subject/code entered.');
                $('#courseTitle').html('');
                $('#courseDescript').html('');
                $('#coursePrereq').html('');
                $('#courseAntireq').html('');
                $('#courseCoreq').html('');
                return;
            }
            getCourseData(courseSubject,courseCode,courseData);
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
}

$('form').on('submit',function(e){
	e.preventDefault();
    var courseData=$(this).serializeArray();
    getCourseOfferrings(courseData[0].value,courseData[1].value,$(this).serialize());
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
    var subject=$('#subjectSelect :selected').text();
    var course=$('#courseSelect :selected').text();
    var courseData={};
    courseData['courseSubject']=subject;
    courseData['courseCode']=course.substring(0,course.indexOf('-')-1);
    getCourseOfferrings(courseData['courseSubject'],courseData['courseCode'],courseData);
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
    var table=document.getElementById("coursetable");
    var curSem=table.rows[0].cells[$(this).closest("td")[0].cellIndex].innerHTML;
    var td=$(this).closest("td");
    var course=$('#courseTitle').html().substring(4,$('#courseTitle').html().indexOf('-'));
    if (course!=''){
        var courseData={};
        courseData['courseSubject']=course.substring(0,course.indexOf(' '));
        courseData['courseCode']=course.substring(course.indexOf(' ')+1,course.length-1);
        var termsOfferred=[];
        $.ajax({
            type     : "POST",
            cache    : false,
            url      : '/reqoff',
            data     : courseData,
            success  : function(data) {
                if (data.indexOf(curSem[0])>-1){
                    td.html(courseData['courseSubject']+courseData['courseCode']+" <button id='deletebutton'>X</button>");
                    $('#tabledialogue').html('Course succesfully added to '+curSem+'.')
                }
                else{
                    $('#tabledialogue').html('Course not offerred in this semester.')
                }
            }
        });
    } else{
        $('#tabledialogue').html('Please choose a course first.')
    }
});