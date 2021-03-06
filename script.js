$(document).ready(function() {
	
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
	
	//Default times
	const deckTimer = 2;
	const stationOneTimer = 10;
	const stationTwoTimer = 10;
	const stationThreeTimer = 10;		 
	
	//Display default times in timers
	$("#deck-timer").html(deckTimer+stationOneTimer+":00");
	$("#timer-one").html(stationOneTimer+":00");
	$("#timer-two").html(stationTwoTimer+":00");
	$("#timer-three").html(stationThreeTimer+":00");	
	
	//Store and retrieve objects, locally
	Storage.prototype.setObj = function(key, obj) {
		return this.setItem(key, JSON.stringify(obj))
	}
	Storage.prototype.getObj = function(key) {
		return JSON.parse(this.getItem(key))
	}

	//Set and display crew order
	let crewNumArray;
	let crewArray;	
	let crewOrder;	
	function crewSet() {
		crewArray = [];								
		crewOrder = $("#order").val(); //Put crewOrder from form into string	
		if(crewOrder != "") {					
			crewNumArray = crewOrder.split(",");//Put crewOrder values into crewArray
			localStorage.setObj("crews", crewNumArray);//Store crewArray locally	
		}
		else if(localStorage.getObj("crews") != null) {
			crewNumArray = localStorage.getObj("crews");//Get locally stored CrewArray						
		}
		else {
			crewNumArray = [1,2,3,4,5,6];//Default crew order			
		}
		
		//Display crewOrder
		crewOrder = crewNumArray.join(", ");
		$(".crew-order").html(crewOrder);

		//Add "Crew " in front of each array element
		crewNumArray.forEach(function(num) {			
			crewArray.push("Crew "+num);									
		});												
	}	
	
	//Constructor for timers (time in minutes, timer div, input from #adjust-timers form, .crew h1)
	function Timer(minute,timerID,input,crewSpan) {
		let min = minute-1;
		let sec = 60;
		const self = this;
		this.minute = minute;
		this.timerID = timerID;
		this.crewSpan = crewSpan;
		this.hasCrew;		
		this.running = false;				
		this.done = false;				
		this.startTimer;
		this.pause = false;					

		this.startCountdown = function() {									
			this.startTimer = setInterval(function(){countdown();},1000);		
			this.running = true;
			this.done = false;
			this.pause = false;													
		}		
		
		this.stopCountdown = function() {			
			clearInterval(this.startTimer);
			this.running = false;												
		}
		
		//display countdown on timer
		function countdown() {			
			sec--;
						
			if(min===0 && sec===0) { // use 'min < 0' for 0:00, 'min===0 && sec===0' for 0:01				
				self.noCrew();
				$(timerID).addClass("fade-grey");
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
		
		//Adjust time to minutes from input form
		this.newTime = function() {			
			minute = $(input).val();
			min = $(input).val()-1;				
			$(timerID).html(minute+":00");									
		}

		//Calculate deckTimer minutes
		let deckIn;		
		let oneIn;				
		this.deckTime = function() {											
			deckIn = parseInt($('#deckInput').val());			
			oneIn = parseInt($('#oneInput').val());						
			minute = deckIn + oneIn;
			min = minute-1;
			$(timerID).html(minute+":00");														
		}				

		//Add one minute to timer
		this.addMin = function() {
			min++;
			if(!this.running) {
				$(timerID).html((min+1)+":00");	
			}			
		}

		//Reset times and crew index
		this.reset = function()	{
			this.resetTime();
			this.crew = 0;			
		}
		
		//Reset times
		this.resetTime = function() {
			$(timerID).removeClass("red-timer");
			self.stopCountdown();			
			min = minute-1;			
			sec = 60;			
			$(timerID).html(minute+":00");
			$(timerID).removeClass("fade-red");
			this.pause = false;			
		}

		//Move crew numbers through stations
		this.crew = 0;
		this.nextCrew = function() {			
			if(crewArray[this.crew] === undefined) {				
				self.noCrew();
				$(timerID).addClass("fade-grey");												
			}
			else {
				$(crewSpan).html(crewArray[this.crew]);							
				this.crew++;
				$(timerID).removeClass("fade-grey");
				$(timerID).removeClass("is-grey");
				this.hasCrew = true;				
			}					
		}
		this.noCrew = function() {
			$(crewSpan).html("");			
			this.hasCrew = false;
			$(timerID).addClass("is-grey");			
		}				
	}//Timer constructor end	

	//Create new Timer objects
	const onDeck = new Timer(deckTimer, "#deck-timer", "#deckInput", ".deckCrew");
	const station1 = new Timer(stationOneTimer, ".timer-one", "#oneInput", ".oneCrew");
	const station2 = new Timer(stationTwoTimer, ".timer-two", "#twoInput", ".twoCrew");
	const station3 = new Timer(stationThreeTimer, ".timer-three", "#threeInput", ".threeCrew");
	
	const timers = [onDeck,station1,station2,station3];

	onDeck.deckTime(station1.minute);
	resetAll();

	//Put crews to timers
	function loadCrews() {	
		onDeck.nextCrew();
		onDeck.nextCrew();
		station1.nextCrew();		
	}		

	//Reset all timer minutes and crew indexes
	function resetAll() {
		timers.forEach(function(timer){
			timer.reset();
		});
		crewSet();
		loadCrews();		
		station2.noCrew();
		station3.noCrew();		
		$("#next").prop("disabled", false);
		$("#go").prop("disabled", false);
		$(".play").prop("disabled", false);
		$("#pauseAll").prop("disabled", true);	
		$("#add-min-button").prop("disabled", false);	
	}
	
	//Start and move crews through timers	
	function timerDone() {
		if((station3.done && station3.crew+1 < station2.crew || station2.done && station3.crew < station2.crew) && !threeHidden && !station3.running && crewArray[station3.crew] != undefined && !station3.pause) {
			station3.nextCrew();
			station3.startCountdown();
		}
		if((station2.done && station2.crew+1 < station1.crew || station1.done && station2.crew < station1.crew) && !station2.running && crewArray[station2.crew] != undefined && !station2.pause) {			
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
	
	//Pause timers
	function pauseDeck() {
		if(onDeck.running) {
			onDeck.stopCountdown();
			onDeck.pause = true;
		}		
	}
	function pause1() {
		if(station1.running) {
			onDeck.stopCountdown();
			station1.stopCountdown();
			onDeck.pause = true;
			station1.pause = true;
		}
	}
	function pause2() {
		if(station2.running) {
			station2.stopCountdown();	
			station2.pause = true;
		}
	}
	function pause3() {
		if(station3.running) {
			station3.stopCountdown();
			station3.pause = true;
		}
	}
	
	//When go clicked, start all timers with crews, if no timers are running
	$("#go").click(function() {
		if(!onDeck.running && !station1.running  && !station2.running && !station3.running) {			
			timers.forEach(function(timer) {
				if(timer.hasCrew) {
					timer.startCountdown();
				}
			});
		}		
		$("#next").prop("disabled", true);
		$("#go").prop("disabled", true);
		$(".play").prop("disabled", false);
		$("#pauseAll").prop("disabled", false);
		$("#add-min-button").prop("disabled", false);					
	});

	//When reset clicked reset all timers and set first crews to timers
	$("#reset").click(function() {		
		resetAll();									
	});
	
	//When next is clicked move all crews through stations
	$("#next").click(function()	{
		if(!onDeck.running && !onDeck.pause && !station1.running && !station1.pause && !station2.running && !station2.pause && !station3.running && !station3.pause) {
			onDeck.nextCrew();
			station1.nextCrew();
			station2.nextCrew();
			if(station2.crew > 1) {
				station3.nextCrew();
			}
		}						
	});

	//Pause all timers
	$("#pauseAll").click(function() {
		pauseDeck();
		pause1();
		pause2();
		pause3();		
		$("#go").prop("disabled", false);
		$(".play").prop("disabled", true);
		$("#pauseAll").prop("disabled", true);
		$("#add-min-button").prop("disabled", true);				
	});	

	//When station1 pause is clicked pause station1 timer and onDeck timer	
	$(".pauseOne").click(function()	{
		pause1();	
	});

	//When station2 pause is clicked pause station2 timer 
	$(".pauseTwo").click(function()	{
		pause2();
	});

	//When station3 pause is clicked pause station3 timer
	$(".pauseThree").click(function() {
		pause3();			
	});

	//When 'add 1 minute' button is clicked add one minute to onDeck timer
	$("#add-min-button").click(function() {
		if(onDeck.hasCrew){
			onDeck.addMin();
		}		
	});

	//When station1 play is clicked start station1, start onDeck if it has a crew
	$(".playOne").click(function() {				
		if(!station1.running && station1.hasCrew) {
			station1.startCountdown();
			if(onDeck.hasCrew && !onDeck.running) {
				onDeck.startCountdown();
			}
		}				
	});	

	//When station2 play is clicked start station2 timer
	$(".playTwo").click(function() {		
		if(!station2.running && station2.hasCrew) {	
			station2.startCountdown();
		}				
	});

	//When station3 play is clicked start station3 timer
	$(".playThree").click(function() {		
		if(!station3.running && station3.hasCrew) {
			station3.startCountdown();
		}
	});

	//Display two timers or three timers depending on radio button selection
	let threeHidden = true;	
	$("input[name=stations]").change(function() {     
		if($("#2").is(":checked")) {
			$(".two-timers").removeClass("hidden");
			$(".three-timers").addClass("hidden");
			$("#three-time-box").removeClass("fade-in");			
			threeHidden = true;        		
		}
		else {
			$(".two-timers").addClass("hidden");
			$(".three-timers").removeClass("hidden");
			$("#three-time-box").addClass("fade-in");			
			threeHidden = false;				
		}		 
		resetAll();       
	});		

	//When submit button on crew form is clicked set and display crew order, set first crews to stations
	$("#submit-crew").click(function() {				
		resetAll();						
	});	

	//When submit button on 'adjust timer minutes' form is clicked adjust timers to user input minutes
	$("#submit-time").click(function() {		
		station1.newTime();
		onDeck.deckTime(station1.minute);
		station2.newTime();
		station3.newTime();		
		resetAll();				
	});
});