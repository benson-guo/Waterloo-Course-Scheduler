var http = require('http');
var uwaterlooApi = require('uwaterloo-api');

var config = require('./config.json');
var uwclient = new uwaterlooApi({
	API_KEY : config.api_key
});

var portTest = 9000;
var port = 8080;

var engine = function (req,res){
	res.writeHead(200,{'Content-Type':'text/plain'});
	res.end('Hello world\n');
}

var server = http.createServer(engine);
server.listen(portTest);

console.log('Listening',port);

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
var app = express();

app.use('/cssFiles', express.static(__dirname+'/assets'));

app.get('/', function(req,res){
	res.sendFile('index.html',{root: path.join(__dirname, './html')});
});

var listen = function(){
	console.log('Listening');
}

app.listen(1337,listen);
