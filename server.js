var http = require('http');
var uwaterlooApi = require('uwaterloo-api');

var config = require('./config.json');
var uwclient = new uwaterlooApi({
	API_KEY : config.api_key
});
var response = require('./query.js');
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

var portTest = 9000;
var port = 8080;

var subjects={}

response.data.getCourseList(uwclient,function(data){
	for (var i in data){
		var nextSub=data[i]['subject'];
		var nextCN=data[i]['catalog_number'];
		if (!(nextSub in subjects)){
			subjects[nextSub]={};
		}
		if (!(nextCN in subjects[nextSub])){
			subjects[nextSub][nextCN]={};
		}
		subjects[nextSub][nextCN]['title']=data[i]['title'];
		subjects[nextSub][nextCN]['course_id']=data[i]['course_id'];
		subjects[nextSub][nextCN]['terms_offered']=[];
	}
	response.data.getTermCourses(uwclient,config.FALL,function(data){
		response.data.updateTermsOfferred(data,subjects,'F');
	});
	response.data.getTermCourses(uwclient,config.WINTER,function(data){
		response.data.updateTermsOfferred(data,subjects,'W');
	});
	response.data.getTermCourses(uwclient,config.SPRING,function(data){
		response.data.updateTermsOfferred(data,subjects,'S');
	});
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/cssFiles', express.static(__dirname+'/css'));
app.use('/jsFiles', express.static(__dirname+'/js'));

app.get('/', function(req,res){
	res.sendFile('index.html',{root: path.join(__dirname, './html')});
});

app.post('/reqoff', function(req,res){
	res.setHeader('Content-Type', 'application/json');
	var subj=req.body.courseSubject.toUpperCase();
	var subc=req.body.courseCode.toUpperCase();
	try{
		res.end(JSON.stringify(subjects[subj][subc]['terms_offered']));
	} catch (err) {
		res.end('No information found on '+subj+subc+'.');
	}
});

app.post('/reqsub', function(req,res){
	res.setHeader('Content-Type', 'application/json');
	var subs=[];
	for (sub in subjects)
		subs.push(sub);
	subs.sort();
	res.end(JSON.stringify(subs));
});

app.post('/reqcourses', function(req,res){
	res.setHeader('Content-Type', 'application/json');
	var cours=[];
	var subj=req.body.subj;
	for (cour in subjects[subj])
		cours.push(cour);
	cours.sort();
	coursName=[];
	for(var x=0; x<cours.length; x++){
		try{
			coursName.push(subjects[subj][cours[x]]['title']);
		} catch(err){
			coursName.push('');
		}
	}
	var data={};
	data['courses']=cours;
	data['titles']=coursName;
	res.end(JSON.stringify(data));
});

app.post('/reqdescript', function(req,res){
	res.setHeader('Content-Type', 'application/json');
	try{
		var requestedID = subjects[req.body.courseSubject][req.body.courseCode]['course_id'];
		response.data.getOfferings(uwclient,requestedID,function(data){
			console.log(data);
			if (data['prerequisites']==null)
                data['prerequisites']='N/A';
            if (data['antirequisites']==null)
                data['antirequisites']='N/A';
            if (data['corequisites']==null)
                data['corequisites']='N/A';
			res.end(JSON.stringify(data));
		});
	} catch (err){
		res.end(JSON.stringify({ "description" : 'Description not available.'}));
	}
});

app.get(/^(.+)$/, function(req,res){
	if (fs.existsSync(__dirname+'/html/'+req.params[0]+'.html')) {
		res.sendFile(req.params[0]+'.html', {root: path.join(__dirname, './html')});
	} else {
		res.status(404).send('Not Found');
	}
});

var listen = function(){
	console.log('Listening!');
}

app.listen(9000,listen);

