'use strict'; // no sloppy JS habits allowed here.
document.addEventListener('DOMContentLoaded', function(){
	var topicData; // empty var to hold question JSON
	var topicPosition;
	var progressCounter = 1; // track number of questions asked
	var score = 0; // track user's score
	var endQuizMessage = 'Are you sure you want to end your quiz?';

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

	// set topic contents from JSON when menu item is selected
	function setTopic(selection) {
		console.log(selection);
		document.querySelector("#topicMenu").innerText = selection;
		document.querySelector("#topicMenu + .dropdownList").classList.toggle("show");
		//console.log("you clicked "+selection.innerHTML);
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
				errorGenerator('Please select a topic.');
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

	    		// add code to update dynamic elements of the page
				// progress counter
				updateProgressCounter();
				// prefill question one from current topic data
				document.querySelector('.questionHolder').innerHTML = topicData[topicPosition]['questions'][0]['question'];

				// close button
				document.querySelector('.close').addEventListener('click', function(){
					// future: make prompt function. Pass confirm box into it. Have confirm box call main screen function
					console.log('close was pressed');
					modalGenerator(endQuizMessage);
				});
			}
	    }
	    xmlhttp.open('GET', url, true);
	    xmlhttp.send();

	} // end quiz

	// update progress and score
	function updateProgressCounter() {
		if (document.querySelector('.progress')) {
			document.querySelector('.progress').innerHTML = 'Progress: ' + progressCounter + ' / ' + topicData[topicPosition]['questions'].length;
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
// end fake document ready
}, false);
