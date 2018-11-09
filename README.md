# Custom Countdown Timer
###### This custom countdown timer is used for practical lab exams given by Professor Mastin at Cal Poly, San Luis Obispo. Developed with JavaScript, HTML, and CSS.

## Exam Process Summary
Crews, comprised of several students, complete practical exams at several lab stations. Crews have a set amount of time at each station, when that time runs out, they move on to the next station and have a set amount of time there. Once one crew is finished at a station, another crew begins taking the exam at that station. The order that the crews take the exam in is determined prior to the day of testing.

## App Description
This app features countdown timers for each station as well as an on-deck timer that keeps track of when the next crew in line will start testing. Crew numbers are displayed above each timer to indicate which crew is working at that station. When the START button is clicked the first timers start for the first crews. Once the allotted time runs out at a station, the app automatically moves the crew number to the next station and starts the next timer. This process continues until all crews have passed through all stations. There is additional functionality for setup and unexpected events at labs during the exam. The app will be projected to a large screen during testing so all students and Professor Mastin can check the status as needed.

## Requirements
-	An on-deck countdown timer that displays when the next crew in order will begin at station one.
-	The ability to have two or three station timers.
-	Adjustable times for the on-deck timer and station timers.
-	Setup features for number of stations, crew order, and individual timer minutes.
-	Local storage for the crew order so that it can be entered and stored prior to the testing date.
-	A red flash on a station timer when it is at its half-way point.
-	A red background on a station timer when it has one minute or less.
-	A start button that begins the process of moving crews through the stations at the set times.
-	The ability to pause and start individual timers as needed.
-	A reset button to reset the timers and crew progress as necessary.
-	A button to move crews through stations in the event of a reset.
-	A feature to add a minute to the on-deck timer after the exams have started.
-	A clock that displays the current time.

