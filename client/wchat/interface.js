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

Event.observe(window, 'load', init, false);

var rgbColor;

var stream;
    
function init()
{
        //events
        Event.observe('send','click',sendOut,false);      
	Event.observe(window,'beforeunload',cleanup,false);
        Event.observe(window, 'keyup', handleKeys, false);

         //var ip = $('ip');
         //var ipInfo = ip.firstChild.nodeValue;

	//stream HTTP Push
        stream = new HTTP.Push({"uri": "output.php","onPush" : pushHandler});
        stream.start();


	initUser();

}  
/***************************************************
   initUser
	
	initalize a new user joining the chat

***************************************************/

function initUser()
{

	var url = 'input.php';
	var initMsg = "/initClient";

	var user = $('user');
        var userInfo = user.firstChild.nodeValue;

        var ip = $('ip');
        var ipInfo = ip.firstChild.nodeValue;

	        //assign random name color value
        var red = Math.floor(Math.random()*256);
        var green = Math.floor(Math.random()*256);
        var blue = Math.floor(Math.random()*256);

        rgbColor = "#" + red.toColorPart() + green.toColorPart() + blue.toColorPart();
                
        
        var time = getDateTime();

var JSONObj='input='+encodeURIComponent('{"msg":"' + initMsg + '","user":"'+ userInfo + '", "ip":"'+ ipInfo + '", "color":"' + rgbColor + '", "time":"' + time + '", "userList":""}');



	var OutAjax = new Ajax.Request(url, {method: 'get', parameters: JSONObj});
}

/***************************************************
   sendOut
	
	send out the message to the server

***************************************************/
function sendOut()
{
	 
     		var url = 'input.php';

		var input = $F('input');
     		var message = escape(input);
                
                var user = $('user');
                var userInfo = user.firstChild.nodeValue;  

		var ip = $('ip');
                var ipInfo = ip.firstChild.nodeValue;

		  //create a JSON string and encode it for sending as a URL
var JSONObj = 'input=' + encodeURIComponent('{  "msg":"' + message + '", "user":"'+ userInfo + '", "ip":"'+ ipInfo + '", "color":"' + rgbColor+ '", "time":"","userList":"*"}');

		
		var inputElm = $('input');
		inputElm.value = "";
     		
                var OutAjax = new Ajax.Request(url, {method: 'get', parameters: JSONObj});

}


/***************************************************
  handleKeys

	handle key events

***************************************************/

function handleKeys(event)
{
	var key = event.which || event.keyCode;

	 var input = $F('input');
         var message = escape(input);


	if(key == Event.KEY_RETURN)
	{
		//don't send blank messages
		if(message != "")
		{	
			sendOut();
		}
        }
}

/***************************************************
   getDateTime()
	 
 	get the date and time to send from the client
	the router doesn't keep reliable time.

	*this function needs to be improved	 

***************************************************/
function getDateTime()
{
	
        var dt = new Date();

	var minutes = dt.getMinutes();

        //add a zero to the front of minutes under 10
        if(minutes < 10)
        {
                minutes = "0" + minutes;
        }
                        
        var time = dt.getHours() + ":" + minutes;      

	return time;
}

