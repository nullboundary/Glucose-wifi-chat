<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

  <head>

	<!--

		Copyright (c) 2006 Noah M. Shibley  All right reserved.

		This file is part of Glucose.

		    Glucose is free software: you can redistribute it and/or modify
		    it under the terms of the GNU General Public License as published by
		    the Free Software Foundation, either version 3 of the License, or
		    (at your option) any later version.

		    Glucose is distributed in the hope that it will be useful,
		    but WITHOUT ANY WARRANTY; without even the implied warranty of
		    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		    GNU General Public License for more details.

		    You should have received a copy of the GNU General Public License
		    along with Glucose.  If not, see <http://www.gnu.org/licenses/>.


	-->


    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Wifi Chat</title>
    <link rel="stylesheet" type="text/css" href="interface.css" />	
    <script src="prototype.js" type="text/javascript"></script>
    <script src="interface.js" type="text/javascript"></script>
    <script src="push.js" type="text/javascript"></script>	
</head>

  <body>	
	<div id="title"> <img src="images/glucos_logo_01.gif" alt="Glucose" height="50" width="150" /> </div>	

	<div id="user"><?php echo $_GET['name'] ?></div>
	<div id="ip"><?php echo $_SERVER['REMOTE_ADDR']; ?></div>

        <div id="output">
	</div>

	<div id="inputBar">
             <input type="text" name="textbox" id="input" size="53"></input>
             <div id="send"><h6>Send</h6></div>
        </div>

	<div id="userList" >
	<p>
	  <h1> Users online: </h1>
	</p>

	<ul id="users">
	</ul>

	</div>	
	
	</body>
</html>

