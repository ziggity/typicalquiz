'use strict'; // no sloppy JS habits allowed here.
// wait till page is fully loaded
document.addEventListener('DOMContentLoaded', function(){
	var topicData; // empty var to hold question JSON
	var topicPosition; // track the selected topic
	var progressCounter = 0; // track number of questions asked
	var score = 0; // track user's score
	var final = null; // end status
	// collection of text strings
	var textStrings = {
		'selectTopic' : 'Please select a topic.',
		'pleaseAnswer' : 'At least try and answer the question, alright?',
		'endQuiz' : 'Are you sure you want to end your quiz?'
	}

	// load questions and topics as soon as the page is ready
	function doAjax() {
		var xmlhttp = new XMLHttpRequest(); // new request
		var url = 'assets/data/topics.json'; // data source

		xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
    		topicData = JSON.parse(this.responseText); // holds entire JSON
    		//console.log(topicData);
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
		document.querySelector("#topicMenu").addEventListener("click", function(event){
			event.preventDefault(); // stop button standard action
			//console.log("You clicked",this.id);
			expandMenu(this.id); //pass id to menu function
		});

	}
	watchSelectMenu();

	// when button is clicked, toggle visibility of menu items
	function expandMenu(target) {

		// change CSS visibility for specified menu ID
		document.querySelector("#"+target+"+.dropdownList").classList.toggle("show");

		// hide menu if anything other than button is clicked
		document.querySelector('body').addEventListener('click', function(event){
			// if topic menu exists on page...
			if (document.querySelector("#topicMenu + .dropdownList")) {
				// if target isn't a button turn off show CSS class
				if (!event.target.matches('button')) {
					document.querySelector("#topicMenu + .dropdownList").classList.remove("show");
				}
			}
		});
	} // end expandMenu

	// set homepage topic menu header from JSON when menu item is selected
	function setTopic(selection, count) {
		document.querySelector("#topicMenu").innerText = selection;
		document.querySelector("#topicMenu + .dropdownList").classList.toggle("show");
		//console.log("you clicked "+selection.innerHTML);
		document.querySelector('.questionCount').innerHTML = count + ' Questions';
	}

	// set topic name on active quiz page
	function setTopicHeader() {
		document.querySelector('.topic').innerText = topicData[topicPosition]['name'];
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
		var menuItems = document.querySelectorAll(".dropdownList a"); // selector for all list link elements

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
			}
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

	// grab quiz page body and fire off question and score system. This is the big one.
	function startQuiz(){
		// load quiz screen via AJAX
		var xmlhttp = new XMLHttpRequest(); // new request
		var url = 'assets/data/questionScreen.html'; // data source. It's just an HTML page

		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		var quizBody = this.responseText; // holds entire JSON
	    		// render HTML into container. A poor man's single page application.
	    		document.querySelector('.container').innerHTML = quizBody;
	    		// How do I do this more intelligently?

	    		setTopicHeader(); // set topic name
				// prefill question one from current topic data
				document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][0]['question'];

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
				// event listener for validating answer
				document.querySelector('.answer').addEventListener('click', function(){

					var userAnswer = document.querySelector('#answerRow textarea').value;
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

					} else {
						errorGenerator(textStrings.pleaseAnswer); // if field is blank yell at the user
					}
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
		// console.log('number of questions ' + topicData[topicPosition]['questions'].length);
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
				+ '<br>Category: ... Coming Soon <br>'
				+ '<strong>Score</strong>: ' + score + ' out of ' + topicData[topicPosition]['questions'].length;
			// lets other loops know the end game sequence is active.
			// Note: If I do a smarter content div replacement I'll need to clear this var when user presses Okay
			final = true;
			modalGenerator(scoreMessage, 'Continue'); // should I make a 3rd var for desitnation?
		}

	}

	// update progress field contents
	function setProgressFieldValue() {
		// update counter at top of page
		if (document.querySelector('.progress')) {
			document.querySelector('.progress').innerHTML = 'Progress: '
				+ (Number(progressCounter) + 1) + ' / ' + topicData[topicPosition]['questions'].length;
		}
		// clear the answer textarea if it exists on the page
		if(document.querySelector('#answerRow textarea')){
			document.querySelector('#answerRow textarea').value = '';
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

	}
// end fake document ready
}, false);
