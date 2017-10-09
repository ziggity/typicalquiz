'use strict'; // no sloppy JS habits allowed here.
document.addEventListener('DOMContentLoaded', function(){
	var topicData; // empty var to hold question JSON
	var topicPosition;
	var progressCounter = 1; // track number of questions asked
	var score = 0; // track user's score

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

	// open select menu
	document.querySelector("#topicMenu").addEventListener("click", function(event){
		event.preventDefault();
		console.log("You clicked",this.id);
		expandMenu(this.id);
	});

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

	// start quiz when button is pressed
	document.querySelector('.start').addEventListener('click', function() {
		startQuiz();
	});

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
					returnToMain();
				});
			}
	    }
	    xmlhttp.open('GET', url, true);
	    xmlhttp.send();

	} // end quiz

	// update progress and score
	function updateProgressCounter() {
		document.querySelector('.progress').innerHTML = 'Progress: ' + progressCounter + ' / ' + topicData[topicPosition]['questions'].length;
	}

	function returnToMain() {
		progressCounter = 1;

		// load quiz screen via AJAX
		var xmlhttp = new XMLHttpRequest();
		var url = 'index.html';

		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
	    		var wholePage = this.responseText;
	    		console.log(wholePage,'here is my container');
	    		document.querySelector('.container').innerHTML = wholePage;
			}
	    }
	    xmlhttp.open('GET', url, true);
	    xmlhttp.send();
	}

// end fake document ready
}, false);
