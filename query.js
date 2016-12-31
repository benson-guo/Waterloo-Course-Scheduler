var methods = {};

methods.getCourseList = function(uwclient,callback) {
	uwclient.get('/courses.{format}',
	{
		format : 'json'
	},
	function(err,res){
		callback(res['data']);
	});
};

methods.getOfferings = function(uwclient,id,callback) {
	uwclient.get('/courses/{course_id}.{format}',
	{
		course_id : id,
		format : 'json'
	},
	function(err,res){
		callback(res['data']);
	});
};

methods.getTermCourses = function(uwclient,term,callback) {
	uwclient.get('/terms/{term_id}/courses.{format}',
	{
		term_id : term,
		format : 'json'
	},
	function(err,res){
		callback(res['data']);
	});
};

methods.updateTermsOfferred = function(data,subjects,t){
	for (var i in data){
		var nextSub=data[i]['subject'];
		var nextCN=data[i]['catalog_number'];
		try{
			subjects[nextSub][nextCN]['terms_offered'].push(t);
		} catch (err){
			if (!(nextSub in subjects)){
				subjects[nextSub]={};
			}
			if (!(nextCN in subjects[nextSub])){
				subjects[nextSub][nextCN]={};
			}
			subjects[nextSub][nextCN]['title']=data[i]['title'];
			subjects[nextSub][nextCN]['course_id']=data[i]['course_id'];
			subjects[nextSub][nextCN]['terms_offered']=[t];
		}
	}
}


exports.data = methods;