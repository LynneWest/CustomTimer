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
		var t = setTimeout(clock, 500);
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
			onDeck.reset();
			station1.reset();
			station2.reset();
			station3.reset();
			threeHidden = false;				
		}        
	});
		
	//set and display crew order
	//set first crews to timers
	//clear station two and three crew assignments
	var crewArray = [1,2,3,4,5];
	var crewOrder;	
	function crewSet()
	{				
		crewOrder = $("#order").val(); //put crew-order from crew-order form into string
		if(crewOrder!="")
		{
			crewArray = [];			
			$("#crew-order").html(crewOrder); //display current crew order
			crewArray = crewOrder.split(","); //put crew-order values into crewArray	
		}
		
		$(".deckCrew").html(crewArray[1]); //display second crew value on onDeck timer
		$(".oneCrew").html(crewArray[0]); //display first crew value on station1 timer
		$(".twoCrew").html("");//make station2 crew blank
		$(".threeCrew").html("");//make station3 crew blank		
	}
	crewSet();

	//move all crew numbers through stations
	var y = -1;
	function next()
	{	
		if(crewArray[3+y] === undefined)
		{
			$(".deckCrew").html("");
		}
		else
		{
			$(".deckCrew").html(crewArray[3+y]);
		}
		if(crewArray[2+y] === undefined)
		{
			$(".oneCrew").html("");
		}
		else
		{
			$(".oneCrew").html(crewArray[2+y]);
		}		
		if(crewArray[1+y] === undefined)
		{
			$(".twoCrew").html("");
		}
		else
		{
			$(".twoCrew").html(crewArray[1+y]);
		}			
		if(crewArray[0+y] === undefined)
		{
			$(".threeCrew").html("");
		}	
		else
		{
			$(".threeCrew").html(crewArray[0+y]);
		}				
		y++;
	}

	//Constructor for timers
	function Timer(minute,timerID,input,crewSpan)//time in minutes, timer div, input from change timer form
	{
		var min = minute-1;
		var sec = 60;
		var self = this;
		this.running = false;				
		this.done = false;		
		this.startTimer;
		this.input = input;//input from change timer form
		this.timerID = timerID; //this is for testing	

		this.startCountdown = function()
		{			
			if(min>0 && sec>0)//countdown by 1 second
			{
				this.startTimer = setInterval(function(){countdown();},100);
			}
			this.running = true;
			this.done = false;						
		};

		this.stopCountdown = function()//pause countdown
		{			
			clearInterval(this.startTimer);
			this.running = false;									
		};

		function countdown()// display countdown on timer
		{			
			sec--;
			
			if(min===0 && sec===0)
			{				
				self.stopCountdown();				
				self.done = true;										
				self.reset();				
				doneFunc();				
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
			else if(minute%2 != 0 && sec===30 && halfCond)
			{
				$(timerID).addClass("fade-red");				
			}			
		}
		 
		this.newTime = function()
		{
			if($(this.input).val()!=="")
			{
				minute = $(this.input).val();
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
			min = $(this.input).val()-1;			
		};

		this.reset = function()
		{
			$(timerID).removeClass("red-timer");
			self.stopCountdown();			
			min = minute-1;			
			sec = 60;
			$(timerID).html(minute+":00");												
		};		

		//move crew numbers through stations
		// this.crew = 0;
		// this.nextCrew = function(crewTimer)
		// {
		// 	if(crewArray[this.crew]===undefined)
		// 	{
		// 		$(crewTimer).html("");				
		// 		//this.stopCountdown();
		// 	}
		// 	else
		// 	{
		// 		$(crewTimer).html(crewArray[this.crew]);				
		// 	}			
		// };

	}

	var onDeck = new Timer(deckTimer, "#deck-timer", "#deckInput");
	var station1 = new Timer(stationOneTimer, ".timer-one", "#oneInput");
	var station2 = new Timer(stationTwoTimer, ".timer-two", "#twoInput");
	var station3 = new Timer(stationThreeTimer, ".timer-three", "#threeInput");	
	
	// var doneFunc = function()
	// {
	// 	if(onDeck.done && station1.running === false)
	// 	{
	// 		station1.nextCrew(".oneCrew");
	// 		station1.startCountdown();
	// 		onDeck.nextCrew(".deckCrew")			
	// 		onDeck.startCountdown();			
			
	// 	}
	// 	if(station1.done && station2.running === false)
	// 	{
	// 		station2.startCountdown();			
	// 		station2.nextCrew(".twoCrew");
	// 		station1.nextCrew(undefined,".oneCrew");
	// 	}
	// 	if(station2.done && station3.running === false && threeHidden === false)
	// 	{
	// 		station3.startCountdown();
	// 	}									
	// }		

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
	});
	
	//move crews through stations when next button is clicked
	$("#next").click(function()
	{
		next();
	});

	//pause station1 timer and onDeck timer when station1 pause is clicked	
	$(".pauseOne").click(function()
	{
		onDeck.stopCountdown();
		station1.stopCountdown();		
	});

	//pause station2 timer when station2 pause is clicked
	$(".pauseTwo").click(function()
	{		
		station2.stopCountdown();		
	});

	//pause station3 timer when station3 pause is clicked
	$(".pauseThree").click(function()
	{
		station3.stopCountdown();		
	});

	//add one minute to onDeck timer when add one minute button is clicked
	$("#add-min-button").click(function()
	{
		onDeck.addMin();
	});

	//start onDeck timer and station1 timer when station1 play button is clicked	
	$(".playOne").click(function()
	{		
		onDeck.startCountdown();
		station1.startCountdown();
	});

	//start station2 timer when station2 play button is clicked
	$(".playTwo").click(function()
	{		
		station2.startCountdown();
	});

	//start station3 timer when station3 play button is clicked
	$(".playThree").click(function()
	{		
		station3.startCountdown();
	});

	//When submit button is pushed set and display crew order, set first crews to stations, clear station two and three crew assignments
	$("#submit-crew").click(function()
	{
		crewSet();						
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