/***************************************************
   pushHandler

	what to do with the data coming back from the server

***************************************************/
var pushHandler = function(t)
{
	var output = document.getElementById("output");
        
	if(t.firstChild != null)
	{
        	var data = t.firstChild.data;

		try 
		{		
			var JSONobj = eval("("+data+")");
		 }                                                                     
                catch(err)
                {
                        stream.stop();
			var text = document.createTextNode("the chat server is down, reload the page to check if it has been reactivated");
                        var para = document.createElement("p");
                        para.appendChild(text);
                        output.appendChild(para);
			return;
                }

                        var msg = JSONobj.msg;
                        var msgclean = decodeURIComponent(msg);
                        var user = JSONobj.user;
                        var userList = JSONobj.userList;
                        userArray = userList;
                        var time = JSONobj.time;
			var color = JSONobj.color;

                        textToScreen(msgclean,user,time,output,userList,color);

                        var userDivEl = document.getElementById("userList");
                        var userListEl = document.getElementById("users");

                        if(userList != null)
                        {

                                if(userList != "*")
                                {
                                        //set the userArray to the userList for use by other functions
                                        userArray = userList;

                                        var listEl = document.createElement("ul");
                                        listEl.setAttribute('id','users');

                                        for(var i=0; i<userList.length; i++)
                                        {

                                                var listUser = userList[i].user;
                                                var listCompName = userList[i].comp;
                                                var listIP = userList[i].ip;  //not using now..

                                                var userItem = document.createElement("li");
						
						var itemDiv = document.createElement("div");
						itemDiv.setAttribute("id","itemDiv");
			
						//create the item divs left right center
       						var itemLeft = document.createElement("div");
     					        itemLeft.setAttribute("id","itemLeft");
						var itemRight = document.createElement("div");
                                                itemRight.setAttribute("id","itemRight");
						var itemCenter = document.createElement("div");
                                                itemCenter.setAttribute("id","itemCenter"); 
						
					        //create text node
                                                var userText = document.createTextNode(listUser + "@" + listCompName);

						var h5 = document.createElement("h5");
                                                h5.appendChild(userText);
						
						itemDiv.appendChild(h5);

						userItem.appendChild(itemDiv);

                                                listEl.appendChild(userItem);

                                        }
                                        userDivEl.replaceChild(listEl, userListEl);

                                }
                        }

        }
}

/**************************************************
  cleanup
		exit the user and log them off the network

***************************************************/
function cleanup()
{
        var url = 'input.php'; 

                var message = "/exit";
                 
                var user = $('user');
                var userInfo = user.firstChild.nodeValue;
                
                var ip = $('ip');
                var ipInfo = ip.firstChild.nodeValue;

		var time = getDateTime();

 //create a JSON string and encode it for sending as a URL
var JSONObj = 'input=' + encodeURIComponent('{  "msg":"' + message + '", "user":"'+ userInfo + '", "ip":"'+ ipInfo + '", "color":"", "time":"' + time + '","userList":"*"}');
     
                var OutAjax = new Ajax.Request(url, {method: 'get', parameters: JSONObj});


}

/**************************************************
  textToScreen

***************************************************/

function textToScreen(msgclean,user,time,output,userList,color)
{

	    //check if message is url and add href if it is
            var urlStat = isUrl(msgclean);
            
            if(urlStat)
            {
            
                 var text = document.createElement("a");
                 text.setAttribute("href",msgclean);
                 var anchorText = document.createTextNode(msgclean);
                 text.appendChild(anchorText);
                
                  
            }      
            else
            {
                 //create msg text node
                 var text = document.createTextNode(msgclean);                         
            }


            if(userList == "*")
            {
               var username = document.createTextNode(user);
               var time = getDateTime()
            }
            else
            {
               var username = document.createTextNode(" ");
            }

            var timenode = document.createTextNode(time);

            //create name and time message  header
            var nameDiv = document.createElement("div");
            nameDiv.setAttribute("id","name");

	    var nameLeftDiv = document.createElement("div");	
	    nameLeftDiv.setAttribute("id","nameLeft");
	    
	    var nameRightDiv = document.createElement("div");
            nameRightDiv.setAttribute("id","nameRight");
	
	    nameDiv.appendChild(nameLeftDiv);
	    nameDiv.appendChild(nameRightDiv);
	
	    var h2 = document.createElement("h2");
	    h2.style.color = color;
            var h3 = document.createElement("h3");
            h3.style.color = color;     		

            h2.appendChild(username);
            h3.appendChild(timenode);

            nameDiv.appendChild(h2);
            nameDiv.appendChild(h3);

            var msgDiv = document.createElement("div");
            msgDiv.setAttribute("id","msg");

            var h4 = document.createElement("h4");
            h4.appendChild(text);

            msgDiv.appendChild(h4);

	    var msgBottomDiv = document.createElement("div");
            msgBottomDiv.setAttribute("id","msgBottom");
	

            //append to output window
            output.appendChild(nameDiv);
            output.appendChild(msgDiv);
	    output.appendChild(msgBottomDiv);
            output.scrollTop = output.scrollHeight;
}


/***********************************************
  isUrl
                check to see if the message is a url
          
************************************************/
                                
function isUrl(message) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return regexp.test(message);
}

