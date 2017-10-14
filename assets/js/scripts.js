'use strict'; // no sloppy JS habits allowed here.
document.addEventListener('DOMContentLoaded', function(){
	var topicData; // empty var to hold question JSON
	var topicPosition;
	var progressCounter = 0; // track number of questions asked
	var score = 0; // track user's score
	var endQuizMessage = 'Are you sure you want to end your quiz?';
	var final = null;
	var textStrings = {
		'selectTopic' : 'Please select a topic.',
		'pleaseAnswer' : 'At least try and answer the question, alright?'
	}

	// load questions and topics as soon as the page is ready
	function doAjax() {
		var xmlhttp = new XMLHttpRequest();
		var url = 'assets/data/topics.json';

		xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
    		topicData = JSON.parse(this.responseText);
    		console.log("Topic data, Morty")
    		console.log(topicData);
    		populateTopic();
    	}
    }
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
	}
	doAjax();

	function watchSelectMenu(){
		// open select menu
		document.querySelector("#topicMenu").addEventListener("click", function(event){
			event.preventDefault();
			console.log("You clicked",this.id);
			expandMenu(this.id);
		});

	}
	watchSelectMenu();

	// when button is clicked, toggle visibility of menu items
	function expandMenu(target) {
		console.log("I am inside expandMenu");
		console.log("#"+target+".dropdownList");
		document.querySelector("#"+target+"+.dropdownList").classList.toggle("show");

		/*
		right now the menu stays open. This is as far as I got towards making it close when you click on the BG
		if (!event.target.matches("#"+target+".dropdownList a")){
			document.querySelector("#"+target+"+.dropdownList").classList.toggle("show");
			console.log("make it close now");
		}
		*/

		/* second try
		for (var i = 0; i < menuItems.length; i++) {
			menuItems[i].onclick = function(){
				console.log("I was clicked "+this.innerHTML);
			}
		}
		*/

		// third try. Close if click is anythere outside the button
		// window.onclick = function(event){
		// 	// how can I have it match a click on 'this'?
		// 	if (!event.target.matches('button')){
		// 		document.querySelector("#"+target+"+.dropdownList").classList.toggle("show");
		// 	}
		// }
	} // end expandMenu

	// set homepage topic menu header from JSON when menu item is selected
	function setTopic(selection) {
		console.log(selection);
		document.querySelector("#topicMenu").innerText = selection;
		document.querySelector("#topicMenu + .dropdownList").classList.toggle("show");
		//console.log("you clicked "+selection.innerHTML);
	}

	// set topic name on active quiz page
	function setTopicHeader() {
		document.querySelector('.topic').innerText = topicData[topicPosition]['name'];
	}

	// set description contents from JSON when menu item is selected
	function setDescription(spot) {
		console.log('this is spot', spot);
		document.querySelector("#topicRow .lowerBox").innerHTML = topicData[spot]['description'];
	}

	// load topic items from JSON file
	function populateTopic() {
		console.log("this is how long topic data is",topicData.length);
		var topicList = '';
		var linkOpen = '<a>';
		var linkClose = '</a>'
		for (var i = 0; i < topicData.length; i++) {
			topicList += linkOpen + topicData[i]["name"] + linkClose;
		}
		document.querySelector("#topicList").innerHTML = topicList;

		var menuItems = document.querySelectorAll(".dropdownList a");
		console.log(menuItems.length,'length of menuItems');
		for (var i = 0; i < menuItems.length; i++) {
			// Creates an attribute to track order. Sets it to current loop iteration value
			menuItems[i].setAttribute('order', i);
			// onclick function for every menuItem link
			menuItems[i].onclick = function(){
			// sends topic name to the button value
			setTopic(this.innerHTML);
			// sends order position to description function. This pulls the corresponding description from the JSON
			topicPosition = this.getAttribute('order');
			setDescription(topicPosition);
			}
		}
	}

	function watchQuiz(){
		// start quiz when button is pressed
		document.querySelector('.start').addEventListener('click', function() {
			console.log("You pressed start");
			console.log(document.querySelector('#topicMenu').innerText);
			var topicVar = document.querySelector('#topicMenu').innerText;
			if (topicVar == 'Choose One') {
				console.log('no value!');
				errorGenerator(textStrings.selectTopic);
			} else {
				startQuiz();
			}
		});
	}
	watchQuiz();

	// grab quiz page body
	function startQuiz(){
		// load quiz screen via AJAX
		var xmlhttp = new XMLHttpRequest();
		var url = 'assets/data/questionScreen.html';

		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		var quizBody = this.responseText;
	    		document.querySelector('.container').innerHTML = quizBody;

	    		// set topic name
	    		setTopicHeader();
	    		// set category name
				// progress counter

				console.log('AJAX request. Progress counter is ' + progressCounter);
				// prefill question one from current topic data
				document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][0]['question'];

				// close button
				document.querySelector('.close').addEventListener('click', function(){
					// future: make prompt function. Pass confirm box into it. Have confirm box call main screen function
					console.log('close was pressed');
					modalGenerator(endQuizMessage, 'yes', 'no');
				});

				document.querySelector('.hint').addEventListener('click', function(){
					console.log('hint clicked');
					console.log('progress counter inside hint is', progressCounter);
					modalGenerator(topicData[topicPosition]['questions'][progressCounter]['hint'], 'yes');
				});

				document.querySelector('.skip').addEventListener('click', function(){
					nextQuestion();
				});

				document.querySelector('.answer').addEventListener('click', function(){
					console.log('you ask, I answer');
					console.log('topic position is ' + topicPosition);
					console.log('progress counter is ' + progressCounter);
					// show modal if there's a value in textarea
					var userAnswer = document.querySelector('#answerRow textarea').value;
					var rightAnswer = topicData[topicPosition]['questions'][(progressCounter)]['answer'];
					console.log('user answer: ' + userAnswer);
					if (userAnswer != '') {
						// modalGenerator(topicData[topicPosition]['questions'][(progressCounter)]['answer'], 'okay');
						// see if user input matches real answer
						function checkAnswer(){
							if (userAnswer == rightAnswer) {
								console.log('right answer');
								console.log('Correct, the answer is ' + rightAnswer);
								modalGenerator('Correct, the answer is ' + rightAnswer, 'Continue');
								//updateProgressCounter();
								score++;
								// nextQuestion();
							} else {
								console.log('wrong answer');
								modalGenerator('Sorry, the answer is ' + rightAnswer, 'Continue');
								//updateProgressCounter();
								// nextQuestion();
							}
						}
						checkAnswer();

					} else {
						errorGenerator(textStrings.pleaseAnswer);
					}
				});
			}
			setProgressFieldValue();
	    }
	    xmlhttp.open('GET', url, true);
	    xmlhttp.send();

	} // end quiz

	function nextQuestion() {
		// keep score the same
		// show new question
		console.log('showing next question');

		if(progressCounter < topicData[topicPosition]['questions'].length) {
			updateProgressCounter();
			// document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][progressCounter]['question'];
			// console.log('this should be a new question',topicData[topicPosition]['questions'][progressCounter]['question']);
		} else if (progressCounter == topicData[topicPosition]['questions'].length) {
			console.log('next question report: game over');
			updateProgressCounter();
		}
		console.log('progress counter',progressCounter);


		// write end scenario for when final question is reached

	}

	// update progress and score
	function updateProgressCounter() {
		console.log('number of questions ' + topicData[topicPosition]['questions'].length);
		if(progressCounter < topicData[topicPosition]['questions'].length) {
			progressCounter++;
			if (progressCounter <= topicData[topicPosition]['questions'].length - 1){
				console.log('new value for progressCounter: ' + progressCounter);
				document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][progressCounter]['question'];
				console.log('this should be a new question',topicData[topicPosition]['questions'][progressCounter]['question']);
				setProgressFieldValue();
			}


		} if (progressCounter == topicData[topicPosition]['questions'].length) {
			console.log('Progress report: game over');
			//setProgressFieldValue();
			// score here
			var scoreMessage = '<h2>Game Over</h2>' + 'Topic: ' + topicData[topicPosition]['name']
				+ '<br>Category: ... Coming Soon <br>'
				+ '<strong>Score</strong>: ' + score + ' out of ' + topicData[topicPosition]['questions'].length;
			final = true;
			console.log('this is final' + final);
			modalGenerator(scoreMessage, 'Continue'); // 3rd var for desitnation?
		}

	}

	// update progress field contents
	function setProgressFieldValue() {
		// update counter at top of page
		if (document.querySelector('.progress')) {
			document.querySelector('.progress').innerHTML = 'Progress: ' + (Number(progressCounter) + 1) + ' / ' + topicData[topicPosition]['questions'].length;
		}
		// clear the answer textarea
		if(document.querySelector('#answerRow textarea')){
			document.querySelector('#answerRow textarea').value = '';
		}
	}

	function returnToMain() {
		location.reload();
		// I need to do this properly or not at all...
		/*
		progressCounter = 1;

		// load quiz screen via AJAX
		var xmlhttp = new XMLHttpRequest();
		var url = 'index.html';

		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		var wholePage = this.responseText;
	    		console.log('start fresh...');
	    		console.log(wholePage,'here is my container');
	    		document.write(wholePage);
	    		//document.close();
	    		// future: there has to be a better way than this. I'm re-calling each eventlistener when I load page contents. :-(
	    		doAjax();
				setTimeout(function() {
					//console.log('delay before hiding');
					watchSelectMenu();
					watchQuiz();
				}, 1000);
			}
	    }
	    xmlhttp.open('GET', url, true);
	    xmlhttp.send();

	    */
	}

	function errorGenerator(message) {
		var divClass = 'errorBox';
		var newDiv = document.createElement('div'); // create div element
		newDiv.classList.add(divClass); // apply class for manipulation & styling
		newDiv.innerText = message; // apply message var as content of new div
		//console.log(newDiv);
		document.querySelector('.container').appendChild(newDiv); // render div at bottom of container
		// delete error after 10 seconds
		setTimeout(function() {
	    	document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
	    }, 5000);
	}
