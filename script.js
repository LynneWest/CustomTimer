$(document).ready(function()
{
	//Change defualt times here
	var deckTimer = 6;
	var stationOneTimer = 4;
	var stationTwoTimer = 4;
	var stationThreeTimer = 4;

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
	$(function()
	{
    	$("input[name=stations]").change(function() 
    	{     
        	if($("#2").is(":checked"))
        	{
        		$(".two-timers").removeClass("hidden");
				$(".three-timers").addClass("hidden");
				$("#three-time-box").addClass("hidden");        		
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
				//ghostTimer.reset();
        	}        
    	});
	});	
	
	//set and display crew order
	//set first crews to timers
	//clear station two and three crew assignments
	var crewArray = [];
	var order;	
	function set()
	{
		crewArray = [];
		//y = 0-1;
		order = $("#order").val(); //put crew-order values from crew-order form into string
		$("#crew-order").html(order); //display current crew order
		crewArray = order.split(","); //put crew-order values into crewArray
		$("#deck").html(crewArray[1]); //display second crew value on onDeck timer
		$(".station-one").html(crewArray[0]); //display first crew value on station1 timer
		$(".station-two").html("");//make station2 crew blank
		$(".station-three").html("");//make station3 crew blank		
	}

	//move crew numbers through timers
	var y = -1;
	function next()
	{	
		if(crewArray[3+y] === undefined)
		{
			$("#deck").html("");
		}
		else
		{
			$("#deck").html(crewArray[3+y]);
		}
		if(crewArray[2+y] === undefined)
		{
			$(".station-one").html("");
		}
		else
		{
			$(".station-one").html(crewArray[2+y]);
		}		
		if(crewArray[1+y] === undefined)
		{
			$(".station-two").html("");
		}
		else
		{
			$(".station-two").html(crewArray[1+y]);
		}			
		if(crewArray[0+y] === undefined)
		{
			$(".station-three").html("");
		}	
		else
		{
			$(".station-three").html(crewArray[0+y]);
		}				
		y++;
	}

	//Adjust timers to user input minutes
	function newTime()
	{
		if($("#deckInput").val()!=="")
		{
			deckTimer = $("#deckInput").val();
			onDeck.adjustMin();								
		}
		if($("#oneInput").val()!=="")
		{
			stationOneTimer = $("#oneInput").val();
			station1.adjustMin();						
		}
		if($("#twoInput").val()!=="")
		{
			stationTwoTimer = $("#twoInput").val();
			station2.adjustMin();						
		}
		if($("#threeInput").val()!=="")
		{
			stationThreeTimer = $("#threeInput").val();
			station3.adjustMin();						
		}

		$("#deck-timer").html(deckTimer+":00");
		$(".timer-one").html(stationOneTimer+":00");
		$(".timer-two").html(stationTwoTimer+":00");
		$(".timer-three").html(stationThreeTimer+":00");
	}

	//Constructor for timers
	function Timer(minute,timerID,input)
	{
		var min = minute-1;
		var sec = 60;
		var self = this;
		this.running = false;
		//console.log(timerID+" running: "+this.running);		
		this.done = false;
		//console.log(timerID+" done: "+this.done);
		this.startTimer;
		this.input = input;		

		this.startCountdown = function()
		{
			if(min>0 && sec>0)
			{
				this.startTimer = setInterval(function(){countdown();},100);
			}
			this.running = true;
			//console.log(timerID+" running: "+this.running);
			//self.done = false;
			//console.log(timerID+" done: "+self.done);
		};

		this.stopCountdown = function()
		{			
			clearInterval(this.startTimer);
			this.running = false;
			//console.log(timerID+" running: "+this.running);			
		};

		function countdown() 
		{			
			sec--;
			
			if(min===0 && sec===0)
			{				
				self.stopCountdown();
				self.done = true;
				//console.log(timerID+" done: "+self.done);								
				doneFunc();
				self.reset();				
				//$(timerID).html(minute+":00");
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
				$(timerID).html(min+":0"+sec);
			}
			
			if(min===0 && timerID != "#deck-timer")
			{
				$(timerID).addClass("red-timer");
			}
			else
			{
				$(timerID).removeClass("red-timer")
			}

			if(min===minute/2 && sec===1 && timerID != "#deck-timer")
			{
				$(timerID).addClass("fade-red")								
			}			
		}

		this.addMin = function()
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
			self.stopCountdown();			
			min = minute-1;			
			sec = 60;
			$(timerID).html(minute+":00");
			newTime();			
		};

		this.crew = 0;
		this.nextCrew = function(crewTimer)
		{
			if(crewArray[this.crew]===undefined)
			{
				$(crewTimer).html("");
			}
			else
			{
				$(crewTimer).html(crewArray[this.crew]);
				this.crew++;
			}
		};		
	}

	var onDeck = new Timer(deckTimer, "#deck-timer", "#deckInput");
	var station1 = new Timer(stationOneTimer, ".timer-one", "#oneInput");
	var station2 = new Timer(stationTwoTimer, ".timer-two", "#twoInput");
	var station3 = new Timer(stationThreeTimer, ".timer-three", "#threeInput");
	//var ghostTimer = new Timer(450);
	
	var doneFunc = function()
	{
		if(onDeck.done && station1.running === false)
		{
			station1.startCountdown();
			//next();
			//station1.nextCrew(".station-one");
		}
		if(station1.done && station2.running === false)
		{
			station2.startCountdown();
			//station2.nextCrew(".station-two");
			//station1.nextCrew(undefined,".station-one");
		}
		if(station2.done && station3.running === false)
		{
			station3.startCountdown();
		}							
	}		

	$("#go").click(function()
	{
		//ghostTimer.startCountdown();
		onDeck.startCountdown();
		station1.startCountdown();		
	});

	//reset all timers and set first crews to timers
	$("#reset").click(function()
	{
		set();
		onDeck.reset();
		station1.reset();
		station2.reset();
		station3.reset();
		//ghostTimer.reset();
	});
	
	//move crews through timers when next button is clicked
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


	$("#submit-crew").click(function()
	{
		set();						
	});		
	$("#submit-time").click(function()
	{		
		newTime();
	});	

});