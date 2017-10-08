'use strict'; // no sloppy JS habits allowed here.
document.addEventListener('DOMContentLoaded', function(){
	document.querySelector("#topicMenu").addEventListener("click", function(event){
		event.preventDefault();
		console.log("You clicked");
		console.log(this.id);
		expandMenu(this.id);
	});

	var menuItems = document.querySelectorAll(".dropdownList a");
	console.log(menuItems);
	for (var i = 0; i < menuItems.length; i++) {
		menuItems[i].onclick = function(){
			setTopic(this.innerHTML);
			console.log("I will pass this",this.innerHTML);
			// console.log("I was clicked "+this[i].innerHTML);
		}
	}

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

	/*
	for (var i = 0; i < menuItems.length; i++) {
		menuItems[i].onclick = function(){
			console.log("I was clicked "+this.innerHTML);
		}
	}
	*/

	//Close if click is anythere outside the button
	// window.onclick = function(event){
	// 	// how can I have it match a click on 'this'?
	// 	if (!event.target.matches('button')){
	// 		document.querySelector("#"+target+"+.dropdownList").classList.toggle("show");
	// 	}
	// }
}

function setTopic(selection) {
	console.log(selection);
	document.querySelector("#topicMenu").innerText = selection;
	document.querySelector("#topicMenu + .dropdownList").classList.toggle("show");
	//console.log("you clicked "+selection.innerHTML);
}

// end fake document ready
}, false);
