<?php

/*
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

*/

error_reporting(E_ALL);
  
     if($_GET['input'])
     {
	 	if(!$fp=pfsockopen('192.168.1.1',9000,$errstr,$errno,30))
	 	{
        		trigger_error('Error opening socket',E_USER_ERROR);
     	 	}
	 $message = $_GET['input'];
	    
	 // write message to socket server
    	 fputs($fp,$message);
    	 // get server response
    	 $ret=fgets($fp,1024);
    	 // close socket connection
    	 //fclose($fp);
    	 echo "<p>$ret</p>";
     }
exit();
?>
