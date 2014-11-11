#!/usr/bin/php -q 


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



require_once("JSON.php");

//clear the firewall rules, block all traffic
$outLine = system("/etc/chat_init.fw", $retVal);

//clear the traffic control rules for up and down
//$lastLineDown = system("tc qdisc del dev br0 root",$retval);
$lastLineDownDel = system("tc qdisc del dev vlan1 handle ffff: ingress",$retval);
$lastLineDownAdd = system("tc qdisc add dev vlan1 handle ffff: ingress",$retval);


print("Glucose Copyright (C) 2006  Noah M. Shibley. This program comes with ABSOLUTELY NO WARRANTY; ")
print("Starting php chat server... ");


// Set time limit to indefinite execution 
set_time_limit (0); 

// Set the ip and port we will listen on 
$endchar = chr(0);
$address = '192.168.1.1'; 
$port = 9000; 
$max_clients = 8; 

// Array that will hold user information such as ip, username, idle time, etc. 
$userList = Array();
// Array that will hold client information 
$client = array_fill(0,$max_clients,null); 

// Create a TCP Stream socket 
$sock = socket_create(AF_INET, SOCK_STREAM, 0); 

// Bind the socket to an address/port 
socket_bind($sock, $address, $port) or die('Could not bind to address'); 

// Start listening for connections 
socket_listen($sock); 



while (true)
{ 
    // Setup clients listen socket for reading 
    $read[0] = $sock; 
    
    for ($i = 0; $i < $max_clients; $i++) 
    { 
        if ($client[$i]['sock'] != null)
	{ 
            $read[$i + 1] = $client[$i]['sock']; 
        }
    }
 
    // Set up a blocking call to socket_select() 
    $ready = socket_select($read,$write = null,$except = null,$tv = null); 

  
    /* if a new connection is being made add it to the client array */ 
    if (in_array($sock, $read))
    { 
        for ($i = 0; $i < $max_clients; $i++) 
        { 
            if ($client[$i]['sock'] == null)
	    { 
                $client[$i]['sock'] = socket_accept($sock); 
                break; 
            } 
            elseif ($i == $max_clients - 1)
	    { 
                print ("too many clients"); 
       	    }
	 }
 
        if (--$ready <= 0)
	{ 
            continue;
	} 
    } // end if in_array 
     
    // If a client is trying to write - handle it now...
    $cur_conn = count($client); //Number of clients currently connected.
    $nbconnected = 0;

    for ($i = 0; $i < $cur_conn; $i++) // ...for each client 
    {
		if ($client[$i]['sock'] != null)
		{
			$nbconnected++;
			print("number of connected clients " . $nbconnected . "\n"); 

		}
    }


	for ($i = 0; $i < $cur_conn; $i++) // ...for each client 
    	{
 
        	if (in_array($client[$i]['sock'] , $read)) 
        	{ 
            		$input = socket_read($client[$i]['sock'] , 1024); 
            		
			if ($input == null)
			{ 
                		// Zero length string meaning disconnected 
                		$client[$i]['sock'] = null;
				print("client $i disconnected! \n"); 
            		}
			elseif (strpos($input, "#") === 0)
			{ 
					echo $input . "\n";
					$data = trim($input, "#"); 				
					$dataSplit = explode(":",$data);							

					echo $dataSplit[0] . "ip \n";
					echo $dataSplit[1] . "type \n";

					$client[$i]['ip'] = $dataSplit[0];
					$client[$i]['type'] = $dataSplit[1];
			}
			else
			{
				$command = comCheck($input,$client,$i,$cur_conn,$userList);
 				
				//send the message
		        	if ($input && !$command)
				{ 
					writeToAll($client,$cur_conn,$input);				
				
	    			}
			} 
        	}
    	} 
} // end while 
// Close the master sockets 
socket_close($sock); 


function decodeFilterJSON($JsonData,$keyfilter)
{

	$json = new Services_JSON();
        $data = $json->decode($JsonData);

	return $data->$keyfilter;
}

