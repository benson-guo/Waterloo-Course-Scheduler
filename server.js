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
	try{
		var requestedID = subjects[req.body.courseSubject.toUpperCase()][req.body.courseCode.toUpperCase()]['course_id'];
		console.log(subjects[req.body.courseSubject.toUpperCase()][req.body.courseCode.toUpperCase()]['terms_offered']);
		res.end(JSON.stringify(subjects[req.body.courseSubject.toUpperCase()][req.body.courseCode.toUpperCase()]['terms_offered']));
	} catch (err) {
		res.end('No information found on '+req.body.courseSubject.toUpperCase()+req.body.courseCode.toUpperCase()+'.');
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

