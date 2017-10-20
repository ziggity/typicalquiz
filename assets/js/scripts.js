'use strict'; // no sloppy JS habits allowed here.
// wait till page is fully loaded
document.addEventListener('DOMContentLoaded', function(){
	var topicData; // empty var to hold question JSON
	var topicDataRandom; // will hold the shuffled order
	var topicDataBackup; // untampered copy of topicData order
	var topicDataFilteredCategory = []; // holds questions from current category
	var topicPosition; // track the selected topic
	var categoryPosition; // track current category position... I might need this to be an object later.
	var chosenCategory = 'All'; // hold user's selected category
	var progressCounter = 0; // track number of questions asked
	var score = 0; // track user's score
	var final = null; // end status
	var random = null;
	// collection of text strings
	var textStrings = {
		'selectTopic' : 'Please select a topic.',
		'pleaseAnswer' : 'At least try and answer the question, alright?',
		'endQuiz' : 'Are you sure you want to end your quiz?'
	}
	var gameSession; // initialize local array for holding goals
	// if localStorage is found, load it into the variable
	if (readLocalStorage('gameSession')) {
	    console.log('Found existing localstorage values.',readLocalStorage('gameSession'));
	    gameSession = readLocalStorage('gameSession');
	  }
	// otherwise make a blank array
	else {
	    console.log('No local storage, starting fresh.');
	    gameSession = [];
	}
	var timeStart;
	var timeEnd;
	var numberOfQuestions;
	fillStats();

	// load questions and topics as soon as the page is ready
	function doAjax() {
		var xmlhttp = new XMLHttpRequest(); // new request
		var url = 'assets/data/topics.json'; // data source

		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		topicData = JSON.parse(this.responseText); // holds entire JSON
	    		topicDataBackup = topicData; // create backup
	    		topicDataRandom = topicData; // set random order to normal values... for now
	    		// console.log(topicData, 'untouched topicData');
	    		populateTopic(); // fill Topic dropdown menu for user to choose
	    	}
    	}
	    xmlhttp.open('GET', url, true); // connect
	    xmlhttp.send(); // Engage!
	}
	doAjax(); // You know, run function.

	// built my own select menu
	function watchSelectMenu(){
		// open select menu when clicked
		document.querySelector(".dropdownMenu").addEventListener("click", function(event){
			event.preventDefault(); // stop button standard action
			console.log("You clicked topic menu",this.id);
			expandMenu(this.id); //pass id to menu function
		});
		// open category menu when clicked
		document.querySelector(".secondMenu").addEventListener("click", function(event){
				if (!document.querySelector("#categoryMenu").classList.contains('disabled')) {
					event.preventDefault(); // stop button standard action
					console.log("You clicked categoryMenu",this.id);
					expandMenu(this.id); //pass id to menu function
				}
			});
	}
	watchSelectMenu();

	// when button is clicked, toggle visibility of menu items. It's not fully reusable (yet)
	function expandMenu(target) {

		// change CSS visibility for specified menu ID
		document.querySelector("#"+target+"+.dropdownList").classList.toggle("show");

		// hide menu if anything other than button is clicked
		document.querySelector('body').addEventListener('click', function(event){
			// if topic menu exists on page...
			if (document.querySelector("#"+target+"+ .dropdownList")) {
				// if target isn't a button turn off show CSS class
				if (!event.target.matches('button')) {
					document.querySelector("#"+target+"+ .dropdownList").classList.remove("show");
				}
			}
		});
	} // end expandMenu

	// set homepage topic menu header from JSON when menu item is selected
	function setTopic(selection, count) {
		document.querySelector("#topicMenu").innerText = selection;
		document.querySelector("#topicMenu + .dropdownList").classList.toggle("show");
		//console.log("you clicked "+selection.innerHTML);
		document.querySelector('.questionCount').innerHTML = count + ' Questions'; // total number of questions
		document.querySelector('.randomStatus').innerText = 'Random Off'; // start with random off
		document.querySelector('.randomHolder').classList.remove('hide'); // make visible
	}

	// set topic name on active quiz page
	function setTopicHeader() {
		document.querySelector('.topic').innerText = topicData[topicPosition]['name'];
	}

	// set topic name on active quiz page
	function setCategoryHeader() {
		document.querySelector('.category').innerText = 'Category: ' + chosenCategory;
	}

	// set description contents from JSON when menu item is selected
	function setDescription(spot) {
		document.querySelector("#topicRow .lowerBox").innerHTML = topicData[spot]['description'];
	}

	// load topic items from JSON file
	function populateTopic() {
		var topicList = ''; // hold HTML tag elements
		var linkOpen = '<a>'; // opening tag to be appended below
		var linkClose = '</a>' // closing tag to be appended below
		// attach opening and closing tag to each topic captured from JSON
		for (var i = 0; i < topicData.length; i++) {
			topicList += linkOpen + topicData[i]["name"] + linkClose; // grab name field
		}
		document.querySelector("#topicList").innerHTML = topicList; // set div content
		var menuItems = document.querySelectorAll("#topicList.dropdownList a"); // selector for all list link elements

		// set click event listener for each element. I think this was clever
		for (var i = 0; i < menuItems.length; i++) {
			// Creates an attribute to track order. Sets it to current loop iteration value
			menuItems[i].setAttribute('order', i);
			// onclick function for every menuItem link
			menuItems[i].onclick = function(){
				// sends order position to description function. Function pulls the corresponding description from the JSON
				topicPosition = this.getAttribute('order');
				setDescription(topicPosition); // set description to selected topic
				var questionTotal = topicData[topicPosition]['questions'].length; // count questions
				setTopic(this.innerHTML,questionTotal); // sends topic name to the button value. questionTotal to description
				if (document.querySelector('.secondMenu.disabled')) {
					document.querySelector('.secondMenu.disabled').classList.remove('disabled'); // enable the category selection menu
				}
				populateCategory(); // when topic is chosen set the category
			}
		}
	}

	// load category items from JSON file
	function populateCategory() {
		var categoryList = '<a order=\'0\'>All</a>'; // hold HTML tag elements
		var linkOpen = '<a>'; // opening tag to be appended below
		var linkClose = '</a>' // closing tag to be appended below
		var counter = 1; // counts number of questions in each category (might need an array...)

		// attach opening and closing tag to each topic captured from JSON
		var u = []; // will hold unique categories
		var location = topicData[topicPosition]['questions'];
		for(var i = 0; i < location.length; i++) {
			// fancy index searching to filter unique values. If unique then add to array
			if (u.indexOf(location[i]['category']) == -1 && location[i]['category'] !== '') {
				u.push(location[i]['category']);
				console.log(topicData[topicPosition]['questions'][i]['category']);
				categoryList += linkOpen + topicData[topicPosition]['questions'][i]['category'] + linkClose; // grab name field
				counter++;
			}
		}

		document.querySelector("#categoryList").innerHTML = categoryList; // set div content
		var menuItems = document.querySelectorAll("#categoryList.dropdownList a"); // selector for all list link elements

		// set click event listener for each element. I still think this is clever
		for (var i = 0; i < menuItems.length; i++) {
			// Creates an attribute to track order. Sets it to current loop iteration value
			menuItems[i].setAttribute('order', i);
			// onclick function for every menuItem link
			menuItems[i].onclick = function(){
				// sends order position to description function. Function pulls the corresponding description from the JSON
				categoryPosition = this.getAttribute('order');
				//setCatDescription(categoryPosition); // there is no category Position right now.
				// var questionTotal = topicData[topicPosition]['category'].length; // count questions
				var questionTotal = counter; // count questions
				setCategory(this.innerHTML,questionTotal); // sends category name to the button value. questionTotal to description
			}
		}
	}

	// set homepage Category menu header when item is selected
	function setCategory(selection, count) {
		chosenCategory = selection; // set global category to user's selection
		document.querySelector("#categoryMenu").innerText = selection;
		document.querySelector("#categoryMenu + .dropdownList").classList.toggle("show");
		console.log("you clicked " + selection);
		// document.querySelector('.questionCount').innerHTML = topicDataFilteredCategory[progressCounter].length + ' Questions'; // total number of questions
		// attach opening and closing tag to each topic captured from JSON
		var u = []; // will hold unique categories
		var location = topicData[topicPosition]['questions'];
		var categoryCounter = 0;
		for(var i = 0; i < location.length; i++) {
			if (location[i]['category'] == chosenCategory) {
				categoryCounter++;
			}
		}
		if (chosenCategory == 'All') {
			document.querySelector('.questionCount').innerHTML = location.length + ' Questions';
		} else {
			document.querySelector('.questionCount').innerHTML = categoryCounter + ' Questions'; // total number of questions
		}

	}


	// event listener for start button. I can move this somewhere else...
	function watchQuiz(){
		// start quiz when button is pressed
		document.querySelector('.start').addEventListener('click', function() {
			// console.log(document.querySelector('#topicMenu').innerText);
			var topicVar = document.querySelector('#topicMenu').innerText; // DOM selection for chosen topic
			// Input validation for topic
			if (topicVar == 'Choose One') {
				errorGenerator(textStrings.selectTopic); // modal with nagging text
			} else {
				startQuiz(); // Engage!
			}
		});
	}
	watchQuiz(); // start event listener. Called via function later when container content is replaced.
	// I know there's probably a smarter way to do this...


	// reusabe random function
	/*function randomize(a, b) {
		console.log('i\'m inside the randomize');
	    return Math.random();
	}*/

	//event listener to activate random order
	document.querySelector('.randomHolder').addEventListener('click', function(){
		if (random) {
			random = false;
			document.querySelector('.randomStatus').innerText = 'Random off';
			document.querySelector('.randomHolder').classList.remove('active');
			topicData = topicDataBackup; // reset topicData to the backup copy.
			console.log(topicData[topicPosition]['questions']);
		} else {
			console.log(topicData[topicPosition]['questions'], 'untouched topicData');
			random = true;
			document.querySelector('.randomStatus').innerText = 'Random on';
			document.querySelector('.randomHolder').classList.add('active');
			var randomTopicHolder = topicDataRandom[topicPosition]['questions'];
			console.log(randomTopicHolder,'normal order');
			randomTopicHolder.sort(function (a, b) {return Math.random() - 0.5;})
    		console.log(randomTopicHolder,'random order');
			topicData = topicDataRandom;
			console.log(topicData[topicPosition]['questions'],'topicData now random');
		}
	});

	// grab quiz page body and fire off question and score system. This is the big one.
	function startQuiz(){
		timeStart = new Date().getTime();
		// load quiz screen via AJAX
		var xmlhttp = new XMLHttpRequest(); // new request
		var url = 'assets/data/questionScreen.html'; // data source. It's just an HTML page

		// load quiz body and call even listeners
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		var quizBody = this.responseText; // holds entire JSON
	    		// render HTML into container. A poor man's single page application.
	    		document.querySelector('body').innerHTML = quizBody;
	    		// How do I do this more intelligently?

	    		setTopicHeader(); // set topic name
	    		setCategoryHeader(); // set category name

				// if no category is chosen, proceed in with simple question asking
				if (chosenCategory == 'All') {
					// prefill question one from current topic data
					document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][0]['question'];
				} else {
					// console.log(topicData[topicPosition]['questions'].length,'length of questions');
					console.log('chosenCategory',chosenCategory);
					console.log(topicData[topicPosition]['questions']);
					// find all questions that match chosen category
					for (var i = 0; i < topicData[topicPosition]['questions'].length; i++) {
						// if question matches category, add to filtered array
						console.log(topicData[topicPosition]['questions'][i]['category']);
						if (topicData[topicPosition]['questions'][i]['category'] == chosenCategory){
							topicDataFilteredCategory.push(topicData[topicPosition]['questions'][i]);
							// console.log('category match. i gonna push');
						}
					}
					console.log(topicDataFilteredCategory,'show me what you got, topicDataFilteredCategory.');
					document.querySelector('.questionHolder').innerHTML = topicDataFilteredCategory[0]['question'];
				}


				// close button event listener
				document.querySelector('.close').addEventListener('click', function(){
					modalGenerator(textStrings.endQuiz, 'yes', 'no'); // pass text to modal method
				});

				// event listener for hint button
				document.querySelector('.hint').addEventListener('click', function(){
					console.log('progress counter inside hint is', progressCounter);
					modalGenerator(topicData[topicPosition]['questions'][progressCounter]['hint'], 'yes');
				});

				// event listener for skip button
				document.querySelector('.skip').addEventListener('click', function(){
					nextQuestion(); // load next question without changing score
				});

				// if random boolean is enabled
				if (random) {
					document.querySelector('.random span').innerHTML = 'Random On';
				} else {
					document.querySelector('.random span').innerHTML = 'Random Off';
				}

				// event listener for validating answer
				document.querySelector('.answer').addEventListener('click', function(){
					var userAnswer = document.querySelector('#answerRow textarea').value;
					if (chosenCategory == 'All') {
						var rightAnswer = topicData[topicPosition]['questions'][(progressCounter)]['answer'];
						// console.log('user answer: ' + userAnswer);
						// basic validation. Show modal if there's a value in textarea
						if (userAnswer != '') {
							// see if user input matches real answer
							function checkAnswer(){
								// converts to lowercase and removes whitespace to be mobile friendly
								if (userAnswer.toLowerCase().trim() == rightAnswer.toLowerCase()) {
									// display right answer in modal
									modalGenerator('Correct, the answer is <span class=\'correct\'>' + rightAnswer + '</span>', 'Continue');
									score++; // increase score if correct
								} else {
									modalGenerator('Sorry, the answer is <span class=\'wrong\'>' + rightAnswer + '</span>', 'Continue');
								}
							}
							checkAnswer(); // call above function. Useful if I move the code block somewhere else

						}
						else {
							errorGenerator(textStrings.pleaseAnswer); // if field is blank yell at the user
						}
					} // end all category

					// if there is a specified category
					else {
						var rightAnswer = topicDataFilteredCategory[(progressCounter)]['answer'];
						// basic validation. Show modal if there's a value in textarea
						if (userAnswer != '') {
							// see if user input matches real answer
							function checkAnswer(){
								// converts to lowercase and removes whitespace to be mobile friendly
								if (userAnswer.toLowerCase().trim() == rightAnswer.toLowerCase()) {
									// display right answer in modal
									modalGenerator('Correct, the answer is <span class=\'correct\'>' + rightAnswer + '</span>', 'Continue');
									score++; // increase score if correct
								} else {
									modalGenerator('Sorry, the answer is <span class=\'wrong\'>' + rightAnswer + '</span>', 'Continue');
								}
							}
							checkAnswer(); // call above function. Useful if I move the code block somewhere else

						}
						else {
							errorGenerator(textStrings.pleaseAnswer); // if field is blank yell at the user
						}

					} // end

				});
			}
			setProgressFieldValue(); // update progress value at top of screen
	    }
	    xmlhttp.open('GET', url, true); // connect
	    xmlhttp.send(); // Engage!

	} // end quiz. That was a big AJAX request...

	// load new question from topicData JSON dump
	function nextQuestion() {

		// update counter if there are questions left in the topic
		if(progressCounter < topicData[topicPosition]['questions'].length) {
			updateProgressCounter();
		} else if (progressCounter == topicData[topicPosition]['questions'].length) {
			// Placeholder for now. In the future I may want to take additional actions here if the game is over.
			updateProgressCounter(); // This currently handles the end game scenario. Action here is kinda redundant (for now).
		}
	}

	// update progress and score
	function updateProgressCounter() {
		// if no category is specified
		if (chosenCategory == 'All') {
			// increase score if there are questions to ask
			if(progressCounter < topicData[topicPosition]['questions'].length) {
				progressCounter++; // +1
				// if we're not on the last question
				if (progressCounter <= topicData[topicPosition]['questions'].length - 1){
					// console.log('new value for progressCounter: ' + progressCounter);
					// set HTML content to new question value
					document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][progressCounter]['question'];
					//console.log('this should be a new question',topicData[topicPosition]['questions'][progressCounter]['question']);
					setProgressFieldValue(); // update progress display at top of page
				}
			}
			// if final question has already been asked
			if (progressCounter == topicData[topicPosition]['questions'].length) {
				console.log('Progress report: game over');
				// content of score page
				var scoreMessage = '<h2>Game Over</h2>' + 'Topic: ' + topicData[topicPosition]['name']
					+ '<br>Category: ' + chosenCategory
					+ '<br><strong>Score</strong>: ' + score + ' out of ' + topicData[topicPosition]['questions'].length;
				// lets other loops know the end game sequence is active.
				// Note: If I do a smarter content div replacement I'll need to clear this var when user presses Okay
				final = true;
				timeEnd = new Date().getTime();
				gatherStats(); // send session stats to localStorage
				modalGenerator(scoreMessage, 'Continue'); // should I make a 3rd var for desitnation?
			}
		} // end all category
		// if specific category is chosen
		else {
			if(progressCounter < topicDataFilteredCategory.length) {
				progressCounter++; // +1
				// if we're not on the last question
				if (progressCounter <= topicDataFilteredCategory.length - 1){
					// console.log('new value for progressCounter: ' + progressCounter);
					// set HTML content to new question value
					document.querySelector('.questionHolder').innerHTML = topicDataFilteredCategory[progressCounter]['question'];
					//console.log('this should be a new question',topicData[topicPosition]['questions'][progressCounter]['question']);
					setProgressFieldValue(); // update progress display at top of page
				}
			}
			// if final question has already been asked
			if (progressCounter == topicDataFilteredCategory.length) {
				console.log('Progress report: game over');
				// content of score page
				var scoreMessage = '<h2>Game Over</h2>' + 'Topic: ' + topicData[topicPosition]['name']
					+ '<br>Category: ' + chosenCategory
					+ '<br><strong>Score</strong>: ' + score + ' out of ' + topicDataFilteredCategory.length;
				// lets other loops know the end game sequence is active.
				// Note: If I do a smarter content div replacement I'll need to clear this var when user presses Okay
				final = true;
				timeEnd = new Date().getTime();
				gatherStats(); // send session stats to localStorage
				modalGenerator(scoreMessage, 'Continue'); // should I make a 3rd var for desitnation?
			}
		}

	}

	// update progress field contents
	function setProgressFieldValue() {
		if (chosenCategory == 'All') {
			// update counter at top of page
			if (document.querySelector('.progress')) {
				document.querySelector('.progress').innerHTML = 'Progress: '
					+ (Number(progressCounter) + 1) + ' / ' + topicData[topicPosition]['questions'].length;
					numberOfQuestions = topicData[topicPosition]['questions'].length;
			}
			// clear the answer textarea if it exists on the page
			if(document.querySelector('#answerRow textarea')){
				document.querySelector('#answerRow textarea').value = '';
			}
		}
		// if specific category is chosen
		else {
			// update counter at top of page
			if (document.querySelector('.progress')) {
				document.querySelector('.progress').innerHTML = 'Progress: '
					+ (Number(progressCounter) + 1) + ' / ' + topicDataFilteredCategory.length;
					numberOfQuestions = topicDataFilteredCategory.length;
			}
			// clear the answer textarea if it exists on the page
			if(document.querySelector('#answerRow textarea')){
				document.querySelector('#answerRow textarea').value = '';
			}
		}

	}

	// clear quiz content from container div and load start screen
	function returnToMain() {
		location.reload();
		// I need to do this properly or not at all...
		//progressCounter = 0;
		//doAjax();
	}

	// nifty function to deliver standardized error messages
	function errorGenerator(message) {
		var divClass = 'errorBox'; // matches CSS properties
		var newDiv = document.createElement('div'); // create div element
		newDiv.classList.add(divClass); // apply class for manipulation & styling
		newDiv.innerText = message; // apply message var as content of new div
		//console.log(newDiv);
		document.querySelector('.container').appendChild(newDiv); // render div at bottom of container
		// delete error after 5 seconds
		setTimeout(function() {
	    	document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
	    }, 5000);
	}

	function modalGenerator(message, actionOne, actionTwo) {
		var divClass = 'messageBox'; // hold CSS class name
		var newDiv = document.createElement('div'); // create div element
		newDiv.classList.add(divClass); // apply class for manipulation & styling
		//newDiv.innerText = message; // apply message var as content of new div. Ha, simpler times.
		// Assume two buttons means one will end game
		if (actionTwo) {
			// apply HTML for two button row. Use passed value for caption. Actions are predetermined.
			newDiv.innerHTML = '<div class=\'inner\'><div class=\'row pad\'>'
				+ message + '</div> <div class=\'row full multi\'><button class=\'yes\'>' + actionOne
				+ '</button><button class=\'no\'>' + actionTwo +'</button></div></div>';
			document.querySelector('.container').appendChild(newDiv); // render div at bottom of container
			// If user clicks yes, return to main
			document.querySelector('.' + divClass +' .yes').addEventListener('click', function(){
				document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
				returnToMain(); // O'Brian, one to beam up.
			});
			// If user presses no, just cancel
			document.querySelector('.' + divClass + ' .no').addEventListener('click', function(){
				// self destruct the modal if no
				document.querySelector('.container').removeChild(document.querySelector('.' + divClass));
			});
		}
		// If only one button option is passed
		else {
			// apply HTML for single button row. Use passed value for caption. Actions are still predetermined.
			newDiv.innerHTML = '<div class=\'inner\'><div class=\'row pad\'>'
				+ message + '</div> <div class=\'row full\'><button class=\'yes\'>'
				+ actionOne + '</button></div></div>';
			document.querySelector('.container').appendChild(newDiv); // render div at bottom of container
			// if user clicks the button, delete the modal
			document.querySelector('.' + divClass +' .yes').addEventListener('click', function(){
				document.querySelector('.container').removeChild(document.querySelector('.' + divClass)); // self destruct
				// If caption matches answer box button. There are smarter ways to do this...
				if (actionOne == 'Continue') {
					// if final var has value, do endgame scenario
					if (final) {
						returnToMain();
					} else {
						nextQuestion();
					}
				}
			});
		}

	} // end modal generator


	// save to localStorage
	function saveLocalStorage(itemName) {
		window.localStorage.setItem('gameSession', JSON.stringify(itemName));
		console.log('prove it exists by typing:','JSON.parse(window.localStorage.getItem(\'' + 'gameSession' + '\'));');
	}

	  // read from localStorage
	  function readLocalStorage(itemName) {
	    return JSON.parse(window.localStorage.getItem(itemName));
	  }

	// collects data to send to localStorage
	function gatherStats(){
		console.log('Info sent to localStorage');
	  	// When game is over, push stats to array
		gameSession.push({
			'date' : formatDate(),
			'score' : score,
			'outOf' : numberOfQuestions,
			'duration' : [timeStart, timeEnd, millisToMinutesAndSeconds(Math.abs(timeStart - timeEnd))],
			'topic' : topicData[topicPosition]['name'],
			'category' : chosenCategory
		});
		// send array to localStorage function
		saveLocalStorage(gameSession);
	}

	// date and time
	function formatDate() {
	    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
	    var d = new Date();
	    var dateNow = d.getDate();
	    var monthNow = d.getMonth();
	    var yearNow = d.getFullYear();
	    var timeNow = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
	    return months[monthNow] +' '+ dateNow + ', ' + yearNow;
  	}

  	// miliseconds to seconds
  	function millisToMinutesAndSeconds(millis) {
	  var minutes = Math.floor(millis / 60000);
	  var seconds = ((millis % 60000) / 1000).toFixed(0);
	  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	}

	// fill out stats blocks
	function fillStats() {
		if (readLocalStorage('gameSession')) {
			console.log('gameSession', gameSession);
			document.querySelector('.stats .quizSessions span').innerHTML = gameSession.length;
			document.querySelector('.stats .avgScore span').innerHTML = calculateScore();
			document.querySelector('.stats .avgDuration span').innerHTML = calculateDuration();
			//document.querySelector('.stats .fastestRound span').innerHTML = calcualteFastest();
			//document.querySelector('.stats .slowestRound span').innerHTML = gameSession.length;
		} else {
			document.querySelector('.stats ul').innerHTML = '<span class=\'dim\'>No games played yet!</span>';
		}
	}
	// perform math before sending to localStorage
	function calculateScore() {
		var scoreHolder = 0;
		for(var i = 0;i<gameSession.length;i++){
			scoreHolder += gameSession[i]['score'] / gameSession[i]['outOf'];
			console.log(scoreHolder, "scoreHolder current");
		}
		// console.log(scoreHolder / gameSession.length,'scoreholder / gamelesson length');
		scoreHolder = (scoreHolder / gameSession.length * 100).toFixed(2) + '%';
		// console.log(scoreHolder);
		return scoreHolder;
	}

	// subtract timestamps to determine how log the session was
	function calculateDuration() {
		var scoreHolder = 0;
		for(var i = 0;i<gameSession.length;i++){
			scoreHolder += gameSession[i]['duration'][1] - gameSession[i]['duration'][0];
			console.log(scoreHolder, "scoreHolder current");
		}
		scoreHolder = scoreHolder / gameSession.length;
		//console.log(scoreHolder, 'avg duration here');
		return millisToMinutesAndSeconds(scoreHolder);
	}
	// loop through session data to determine fastest session
	function calcualteFastest() {
		var scoreHolder = 0;
		for(var i = 0;i<gameSession.length;i++){
			scoreHolder += gameSession[i]['duration'][1] - gameSession[i]['duration'][0];
			console.log(scoreHolder, "scoreHolder current");
		}
		scoreHolder = scoreHolder / gameSession.length;
		//console.log(scoreHolder, 'avg duration here');
		return millisToMinutesAndSeconds(scoreHolder);
	}

	// Placeholder. Not being used.
	function calcualteSlowest() {
		var scoreHolder = 0;
		return millisToMinutesAndSeconds(scoreHolder);
	}

// end fake document ready
}, false);