function decodeJSON($JsonData)
{

        $json = new Services_JSON();
        $data = $json->decode($JsonData);                                             

        return $data;
}

function encodeJSON($data)
{

	$json = new Services_JSON();
	$returnString = $json->encode($data);

	return $returnString;
}

/*******************************************************
  writeToAll

	Send data out to all clients
        
*******************************************************/

function writeToAll($clientList,$curCon,$outData)
{

	for($j=0; $j < $curCon; $j++)
        {

               if ($clientList[$j]['sock'] != null)
               {
                        socket_write($clientList[$j]['sock'],$outData . "\n");
               }
        }


}

/*******************************************************
   adminCheck	

	check the password is correct


*******************************************************/

function adminCheck(&$msg, $user)
{
	echo "adminCheck \n";

	//TODO: this should be read in from file
	$password = "temp";

	$msgSplit = explode("%3A",$msg);

	$msg = $msgSplit[0];

	echo $msgSplit[1] . "pass \n";

	if(trim($msgSplit[1],"%20") == $password)
	{
		return true;
	}
	else
	{
		return false;
	}
	
}

/*******************************************************
  comCheck

	Parse the commands out of the messages

*******************************************************/

function comCheck($input,&$clientList,$clientIndex,$currentCon,&$userList)
{
	$data = decodeJSON($input);
	echo $input . "\n";	
	echo "data" . $data->msg . "\n";

   //check to see if the message is a command	
   if(strpos($data->msg, "/") === 0)
   {
	echo "command! \n";

	//look for a colon in the string to see if there is a password
	if(stristr($data->msg, "%3A"))
        {
		$adminValid = adminCheck($data->msg,$data->user);
        
		echo $data->msg . "post pass check \n";
		echo $adminValid . "\n";
	}        

        //split the message by spaces
        $msgA = explode("%20",$data->msg);
                
        //get the first word of the msg
        $msgCom = $msgA[0];

	switch ($msgCom)
        {

	//---------------------------------------------------------------
	case "/exit":

                  // requested disconnect
                  $msg = $data->user ." has disconnected";
                 
		  $data->msg = $msg;
                  $data->user = "server"; 
  
		  removeUser($data->ip,$userList);
                  $data->userList = $userList;
			
		  print_r($userList);
		
		  $stringJSON = encodeJSON($data);
		  		  	
		  writeToAll($clientList,$currentCon,$stringJSON);

		  //socket_write($clientList[$clientIndex]['sock'],$stringJSON . "\n");
		  
		   for($j=0; $j < $curCon; $j++)
		   {

               		if ($clientList[$j]['sock'] != null)
               		{

			 	if($clientList[$j]['ip'] == $data->user)
				{
					echo $clientList[$j]['ip'] . " match ip \n";
                  			socket_close($clientList[$j]['sock']);
                  			$clientList[$j] = null;
				}
			}
		  }
		 
		  return true;
		  break;

	//----------------------------------------------------------------
	case "/initClient":

		//change the msg
		$data->msg = $data->user . " has joined the network";
	        
                echo "/initClient \n";

		//search to see if the user is already in the list
		$userIndex = findUserByIP($data->ip,$userList);	

		echo $userIndex . " userIndex num \n";


		//user not found add new user
		if($userIndex === NULL)
		{ 
			echo "use not found \n";
			//add user info to userList
			$nextSpace = count($userList);
			$userList[$nextSpace]['user'] = $data->user;
			$userList[$nextSpace]['ip'] = $data->ip;
			$userList[$nextSpace]['startTime'] = $data->time;

			//set the user index number to the new slot
			$userIndex = $nextSpace;
		}
		else
		{
			echo "user found $userIndex \n";
			//update user info in list
                        $userList[$userIndex]['user'] = $data->user;
                        $userList[$userIndex]['ip'] = $data->ip;
			$userList[$userIndex]['startTime'] = $data->time;
		}


		print_r($userList);

		dhcpInfo($userList);
		
		//append firewall rule for this computer to mark packets as 1 give access
		fwAccess("-A", $userList[$userIndex]['ip'],$userList[$userIndex]['mac'],"1");
		
		//set bandwidth rate for this user
		setBandRate($userList[$userIndex]['ip'],"10","50",$userIndex);

		//attach the user list to the JSON output
		$data->userList = $userList;

		$stringJSON = encodeJSON($data);
		echo $stringJSON . "\n";

		writeToAll($clientList,$currentCon,$stringJSON);

		return true;
		break;
	
	//----------------------------------------------------------------
	case "/kick":

	//test if they entered the correct password
	if($adminValid)
        {

                echo "kick ME!!" . $data->msg . "\n";
		
		for($i=1; $i<count($msgA);$i++)
		{
			$username = $msgA[$i];
 			
			for($k=0;$k<count($userList);$k++)
			{
				if($username == $userList[$k]['user'])
    				{
					echo "kick match! \n";
					$msg = $username ." has kicked off the network";
                
			                $data->msg = $msg;
                			$data->user = "server";

					removeUser($userList[$k]['ip'],$userList);
		                        $data->userList = $userList;
                		        print_r($userList);
					
					$stringJSON = encodeJSON($data);

			                writeToAll($clientList,$currentCon,$stringJSON);

					for($j=0; $j < $currentCon; $j++)
			                   {
					
                        		if ($clientList[$j]['sock'] != null)
                        		{
						echo $j . "this is a client list j \n";
                        		        if($clientList[$j]['ip'] == $userList[$k]['ip'])
                               			 {
                                	        echo $clientList[$j]['ip'] . " match ip \n";
                                	        socket_close($clientList[$j]['sock']);
                                	        $clientList[$j] = null;
                       			         }
                     			   }
                			  }



					//socket_close($clientList[$clientIndex]['sock']);
			                //$clientList[$clientIndex]['sock'] = null;

			
					break;
				}
			}

		}
	}				    
        
         	return true;
                break;             

	//--------------------------------------------------------------------------
	case "/limit":

	//test if they entered the correct password
	if($adminValid)
	{

		echo "limit bandwidth \n" ;

                        $username = $msgA[1];

                        for($k=0;$k<count($userList);$k++)
                        {
                                if($username == $userList[$k]['user'])
                                {
                                        echo "limit match! \n";

					if(is_numeric($msgA[2]) && is_numeric($msgA[3]))
					{ 
                                        	setBandRate($userList[$k]['ip'],$msgA[2],$msgA[3],$k);
					}
                                        break;
                                }
                        }

	}
	
	return true;
        break;

	//---------------------------------------------------------------------------
	default:

		// if the message is not a command return true, because it already passed the "/" test
		// so it was intended to be a command even if it was typed incorrectly
		//TODO: need to send back message for incorrect command...

		return true;
	}
   }
}

