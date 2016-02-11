angular.module('filterModule',[])
	.filter('unique',function(){
		return function(collection, condition){
			var len = collection.length;
			for (var i; i < len; i++){
				console.log(collection[i]);
			}
		}
		return condition;
	})