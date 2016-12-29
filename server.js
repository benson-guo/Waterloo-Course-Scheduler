var http = require('http');
var uwaterlooApi = require('uwaterloo-api');

var config = require('./config.json');
var uwclient = new uwaterlooApi({
	API_KEY : config.api_key
});

var portTest = 9000;
var port = 8080;

var subjects={}

uwclient.get('/courses.{format}',
{
	format : 'json'
},
function(err,res){
	// console.log(res);
	for (var i in res['data']){
		var nextSub=res['data'][i]['subject'];
		var nextCN=res['data'][i]['catalog_number'];
		if (!(nextSub in subjects)){
			subjects[nextSub]={};
		}
		if (!(nextCN in subjects[nextSub])){
			subjects[nextSub][nextCN]={};
		}
		subjects[nextSub][nextCN]['title']=res['data'][i]['title'];
		subjects[nextSub][nextCN]['course_id']=res['data'][i]['course_id'];
	}
	// console.log(subjects);
});

var response = require('./query.js');
// console.log(response.data.getOfferings(uwclient,'004404'));

var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/cssFiles', express.static(__dirname+'/css'));

app.get('/', function(req,res){
	res.sendFile('index.html',{root: path.join(__dirname, './html')});
	// console.log(subjects);
});

app.post('/', function(req,res){
	//res.sendFile('index.html',{root: path.join(__dirname, './html')});
	try{
		var requestedID = subjects[req.body.courseSubject.toUpperCase()][req.body.courseCode.toUpperCase()]['course_id'];
		response.data.getOfferings(uwclient,requestedID,function(data){
			res.end(JSON.stringify(data));
		});
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
	console.log('Listening');
}

app.listen(1337,listen);