/*******************************************************
  removeUser
                  
	remove the user from the user list and set the firewall to deny
                        
*******************************************************/ 

function removeUser($userIP, &$userList)
{
	//find and remove user from userList
	for($i=0; $i<count($userList); $i++)
        {

        	if(strcmp($userList[$i]['ip'],$userIP) == 0)
                {
			$userMac = $userList[$i]['mac'];
			array_splice($userList, $i,$i+1);
		}
	}

	// D for delete firewall rule for this computer
	fwAccess("-D",$userIP,$userMac,"1");
	
}


/*******************************************************
  findUserByIP

	search userList and find the user based on IP

*******************************************************/

function findUserByIP($userIP,$userList)
{
	       //find and remove user from userList
        for($i=0; $i<count($userList); $i++)
        {

                if(strcmp($userList[$i]['ip'],$userIP) == 0)
                {
			$index = $i;
			return $index;
                }
        }

	return NULL;
}

/*******************************************************
  setBandRate

	call "tc" and limit the bandwidth of a matched IP

*******************************************************/

function setBandRate($ipAdd,$upRate,$downRate,$hostcount)
{

	//calculate kbits from kbytes
	$kbitdown = floatval($downRate) / floatval("0.125");
  
	$kbitdown = $kbitdown . "kbit";
	$upRate = $upRate . "kbit";
	
	//TODO: this should be set dyanmically based on size of kbit down
	$burstRate = "64k";

	echo "downRate " . $downRate . " kbitdown " . $kbitdown . " \n";

	//clear previous down rate if one existed
	$lastLineDown = system("tc filter del dev vlan1 parent ffff: protocol ip prio 1 u32 match ip dst " . $ipAdd . "/32 >&- 2>&-",$retval);

	//if downrate is 0 then no limiting so don't add a rule for that IP only delete the previous one
	if($downRate != 0)
	{	
		//limit download
        	$lastLineDown = system("tc filter add dev vlan1 parent ffff: protocol ip prio 1 u32 match ip dst "
 		. $ipAdd . "/32 police rate $kbitdown burst $burstRate drop flowid :$hostcount",$retval);
	}



	# limit download
	//$lastLineIn1down = system("tc qdisc add dev $dev root handle $hostcount: htb",$retval);
	//$lastLineIn2down = system("tc class add dev $dev parent $hostcount: classid $hostcount:1 htb rate $downRate burst 6k",$retval);
	//$lastLineIn3down = system("tc filter add dev $dev parent $hostcount: protocol ip prio 16 u32 match ip dst $ipAdd flowid $hostcount:1",$retval);

	# limit upload
	//$lastLineIn1up = system("tc qdisc add dev $dev ingress handle $hostcount: ",$retval);
	//$lastLineIn2up = system("tc filter add dev $dev parent $hostcount: protocol ip u32 match ip src $idAdd police rate $upRate burst 10k drop flowid $hostcount:1",$retval);
  
	//$hostcount++;	

	//$return $hostcount;

}

