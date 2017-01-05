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

function getCourseOfferings(courseSubject,courseCode,courseData){
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

$('#courseForm').on('submit',function(e){
	e.preventDefault();
    var courseData=$(this).serializeArray();
    getCourseOfferings(courseData[0].value,courseData[1].value,$(this).serialize());
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
    getCourseOfferings(courseData['courseSubject'],courseData['courseCode'],courseData);
});

//coursetable setup and functions
function setup(){
    document.getElementById('studyTerms').value = '8';
    document.getElementById('offTerms').value = '6';
    createTable(8,6,[2,5,7,9,11,12]);
    // for (var x=table.rows.length-1; x>0; x--) {
    //    table.deleteRow(x);
    // }
}
setup();

function createTable(study,work,defaultCheck){
    var table=document.getElementById("coursetable");
    var cols=study+work;
    var semesters=['F','W','S'];
    var headers=[];
    var workterms=0;
    var studyterms=0;
    for (var x=0; x<cols ; x++){
        if (defaultCheck.indexOf(x)>-1){
            workterms++;
            headers[x]=semesters[x%3]+" - W"+workterms;
        }
        else{
            studyterms++;
            var suffix;
            var term;
            if (studyterms%2==1) {
                term=(studyterms+1)/2;
                suffix='A'
            } else {
                term=studyterms/2;
                suffix='B';
            }
            headers[x]=semesters[x%3]+" - "+term+suffix;
        }
    }
    for (var x=0; x<cols ; x++){
        $("#coursetable thead tr").append("<th>"+headers[x]+"</th>");
    }
    var row=table.insertRow(1);
    for (var y=0; y<cols; y++){
        var cell = row.insertCell(y);
        if (defaultCheck.indexOf(y)>-1)
            cell.innerHTML = "<input type='checkbox' id='checkbox"+y+"'' checked />";
        else
            cell.innerHTML = "<input type='checkbox' id='checkbox"+y+"'' />";
    }
    for(var x=0; x<7; x++){
        row=table.insertRow(2);
        for (var y=0; y<cols; y++){
            var cell = row.insertCell(y);
            cell.innerHTML = "<button type = 'button' class = 'btn btn-success' id='addbutton'>Add</button>";
        }
    }
}

$("td").on("click", '#deletebutton', function(){
   $(this).closest("td").html("<button type = 'button' class = 'btn btn-success' id='addbutton'>Add</button>");
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
        $.ajax({
            type     : "POST",
            cache    : false,
            url      : '/reqoff',
            data     : courseData,
            success  : function(data) {
                if (data.indexOf(curSem[0])>-1){
                    td.html(courseData['courseSubject']+courseData['courseCode']+" <button type = 'button' class = 'btn btn-danger' id='deletebutton'>X</button>");
                    $('#tabledialogue').html('Course succesfully added to '+curSem+'.');
                }
                else{
                    $('#tabledialogue').html('Course not offered in this semester.');
                }
            }
        });
    } else{
        $('#tabledialogue').html('Please choose a course first.');
    }
});

$('input[type="checkbox"]').click(function(){
    if($(this).prop("checked") == true){
        console.log("Checkbox is checked.");
    }
    else if($(this).prop("checked") == false){
        console.log("Checkbox is unchecked.");
    }
});

$("#tableForm").on('submit',(function(e) {
    e.preventDefault();
    console.log("wtf");
    var val = $("input[type=submit][clicked=true]").val()

    console.log(e);

}));