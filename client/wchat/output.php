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


if(!$fp=fsockopen('192.168.1.1',9000,$errstr,$errno,30))
{
        	trigger_error('Error opening socket, server probably not active',E_USER_ERROR);			
}
else
{
	//used to filter out messages for only the correct IP
	 $message = $_GET['ip'];

	 $message = $message . ":output";

         // write message to socket server
         fputs($fp,"#".$message);

	print <<<END
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	 "http://www.w3.org/TR/2002/REC-xhtml1-20020801/DTD/xhtml1-strict.dtd">
	<html><head><title></title></head><body>
END;

	while (!feof($fp))
	{


		//you could create a adressee field in the json string and then filter messages that match for that IP
		//so if this IP matches the addresse field then send the message otherwise don't, unless the adressee field is empty then 
		//send to everyone... just an idea.

  	
  		$ret=fgets($fp,1024);

  		$output = str_replace("\n","",$ret);	

  			print("<p>".$output."</p>");

  			flush();
  			sleep(1);
	}

	print("</body></html>");

	fclose($fp);
}

exit();

?>
