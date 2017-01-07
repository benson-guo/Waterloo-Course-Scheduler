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
    createTable(8,6,[2,5,7,9,11,12],[]);
}
setup();

var checkboxAction=function() {
    var cols=$("#coursetable").find('tr')[0].cells.length;
    var countChecked=0;
    var workTermsIndices=[];
    for (var x=0; x<cols ; x++){
        if ($("#checkbox"+x).prop("checked") == true){
            workTermsIndices.push(x);
            countChecked++;
        }
    }
    var distribution=getTermDistriubtion();
    if (countChecked==distribution[1]){
        resetTable();
        createTable(distribution[0],distribution[1],workTermsIndices,[]);
        resetButtons();
    }
};

var addButtonAction=function() {
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
};

var deleteButtonAction=function() {
    $(this).closest("td").html("<button type = 'button' class = 'btn btn-success' id='addbutton'>Add</button>");
};

function resetButtons(){
    $("td").on("click", '#deletebutton', deleteButtonAction);
    $("td").on("click", '#addbutton', addButtonAction);
    $('input[type="checkbox"]').click(checkboxAction);
}

function createTable(study,work,defaultCheck,cells){
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
        row=table.insertRow(x+2);
        for (var y=0; y<cols; y++){
            var cell = row.insertCell(y);
            if (cells.length>0)
                cell.innerHTML = cells[x][y];
            else
                cell.innerHTML = "<button type = 'button' class = 'btn btn-success' id='addbutton'>Add</button>";
        }
    }
}

resetButtons();

function getTermDistriubtion(){
    var cols=$("#coursetable").find('tr')[0].cells.length;
    var distribution=[0,0];
    for (var x=0; x<cols; x++){
        var header=$("#coursetable").find('tr')[0].cells[x].innerHTML;
        if (header[header.indexOf('-')+2]=='W')
            distribution[1]++;
        else
            distribution[0]++;
    }
    return distribution;
}

// div wrapper resets table html
function resetTable(){
    $("#tablewrapper").html("<table class='table' id='coursetable'> <thead> <tr> </tr> </thead> <tbody> </tbody> </table>");
}

$('input[type="checkbox"]').click(checkboxAction);

$("#tableForm").on('submit',(function(e) {
    e.preventDefault();
    var table=document.getElementById("coursetable");
    var studyTerms=Number($(this).serializeArray()[0].value);
    var workTerms=Number($(this).serializeArray()[1].value);
    var workTermsIndices=[];
    // if standard work/study, default to sequence 2
    if (workTerms==6 && studyTerms==8){
        workTermsIndices=[2,5,7,9,11,12];
    }
    // otherwise, make first coop the 2nd index, every even index after that. If more are required ,go back to the beginning and push odd numbers
    else {
        var index=2;
        var count=0;
        var cols=studyTerms+workTerms;
        while (index<cols && count<workTerms){
            workTermsIndices.push(index);
            index+=2;
            count++;
        }
        for (var x=0; x<cols; x++){
            if (workTermsIndices.indexOf(x)<0 && count<workTerms){
                workTermsIndices.push(x);
                count++;
            }
        }
    }
    resetTable();
    createTable(studyTerms,workTerms,workTermsIndices,[]);
    resetButtons();
}));

$( "#save" ).click(function() {
  $('#tabledialogue').html('Current table saved.');
  var distribution=getTermDistriubtion();
  var cols=distribution[0]+distribution[1];
  var workTermsIndices=[];
  for (var x=0; x<cols ; x++){
      if ($("#checkbox"+x).prop("checked") == true){
          workTermsIndices.push(x);
      }
  }
  var cells=[];
  for(var x=2 ; x<=8; x++){
    cells.push([]);
    for (var y=0; y<cols ; y++){
        cells[x-2].push($("#coursetable").find('tr')[x].cells[y].innerHTML);
    }
  }
  localStorage.setItem('distribution', JSON.stringify(distribution));
  localStorage.setItem('workTermsIndices', JSON.stringify(workTermsIndices));
  localStorage.setItem('cells', JSON.stringify(cells));
});

$( "#load" ).click(function() {
    var cells=localStorage.getItem('cells');
    if (cells==null){
        $('#tabledialogue').html('Nothing saved.');
    } else{
        cells=JSON.parse(cells);
        var distribution=JSON.parse(localStorage.getItem('distribution'));
        var workTermsIndices=JSON.parse(localStorage.getItem('workTermsIndices'));
        var study=distribution[0];
        var work=distribution[1];
        var cols=study+work;
        document.getElementById('studyTerms').value = study;
        document.getElementById('offTerms').value = work;
        resetTable();
        createTable(study,work,workTermsIndices,cells);
        $('#tabledialogue').html('Loaded saved table.');
        resetButtons();
    }
});