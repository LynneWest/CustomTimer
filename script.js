$(document).ready(function()
{
	//Change defualt times here
	var deckTimer = 3;
	var stationOneTimer = 2;
	var stationTwoTimer = 2;
	var stationThreeTimer = 2;	

	//Check current time and display on clock
	function clock()
	{
		var d = new Date();
		var hour = d.getHours();
		var min = d.getMinutes();
		var sec = d.getSeconds();
		if(hour>12)
		{
			hour-=12;			
		}
		if(min<10){
			min="0"+min;
		}
		if(sec<10){
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
	var threeHidden = true;	
	$("input[name=stations]").change(function()
	{     
		if($("#2").is(":checked"))
		{
			$(".two-timers").removeClass("hidden");
			$(".three-timers").addClass("hidden");
			$("#three-time-box").addClass("hidden");
			threeHidden = true;        		
		}
		else
		{
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
		
	var crewArray;

	//set and display new crew order from form
	var crewOrder;	
	function crewSet()
	{				
		crewArray = [1,2,3,4,5,6];//default crew order
		crewOrder = $("#order").val(); //put crew-order from crew-order form into string		
		if(crewOrder!="")
		{			
			$("#crew-order").html(crewOrder); //display current crew order			
			crewArray = crewOrder.split(","); //put crew-order values into crewArray				
		}
		for (i=0; i < crewArray.length; i++){
			crewArray[i]="Crew "+crewArray[i];
		}		
		console.log(crewArray);							
	}
	crewSet();
	
	//Constructor for timers
	function Timer(minute,timerID,input,crewSpan)//time in minutes, timer div, input from change timer form, crew div
	{
		var min = minute-1;
		var sec = 60;
		var self = this;
		this.crewSpan = crewSpan;		
		this.running = false;				
		this.done = false;				
		this.startTimer;
		this.pause = false;					

		this.startCountdown = function()
		{			
			this.startTimer = setInterval(function(){countdown();},100);			
			this.running = true;
			this.done = false;
			this.pause = false;														
		};
		
		this.stopCountdown = function()//pause countdown
		{			
			clearInterval(this.startTimer);
			this.running = false;									
		};
		
		function countdown()//display countdown on timer
		{			
			sec--;
			
			if(min===0 && sec===0)
			{				
				self.stopCountdown();												
				self.done = true;										
				self.resetTime();				
				timerDone();				
			}								
			else if(sec===0)
			{			
				min--;
				sec=60;			
			}
			else if(sec>9)
			{
				$(timerID).html(min+":"+sec);						
			}
			else
			{
				$(timerID).html(min+":0"+sec);//add zero if seconds below 10
			}
			
			if(min===0 && timerID != "#deck-timer")//make timer red when timer is at 1 min or less
			{
				$(timerID).addClass("red-timer");				
			}
			else //remove red timer background
			{
				$(timerID).removeClass("red-timer");
			}
			
			// flash red at halfway point
			var halfMin = Math.floor(minute/2);//remove fraction from odd numbered minute
			var halfCond = min===halfMin && timerID != "#deck-timer" && minute>2;		
			if(minute%2===0 && sec===1 && halfCond)
			{
				$(timerID).addClass("fade-red");										
			}
			else if(minute%2 != 0 && sec===31 && halfCond)
			{
				$(timerID).addClass("fade-red");								
			}			
		}
		 
		this.newTime = function()
		{
			if($(input).val()!=="")
			{
				minute = $(input).val();
				this.adjustMin();
				$(timerID).html(minute+":00");								
			}						
		}

		this.addMin = function()// add one minute to timer
		{
			min++;
			if(this.running===false)
			{
				$(timerID).html((min+1)+":00");	
			}			
		};

		this.adjustMin = function()
		{
			min = $(input).val()-1;			
		};

		this.reset = function()//reset timer times and crew index
		{
			this.resetTime();
			this.crew = 0;			
		};
		
		this.resetTime = function()//reset timer times
		{
			$(timerID).removeClass("red-timer");
			self.stopCountdown();			
			min = minute-1;			
			sec = 60;
			$(timerID).html(minute+":00");
			$(timerID).removeClass("fade-red");
		}
		
		//move crew numbers through stations
		this.crew = 0;
		this.nextCrew = function()
		{			
			if(crewArray[this.crew]===undefined)
			{
				$(crewSpan).html("");				
			}
			else
			{
				$(crewSpan).html(crewArray[this.crew]);					
				this.crew++;				
			}
			return this.crew;			
		};
	}

	//time in minutes, timer div, input from change timer form, crew div
	var onDeck = new Timer(deckTimer, "#deck-timer", "#deckInput", ".deckCrew");
	var station1 = new Timer(stationOneTimer, ".timer-one", "#oneInput", ".oneCrew");
	var station2 = new Timer(stationTwoTimer, ".timer-two", "#twoInput", ".twoCrew");
	var station3 = new Timer(stationThreeTimer, ".timer-three", "#threeInput", ".threeCrew");		
	
	var loadCrews = function()
	{	
		onDeck.nextCrew();
		onDeck.nextCrew();
		station1.nextCrew();		
	}	
	loadCrews();
	
	function timerDone()
	{		
		if(onDeck.done && station1.done && crewArray[station1.crew] != undefined)
		{
			station1.nextCrew();
			station1.startCountdown();
			if(crewArray[onDeck.crew] != undefined){
				onDeck.nextCrew();			
				onDeck.startCountdown();				
			}
			else{
				onDeck.stopCountdown();
				$(onDeck['crewSpan']).html("");				
			}
		}
		// if(onDeck.done && crewArray[onDeck.crew] != undefined && station1.done && crewArray[station1.crew] != undefined)
		// {			
		// 	onDeck.nextCrew();			
		// 	onDeck.startCountdown();
		// 	station1.nextCrew();
		// 	station1.startCountdown();					
		// }		
		// if(onDeck.done && crewArray[onDeck.crew] === undefined && station1.done && crewArray[station1.crew] != undefined)
		// {			
		// 	onDeck.stopCountdown();
		// 	$(onDeck['crewSpan']).html("");
		// 	station1.nextCrew();
		// 	station1.startCountdown();									
		// }
		if(station1.done)
		{			
			$(station1['crewSpan']).html("");
			
			if(station2.running === false && crewArray[station2.crew] != undefined && station2.pause === false){
				station2.nextCrew();
				station2.startCountdown();						
				$(station1['crewSpan']).html("");
			}
			else if(station2.done && station2.crew+1 < station1.crew && station2.pause === false && crewArray[station2.crew] != undefined)	
			{
				station2.nextCrew();
				station2.startCountdown();				
			}			
		}
		// if(station1.done && station2.running === false && crewArray[station2.crew] != undefined && station2.pause === false)
		// {			
		// 	station2.nextCrew();
		// 	station2.startCountdown();						
		// 	$(station1['crewSpan']).html("");			
		// }
		// else if(station2.done && station2.crew+1 < station1.crew && station2.pause === false && crewArray[station2.crew] != undefined)	
		// {
		// 	station2.nextCrew();
		// 	station2.startCountdown();				
		// }
		if(station2.done)
		{
			$(station2['crewSpan']).html("");
		}		
		if(threeHidden === false && station2.done && station3.running === false && station3.crew < station2.crew && station3.crew+1 < station1.crew  && crewArray[station3.crew] != undefined && station3.pause === false)
		{			
			station3.startCountdown();			
			station3.nextCrew();			
			$(station2['crewSpan']).html("");			
		}
		else if(threeHidden === false && station3.done && station3.crew+1 < station2.crew && station3.crew+1 < station1.crew && station3.pause === false && crewArray[station3.crew] != undefined)	
		{
			station3.startCountdown();			
			station3.nextCrew();	
		}				
		
		if(station3.done)
		{
			$(station3['crewSpan']).html("");
		}									
	}		

	$("#go").click(function()
	{
		onDeck.startCountdown();
		station1.startCountdown();		
	});

	//reset all timers and set first crews to timers
	$("#reset").click(function()
	{		
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
	$("#next").click(function()
	{		
		onDeck.nextCrew();
		station1.nextCrew();
		station2.nextCrew();
		station3.nextCrew();
	});

	//pause station1 timer and onDeck timer when station1 pause is clicked	
	$(".pauseOne").click(function()
	{
		onDeck.stopCountdown();
		station1.stopCountdown();
		onDeck.pause = true;
		station1.pause = true;		
	});

	//pause station2 timer when station2 pause is clicked
	$(".pauseTwo").click(function()
	{		
		station2.stopCountdown();	
		station2.pause = true;	
	});

	//pause station3 timer when station3 pause is clicked
	$(".pauseThree").click(function()
	{
		station3.stopCountdown();
		station3.pause = true;		
	});

	//add one minute to onDeck timer when add one minute button is clicked
	$("#add-min-button").click(function()
	{
		onDeck.addMin();
	});

	//start onDeck timer and station1 timer when station1 play button is clicked	
	$(".playOne").click(function()
	{		
		if (station1.running === false && $(station1['crewSpan']).html() != "")
		{
			station1.startCountdown();
			if(crewArray[onDeck.crew] != undefined && onDeck.running === false){
				onDeck.startCountdown();
			}
		}				
	});	

	//start station2 timer when station2 play button is clicked
	$(".playTwo").click(function()
	{		
		if(station2.running === false && $(station2['crewSpan']).html() != "")
		{			
			station2.startCountdown();
		}				
	});

	//start station3 timer when station3 play button is clicked
	$(".playThree").click(function()
	{		
		if(station3.running === false && $(station3['crewSpan']).html() != "")
		{
			station3.startCountdown();
		}
	});

	//When submit button is pushed set and display crew order, set first crews to stations
	$("#submit-crew").click(function()
	{
		crewSet();
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();
		loadCrews();						
	});
	
	//When adjust-timer-minutes submit button is pushed adjust timers to user input minutes
	$("#submit-time").click(function()
	{			
		onDeck.newTime();
		station1.newTime();
		station2.newTime();
		station3.newTime();		
	});
});