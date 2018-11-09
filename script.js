$(document).ready(function() {

	//Change defualt times here
	const deckTimer = 12;
	const stationOneTimer = 10;
	const stationTwoTimer = 10;
	const stationThreeTimer = 10;	

	//Check current time and display on clock using recursive setTimeout()
	function clock() {
		const d = new Date();
		let hour = d.getHours();
		let min = d.getMinutes();
		let sec = d.getSeconds();
		if(hour > 12) {
			hour-=12;			
		}
		if(min < 10) {
			min="0"+min;
		}
		if(sec < 10) {
			sec="0"+sec;
		}
		$("#clock-time").html(hour+":"+min+":"+sec);		
		setTimeout(clock, 250);
	}
	clock();
	
	//Display defualt times in timers
	$("#deck-timer").html(deckTimer+":00");
	$("#timer-one").html(stationOneTimer+":00");
	$("#timer-two").html(stationTwoTimer+":00");
	$("#timer-three").html(stationThreeTimer+":00");

	//Display two timers or three timers depending on radio button selection
	let threeHidden = true;	
	$("input[name=stations]").change(function() {     
		if($("#2").is(":checked")) {
			$(".two-timers").removeClass("hidden");
			$(".three-timers").addClass("hidden");
			$("#three-time-box").addClass("hidden");
			onDeck.resetTime();
			station1.resetTime();
			station2.resetTime();
			station3.resetTime();
			threeHidden = true;        		
		}
		else {
			$(".two-timers").addClass("hidden");
			$(".three-timers").removeClass("hidden");
			$("#three-time-box").removeClass("hidden");
			onDeck.resetTime();
			station1.resetTime();
			station2.resetTime();
			station3.resetTime();
			threeHidden = false;				
		}        
	});		
	
	//Store and retrieve objects, locally
	Storage.prototype.setObj = function(key, obj) {
		return this.setItem(key, JSON.stringify(obj))
	}
	Storage.prototype.getObj = function(key) {
		return JSON.parse(this.getItem(key))
	}

	//Set and display crew order
	let crewArray;	
	let crewOrder;	
	function crewSet() {								
		crewOrder = $("#order").val(); //Put crewOrder from form into string	
		if(crewOrder != "") {					
			crewArray = crewOrder.split(",");//Put crewOrder values into crewArray
			localStorage.setObj("crews", crewArray);//Store CrewArray locally	
		}
		else if(localStorage.getObj("crews") != null) {
			crewArray = localStorage.getObj("crews");//Get locally stored CrewArray						
		}
		else {
			crewArray = [1,2,3,4,5,6];//Default crew order			
		}
		
		//Display crewOrder
		crewOrder = crewArray.join(", ");
		$(".crew-order").html(crewOrder);

		//Add "Crew " in front of each array element
		for (let i=0; i < crewArray.length; i++) {		
			crewArray[i] = "Crew "+crewArray[i];
		}								
	}
	crewSet();	
	
	//Constructor for timers (time in minutes, timer div, input from #adjust-timers form, .crew h1)
	function Timer(minute,timerID,input,crewSpan) {
		let min = minute-1;
		let sec = 60;
		const self = this;
		this.crewSpan = crewSpan;		
		this.running = false;				
		this.done = false;				
		this.startTimer;
		this.pause = false;					

		this.startCountdown = function() {									
			this.startTimer = setInterval(function(){countdown();},1000);		
			this.running = true;
			this.done = false;
			this.pause = false;													
		};		
		
		this.stopCountdown = function() {			
			clearInterval(this.startTimer);
			this.running = false;												
		};
		
		//display countdown on timer
		function countdown() {			
			sec--;
						
			if(min===0 && sec===0) { // use 'min < 0' for 0:00, 'min===0 && sec===0' for 0:01
				$(self.crewSpan).html("");
				self.stopCountdown();											
				self.done = true;										
				self.resetTime();
				timerDone();				
			}											
			else if(sec === 0) {
				$(timerID).html(min+":0"+sec)							
				min--;
				sec = 60;			
			}
			else if(sec > 9) {
				$(timerID).html(min+":"+sec);						
			}
			else {
				$(timerID).html(min+":0"+sec);
			}			
			
			if(timerID != "#deck-timer") {
				//Make timer red when timer is 1 min or less
				if(min === 0) {
					$(timerID).addClass("red-timer");				
				}				
				else{
					$(timerID).removeClass("red-timer");
				}

				//Flash red at halfway point				
				if(minute > 2) {
					if(minute%2 != 0 && sec === 30 && min === Math.floor(minute/2) || minute%2 === 0 && sec === 60 && min === minute/2-1) {
						$(timerID).addClass("fade-red");
					}					
				}							
			}						
		}//countdown() end		

		//Adjust default time to time from input form
		this.newTime = function() {
			if($(input).val() !== "") {
				minute = $(input).val();
				min = $(input).val()-1;				
				$(timerID).html(minute+":00");								
			}						
		}

		//Add one minute to timer
		this.addMin = function() {
			min++;
			if(this.running === false) {
				$(timerID).html((min+1)+":00");	
			}			
		};		

		//Reset times and crew index
		this.reset = function()	{
			this.resetTime();
			this.crew = 0;			
		};
		
		//Reset times
		this.resetTime = function() {
			$(timerID).removeClass("red-timer");
			self.stopCountdown();			
			min = minute-1;			
			sec = 60;
			$(timerID).html(minute+":00");
			$(timerID).removeClass("fade-red");			
		}

		//Move crew numbers through stations
		this.crew = 0;
		this.nextCrew = function() {			
			if(crewArray[this.crew] === undefined) {
				$(crewSpan).html("");								
			}
			else {
				$(crewSpan).html(crewArray[this.crew]);							
				this.crew++;				
			}					
		}
	}//Timer constructor end

	//Create new Timer objects
	const onDeck = new Timer(deckTimer, "#deck-timer", "#deckInput", ".deckCrew");
	const station1 = new Timer(stationOneTimer, ".timer-one", "#oneInput", ".oneCrew");
	const station2 = new Timer(stationTwoTimer, ".timer-two", "#twoInput", ".twoCrew");
	const station3 = new Timer(stationThreeTimer, ".timer-three", "#threeInput", ".threeCrew");		
	
	//Put crews to timers
	function loadCrews() {	
		onDeck.nextCrew();
		onDeck.nextCrew();
		station1.nextCrew();		
	}	
	loadCrews();
	
	//Start and move crews through timers	
	function timerDone() {
		if((station3.done && station3.crew+1 < station2.crew || station2.done && station3.crew < station2.crew) && threeHidden === false && station3.running === false && crewArray[station3.crew] != undefined && station3.pause === false) {
			station3.nextCrew();
			station3.startCountdown();
		}
		if((station2.done && station2.crew+1 < station1.crew || station1.done && station2.crew < station1.crew) && station2.running === false && crewArray[station2.crew] != undefined && station2.pause === false) {			
			station2.nextCrew();
			station2.startCountdown();			
		}
		if(station1.done && crewArray[station1.crew] != undefined && (station1.crew+1 < onDeck.crew || onDeck.done)) {			
			station1.nextCrew();
			station1.startCountdown();			
		}
		if(onDeck.done && crewArray[onDeck.crew] != undefined) {		
			onDeck.nextCrew();						
			onDeck.startCountdown();			
		}					
	}	

	//When go clicked, start all timers with crews, if no timers are running
	$("#go").click(function() {
		if(onDeck.running === false && station1.running === false && station2.running === false && station3.running === false) {			
			onDeck.startCountdown();
			station1.startCountdown();
			if(station2.crew > 0) {
				station2.startCountdown();
			}
			if(station3.crew > 0) {
				station3.startCountdown();
			}
		}			
	});

	//When reset clicked reset all timers and set first crews to timers
	$("#reset").click(function() {		
		crewSet();
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();
		loadCrews();
		$(station2['crewSpan']).html("");
		$(station3['crewSpan']).html("");
		$(".deck-h1").removeClass("hidden");				
	});
	
	//When next is clicked move all crews through stations
	$("#next").click(function()	{		
		onDeck.nextCrew();
		station1.nextCrew();
		station2.nextCrew();
		if(station2.crew > 1) {
			station3.nextCrew();
		}				
	});

	//When station1 pause is clicked pause station1 timer and onDeck timer	
	$(".pauseOne").click(function()	{
		if(station1.running) {
			onDeck.stopCountdown();
			station1.stopCountdown();
			onDeck.pause = true;
			station1.pause = true;
		}				
	});

	//When station2 pause is clicked pause station2 timer 
	$(".pauseTwo").click(function()	{
		if(station2.running) {
			station2.stopCountdown();	
			station2.pause = true;
		}			
	});

	//When station3 pause is clicked pause station3 timer
	$(".pauseThree").click(function() {
		if(station3.running) {
			station3.stopCountdown();
			station3.pause = true;
		}				
	});

	//When 'add 1 minute' button is clicked add one minute to onDeck timer
	$("#add-min-button").click(function() {
		onDeck.addMin();
	});

	//When station1 play is clicked start station1, start onDeck if it has a crew
	$(".playOne").click(function() {				
		if (station1.running === false && $(station1['crewSpan']).html() != "") {
			station1.startCountdown();
			if(crewArray[station1.crew] != undefined && onDeck.running === false) {
				onDeck.startCountdown();
			}
		}				
	});	

	//When station2 play is clicked start station2 timer
	$(".playTwo").click(function() {		
		if(station2.running === false && $(station2['crewSpan']).html() != "") {	
			station2.startCountdown();
		}				
	});

	//When station3 play is clicked start station3 timer
	$(".playThree").click(function() {		
		if(station3.running === false && $(station3['crewSpan']).html() != "") {
			station3.startCountdown();
		}
	});

	//When submit button on crew form is clicked set and display crew order, set first crews to stations
	$("#submit-crew").click(function() {
		crewSet();		
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();		
		loadCrews();						
	});
	
	//When submit button on 'adjust timer minutes' form is clicked adjust timers to user input minutes
	$("#submit-time").click(function() {			
		onDeck.newTime();
		station1.newTime();
		station2.newTime();
		station3.newTime();
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();		
	});
});