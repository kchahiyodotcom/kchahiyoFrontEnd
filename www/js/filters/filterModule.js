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
	.filter('squeezeString', function(){
		return function(input, length){
			input = input || '';

			if(input != undefined & input.length > length)
				return input.substring(0,length) +'...';
			return input;
		}
	});
