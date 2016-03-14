var textFilterModule = angular.module('filterModule', [])
	.filter('capitalizeFirstLetter', function(){
		return function(input){
			var fullSentence = '';
				if(input != undefined){
					var words = input.split(' ');
					
					words.forEach(function(word){
						fullSentence = fullSentence + word[0].toUpperCase() + word.substring(1) + ' ';
					})
				}
			return fullSentence;
		}
	})
	.filter('sqeezeString', function(){
		return function(input){
			input = input || '';
			if(input != undefined)
				return input.substring(0,10) +'...';
			return input;
		}
	});
