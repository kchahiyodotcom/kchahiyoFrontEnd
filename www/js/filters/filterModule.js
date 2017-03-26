var textFilterModule = angular.module('filterModule', [])
	.filter('capitalizeFirstLetter', function(){
		return function(input){
			var fullSentence = '';
				if(input != undefined && input != ''){
					input = input.trim();
					var words = input.split(' ');
					words.forEach(function(word){
						if(word != undefined)
							fullSentence = fullSentence + word[0].toUpperCase() + word.substring(1) + ' ';
					})
				}
			return fullSentence;
		}
	})
	.filter('prependWhiteSpace', function(){
		return function(input, value){
			console.log(value);
			var whiteSpace = " ";
			for (i = 0; i < value; i ++){
				whiteSpace += " ";
			}
			return whiteSpace + input;
		}
	})
	.filter('filterEffect', function(){
		return function(input, value){
			var fullSentence = '';
				if(input != undefined && input != ''){
					var word = input;
							index = word.toUpperCase().indexOf(value.toUpperCase());
							//index = word.indexOf(value);
							length = value.length;
							if(index != -1){
								fullSentence = fullSentence + word.substring(0, index) + "<span class='searchText'>"+ word.substring(index,index+length) +"</span>"+ word.substring(index+ length);
							}
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
	})
	.filter('addNewLine', function(){
		return function(input){
			console.log(input);
			return input.replace(/(<br\ ?\/?>)+/g,'\n');
		}
	})
	.filter('nl2br', function(){
		return function(input){
			if(typeof(input) == 'undefined')
				return
			return input.replace(/\n/g, '<br />');
		}
	})
	.filter('parseIntoImages', function(){
		return function(input){
			var images = input.split(',');
			return images;
		}
	})
	.filter('unique', function(){
		return function(input, parameter){
			let keys = Array();
			let uniques = Array();
		  input.forEach(function(item){
				if(keys.indexOf(item[parameter]) != 0){
					console.log(item[parameter]);
					keys.push(item[parameter]);
					uniques.push(item);
				}
				//console.log(item + ' ' + parameter);
			});
			return uniques;
		}
	})
	.filter('trustedUrl', ['$sce' , function($sce){
		return function(input){
			return $sce.trustAsResourceUrl(input);
		}
	}])