/*******************************************************
  fwAccess

	give or deny access to the network through calls to IPTables                  
                        
*******************************************************/ 


function fwAccess($cmd,$userIP,$userMac,$mark)
{

	 //make them reauthenticate with with firewall
                
        $cmd = $cmd;
        $ip = $userIP; 
        $mac = $userMac;
        echo $mac . " " . $mark . " " . $cmd . " " . $ip;                                                                    
        $mark = $mark;

	//echo "iptables -t mangle $cmd Chat -m mac --mac-source $mac -s $ip -j MARK --set-mark $mark"; 

        // Mark outbound traffic from this node.
        $lastLineOut = system("iptables -t mangle $cmd Chat -m mac --mac-source $mac -s $ip -j MARK --set-mark $mark", $retval);
	
        //Mark inbound traffic to this node.
        $lastLineIn = system("iptables -t filter $cmd Chat_Inbound -d $ip -j ACCEPT",$retval);

}




/*******************************************************
  dhcpInfo

	read in the dhcp.leases file and add that info to the 
	usersList array for each user.

*******************************************************/

function dhcpInfo(&$userList)
{

	// read the dhcp lease file	
	$handle = @fopen("/tmp/dhcp.leases", "r");
	
	if ($handle) 
	{
   		while (!feof($handle)) 
		{
			//get a line
       			$buffer = fgets($handle, 4096);

			// 946979640 00:40:f4:e2:36:37 192.168.1.132 casey 01:00:40:f4:e2:36:37
			//split that line into an array
			$leaseArray = explode(" ", $buffer);
			
			for($i=0; $i<count($userList); $i++)
			{
			
				if(strcmp($userList[$i]['ip'],$leaseArray[2]) == 0)
				{
					
					$compName = $leaseArray[3];
					//some computers don't have a name, use MAC instead
					if($compName == "*")
					{
						//use the Mac
						$compName = substr($leaseArray[1],12,16);
					}	

					$macAdd = $leaseArray[1];
					$leaseTime = $leaseArray[0];

					$userList[$i]['mac'] = $macAdd;
					$userList[$i]['comp'] = $compName;
					$userList[$i]['lease'] = $leaseTime;
				
					break;
				}
			}
   	
		}							
   		fclose($handle);
	}
	else
	{
		echo "problem opening file /tmp/dhcp.leases \n";
	}
	
}


?> 

