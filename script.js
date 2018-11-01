$(document).ready(function() {

	//Change defualt times here
	const deckTimer = 3;
	const stationOneTimer = 2;
	const stationTwoTimer = 2;
	const stationThreeTimer = 2;	

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
		setTimeout(clock, 500);
	}
	clock();
	
	//display defualt times in timers
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
	
	//set and display crew order
	let crewArray;	
	let crewOrder;	
	function crewSet() {				
		crewArray = [1,2,3,4,5,6];//default crew order
		crewOrder = $("#order").val(); //put crewOrder from crewOrder form into string		
		if(crewOrder != "") {			
			$("#crew-order").html(crewOrder);//display crew order from form	
			crewArray = crewOrder.split(",");//put crew-order values into crewArray	
		}
		//add "crew " in front of each array element
		for (let i=0; i < crewArray.length; i++) {		
			crewArray[i] = "Crew "+crewArray[i];
		}								
	}
	crewSet();
	
	//Constructor for timers
	//(time in minutes, timer div, input from #adjust-timers form, .crew-div)
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
			this.startTimer = setInterval(function(){countdown();},100);		
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
			if(min === 0 && sec === 0) {				
				$(self.crewSpan).html("");
				self.stopCountdown();											
				self.done = true;										
				self.resetTime();				
				timerDone();								
			}								
			else if(sec === 0) {			
				min--;
				sec = 60;			
			}
			else if(sec > 9) {
				$(timerID).html(min+":"+sec);						
			}
			else {
				$(timerID).html(min+":0"+sec);//add zero if seconds below 10
			}			
			
			if(timerID != "#deck-timer") {
				//make timer red when timer is 1 min or less
				if(min === 0) {
				$(timerID).addClass("red-timer");				
				}
				//remove red on timer when timer has more than 1 min 
				else{
				$(timerID).removeClass("red-timer");
				}

				// flash red at halfway point
				const halfMin = Math.floor(minute/2);//remove fraction from odd numbered minute
				if((min === halfMin && minute > 2) && (minute%2 === 0 && sec === 1 || minute%2 != 0 && sec === 31)) {
					$(timerID).addClass("fade-red");						
				}				
			}						
		}//countdown() end		

		//adjust default time to time from input form
		this.newTime = function() {
			if($(input).val() !== "") {
				minute = $(input).val();
				min = $(input).val()-1;				
				$(timerID).html(minute+":00");								
			}						
		}

		// add one minute to timer
		this.addMin = function() {
			min++;
			if(this.running === false) {
				$(timerID).html((min+1)+":00");	
			}			
		};		

		//reset timer times and crew index
		this.reset = function()	{
			this.resetTime();
			this.crew = 0;			
		};
		
		//reset timer times
		this.resetTime = function() {
			$(timerID).removeClass("red-timer");
			self.stopCountdown();			
			min = minute-1;			
			sec = 60;
			$(timerID).html(minute+":00");
			$(timerID).removeClass("fade-red");			
		}

		//move crew numbers through stations
		this.crew = 0;
		this.nextCrew = function() {			
			if(crewArray[this.crew] === undefined) {
				$(crewSpan).html("");				
			}
			else {
				$(crewSpan).html(crewArray[this.crew]);							
				this.crew++;				
			}
			return this.crew;			
		}
	} //Timer constructor end

	//Create new Timer objects
	const onDeck = new Timer(deckTimer, "#deck-timer", "#deckInput", ".deckCrew");
	const station1 = new Timer(stationOneTimer, ".timer-one", "#oneInput", ".oneCrew");
	const station2 = new Timer(stationTwoTimer, ".timer-two", "#twoInput", ".twoCrew");
	const station3 = new Timer(stationThreeTimer, ".timer-three", "#threeInput", ".threeCrew");		
	
	//put crews on timers
	function loadCrews() {	
		onDeck.nextCrew();
		onDeck.nextCrew();
		station1.nextCrew();		
	}	
	loadCrews();
	
	//start and move crews through timers
	function timerDone() {			
		if(onDeck.done && crewArray[onDeck.crew] != undefined) {		
			onDeck.nextCrew();						
			onDeck.startCountdown();			
		}		
		if(station1.done && crewArray[station1.crew] != undefined && (station1.crew+1 < onDeck.crew || onDeck.done)) {			
			station1.nextCrew();
			station1.startCountdown();			
		}				
		if((station2.done && station2.crew+1 < station1.crew || station1.done && station2.crew < station1.crew) && station2.running === false && crewArray[station2.crew] != undefined && station2.pause === false) {			
			station2.nextCrew();
			station2.startCountdown();			
		}		
		if((station3.done && station3.crew+1 < station2.crew || station2.done && station3.crew < station2.crew) && threeHidden === false && station3.running === false && crewArray[station3.crew] != undefined && station3.pause === false) {
			station3.nextCrew();
			station3.startCountdown();
		}													
	}	

	//when go pushed start all timers with crews if no timers are running
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

	//reset all timers and set first crews to timers
	$("#reset").click(function() {		
		crewSet();
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();
		loadCrews();
		$(station2['crewSpan']).html("");
		$(station3['crewSpan']).html("");				
	});
	
	//move all crews through stations when next button is clicked
	$("#next").click(function()	{		
		onDeck.nextCrew();
		station1.nextCrew();
		station2.nextCrew();
		if(station2.crew > 1) {
			station3.nextCrew();
		}				
	});

	//pause station1 timer and onDeck timer when station1 pause is clicked	
	$(".pauseOne").click(function()	{
		onDeck.stopCountdown();
		station1.stopCountdown();
		onDeck.pause = true;
		station1.pause = true;		
	});

	//pause station2 timer when station2 pause is clicked
	$(".pauseTwo").click(function()	{		
		station2.stopCountdown();	
		station2.pause = true;	
	});

	//pause station3 timer when station3 pause is clicked
	$(".pauseThree").click(function() {
		station3.stopCountdown();
		station3.pause = true;		
	});

	//add one minute to onDeck timer when add one minute button is clicked
	$("#add-min-button").click(function() {
		onDeck.addMin();
	});

	//when station1 play is pushed start station1, start onDeck if it still has a crew
	$(".playOne").click(function() {		
		if (station1.running === false && $(station1['crewSpan']).html() != "") {
			station1.startCountdown();
			if(crewArray[onDeck.crew] != undefined && onDeck.running === false) {
				onDeck.startCountdown();
			}
		}				
	});	

	//when station2 play is pushed start station2 timer
	$(".playTwo").click(function() {		
		if(station2.running === false && $(station2['crewSpan']).html() != "") {	
			station2.startCountdown();
		}				
	});

	//when station3 play is pushed start station3 timer
	$(".playThree").click(function() {		
		if(station3.running === false && $(station3['crewSpan']).html() != "") {
			station3.startCountdown();
		}
	});

	//When submit crew is pushed set and display crew order, set first crews to stations
	$("#submit-crew").click(function() {
		crewSet();
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();
		loadCrews();						
	});
	
	//When adjust-timer-minutes submit is pushed adjust timers to user input minutes
	$("#submit-time").click(function() {			
		onDeck.newTime();
		station1.newTime();
		station2.newTime();
		station3.newTime();		
	});
});