/*
	function modalGenerator(message, action) {
		var divClass = 'messageBox';
		var newDiv = document.createElement('div'); // create div element
		newDiv.classList.add(divClass); // apply class for manipulation & styling
		//newDiv.innerText = message; // apply message var as content of new div
		newDiv.innerHTML = message + '<div class=\'yes\'>Yes</div><div class=\'no\'>No</div>';
		//console.log(newDiv);
		document.querySelector('.container').appendChild(newDiv); // render div at bottom of container

		document.querySelector('.' + divClass +' .yes').addEventListener('click', function(){
			document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
			console.log('now I\'m returning home');
			//action;
			returnToMain();
		});
		document.querySelector('.' + divClass + ' .no').addEventListener('click', function(){
			document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
		});
	}
*/
	function modalGenerator(message, actionOne, actionTwo) {
		var divClass = 'messageBox';
		var newDiv = document.createElement('div'); // create div element
		newDiv.classList.add(divClass); // apply class for manipulation & styling
		//newDiv.innerText = message; // apply message var as content of new div
		if (actionTwo) {
			newDiv.innerHTML = '<div class=\'inner\'><div class=\'row pad\'>' + message + '</div> <button class=\'yes\'>Yes</button><button class=\'no\'>No</button></div>';
			//console.log(newDiv);
			document.querySelector('.container').appendChild(newDiv); // render div at bottom of container
			console.log('queryselector: ' + '.' + divClass +' .yes');
			document.querySelector('.' + divClass +' .yes').addEventListener('click', function(){
				document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
				console.log('now I\'m returning home');
				//action;
				returnToMain();
			});
			document.querySelector('.' + divClass + ' .no').addEventListener('click', function(){
				document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
			});
		} else {
			newDiv.innerHTML = '<div class=\'inner\'><div class=\'row pad\'>' + message + '</div> <div class=\'row full\'><button class=\'yes\'>' + actionOne + '</button></div></div>';
			//console.log(newDiv);
			document.querySelector('.container').appendChild(newDiv); // render div at bottom of container
			console.log('queryselector: ' + '.' + divClass +' .yes');
			document.querySelector('.' + divClass +' .yes').addEventListener('click', function(){
				document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
				console.log('now I\'m closing');
				//action;
				//document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
				if (actionOne == 'Continue') {
					if (final) {
						console.log('good job, you finished the game...');
						returnToMain();
					} else {
						nextQuestion();
					}
				}
			});
		}

	}
// end fake document ready
}, false);
