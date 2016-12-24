var methods = {};

methods.getOfferings = function(uwclient,id) {
	uwclient.get('/courses/{course_id}.{format}',
	{
		course_id : id,
		format : 'json'
	},
	function(err,res){
		if (res){
			console.log(res['data']['terms_offered']);
			// subjects[nextSub][nextCN]['terms_offered']=res['data']['terms_offered'];
		}
		else{
			// subjects[nextSub][nextCN]['terms_offered']=[];
			console.log("Not Found");
		}
		return res;
	});
	return 1;
};

exports.data = methods