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


var stream;

var rgbColor;

//used for storing userlist info.
var userArray;
    
function init()
{
	Element.hide('passbox');
	Element.hide('stats');
	Element.hide('controls');
	Element.hide('setRate');
	Element.hide('required');


    //events
    Event.observe('send','click',sendOut,false);      
	Event.observe(window,'beforeunload',cleanup,false);
    Event.observe(window, 'keyup', handleKeys, false);
	Event.observe('kick','click',kickUser,false);
	Event.observe('ratebutton','click',setRate,false);

    var ip = $('ip');
    var ipInfo = ip.firstChild.nodeValue;

    //stream HTTP Push
    stream = new HTTP.Push({"uri": "output.php?ip="+ipInfo,"onPush" : pushHandler});
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
	var userListContainer = $('userListContainer');
	var userListDiv = $('userList');
        
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
		
			if(userList != null)
			{
				if(userList != "*")
				{
					//get the user Info div, for later use
					var userInfo = $('userInfo');

					var newUserListDiv = document.createElement("div");
                                        newUserListDiv.setAttribute('id','userList');



					for(var i=0; i<userList.length; i++)
					{
						var listUser = userList[i].user;
				        	var listCompName = userList[i].comp;
				        	var listIP = userList[i].ip; 

						//create section div
						var userSection = document.createElement('div');
						userSection.setAttribute("class","section");
						userSection.setAttribute("id", listUser);

						//section title
						var sectionTitleH = document.createElement('h5');	  
						sectionTitle = document.createTextNode(listUser + "@" + listCompName);
						sectionTitleH.appendChild(sectionTitle);

						//add the title to the section div
						userSection.appendChild(sectionTitleH);	
						
						//user Content section div
						var userContent = document.createElement('div');
						userContent.setAttribute("class", "contents");
						Element.setStyle(userContent,{ "display": "none"});										

						if(i==0)
						{
							userContent.appendChild(userInfo);
						}

						userSection.appendChild(userContent);

			
						
						//apend this section to the userList
						newUserListDiv.appendChild(userSection);
					}
				        userListContainer.replaceChild(newUserListDiv, userListDiv);
				
					var userAcc = new Accordian('userList','h5');
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
  kickUser
                exit the user and log them off the network
                        
***************************************************/
function kickUser()
{                       
        var url = 'input.php';

		var message = "/kick";

		var usernameDiv = $('nameStat');	

		var userID = usernameDiv.firstChild.firstChild.nodeValue;
		splitArray = userID.split(":");
	
		//trim off the extra space
		userName = splitArray[1].substring(1, splitArray[1].length);	
		message = message + " " + userName;

		var passwd = $F('pass');

		//show required if no password
		if(passwd == "")
                {
                        Field.activate('pass');
			Element.show('required');
                }
                else
                {

			message = message + " : " + passwd;
	                         
	                cleanMsg = escape(message);

			Field.clear('pass');			
		        Element.hide('required');
                
	                var user = $('user');
	                var userInfo = user.firstChild.nodeValue;
	                                        
	                var ip = $('ip');
	                var ipInfo = ip.firstChild.nodeValue;
	                                         
	                var time = getDateTime();
                                                
	                //create a JSON string and encode it for sending as a URL
var JSONObj = 'input=' + encodeURIComponent('{  "msg":"' + cleanMsg + '", "user":"'+ userInfo + '", "ip":"'+ ipInfo + '", "color":"", "time":"' + time + '","userList":"*"}');

                	var OutAjax = new Ajax.Request(url, {method: 'get', parameters: JSONObj});
		}
                                                
}

/****************************************************************

	setRate

****************************************************************/

function setRate()
{
	var url = 'input.php';
        var message = "/limit";

	var usernameDiv = $('nameStat');

        var userID = usernameDiv.firstChild.firstChild.nodeValue;
        splitArray = userID.split(":");

	//trim off the extra space
        userName = splitArray[1].substring(1, splitArray[1].length);

        message = message + " " + userName;


		var upbox = $F('up');
		var downbox = $F('down');
		var passwd = $F('pass');

		if(passwd == "")
		{
			Field.activate('pass');
			Element.show('required');
		}
		else
		{

	    message = message + " " + upbox + " " + downbox + " : " + passwd;

            cleanMsg = escape(message);
			
			Field.clear('up');
			Field.clear('down');
			Field.clear('pass');

			Element.hide('required');

            var user = $('user');
            var userInfo = user.firstChild.nodeValue;

            var ip = $('ip');
            var ipInfo = ip.firstChild.nodeValue;

            var time = getDateTime();

            //create a JSON string and encode it for sending as a URL
var JSONObj = 'input=' + encodeURIComponent('{  "msg":"' + cleanMsg + '", "user":"'+ userInfo + '", "ip":"'+ ipInfo + '", "color":"", "time":"' + time + '","userList":"*"}');

            var OutAjax = new Ajax.Request(url, {method: 'get', parameters: JSONObj});
	 }

}

/****************************************************************

	textToScreen

****************************************************************/

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
 
	//if it is a message, then add user name and time to header				
        if(userList == "*")
        {
           var username = document.createTextNode(user);
	       var time = getDateTime()
        }
        else  //don't add username, its a server message
        {
           var username = document.createTextNode(" ");
        }

	    var timenode = document.createTextNode(time); 	
	
	    //create name and time message  header
        var nameDiv = document.createElement("div");
	    nameDiv.setAttribute("id","name");

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

/********************************************
	Accordian Class 
		by Greg  http://www.gregphoto.net
		modified by me

*********************************************/

      Accordian = Class.create();
      Accordian.prototype = {
          initialize: function(elem, clickableEntity) {
              this.container = $(elem);
	      this.userInfo = $('userInfo');	
              var headers = $$('#' + elem + ' .section ' + clickableEntity);
              headers.each(function(header) {
                  Event.observe(header,'click',this.sectionClicked.bindAsEventListener(this));
              }.bind(this));
          },
          sectionClicked: function(event) {
		 this.openSection(Event.element(event).parentNode,Event.element(event));
          },
          openSection: function(section,clickableEntity) {
              var section = $(section);
           if(section.id != this.currentSection) {
		 
                  this.closeExistingSection();
		  this.currentSection = section.id;
		  this.currentClickable = clickableEntity;
                  var contents = document.getElementsByClassName('contents',section);
		  Element.setStyle(clickableEntity,{'background': 'url("images/userList_centerDown.png") left repeat-x'});	                  
		  this.refresh = 0;
		  this.prepareContents(contents[0],section); 
		  	
	 	
		    Element.show('passbox');
        	    Element.show('stats');
        	    Element.show('controls');
        	    Element.show('setRate');
        	    Effect.BlindDown(contents[0]);
              }
	   else if(section.id == this.currentSection)
	   {
		this.closeExistingSection();
		this.currentSection = '';
		this.currentClickable = '';
	
	   }

          },
          closeExistingSection: function() {
              if(this.currentSection) {
                  var contents = document.getElementsByClassName('contents',this.currentSection);
		  Element.setStyle(this.currentClickable,{'background': 'url("images/userList_center2.png") left repeat-x'});
  		  
		   Effect.BlindUp(contents[0]);
		   this.removeContents(contents[0]);
  
              }
  
          },

	  prepareContents: function(contentItem,section) {
	 	contentItem.appendChild(this.userInfo);

		var userInfo = $('userInfo');
		var usernameDiv = $('nameStat');
	        var useripDiv = $('ipStat');
                var usermacDiv = $('macStat');
                var usercompDiv = $('compStat');
                var usertimeDiv = $('timeStat');

		for(var i=0; i<userArray.length; i++)
        	{	
		
		 	var userID = section.id;
            		userName = userID

			if(userName == userArray[i].user)
			{

		 		var listUser = userArray[i].user;
                		var listCompName = userArray[i].comp;
                		var listIP = userArray[i].ip;  
				var listMac = userArray[i].mac;
				var startTime = userArray[i].startTime;		

				var userText = document.createTextNode("Name: " + listUser);
				var compText = document.createTextNode("Computer Name: " + listCompName);
				var ipText = document.createTextNode("IP address: " + listIP);
				var macText = document.createTextNode("Mac ID: " + listMac);
				var startTime = document.createTextNode("Sign On Time: " + startTime);

				//remove the previous nodes
				usernameDiv.removeChild(usernameDiv.childNodes[0]);
				usercompDiv.removeChild(usercompDiv.childNodes[0]);
				useripDiv.removeChild(useripDiv.childNodes[0]);
				usermacDiv.removeChild(usermacDiv.childNodes[0]);	
				usertimeDiv.removeChild(usertimeDiv.childNodes[0]);

				var h5name = document.createElement("h9");
				var h9comp = document.createElement("h9");	
				var h9ip = document.createElement("h9");
				var h9mac = document.createElement("h9");
				var h9time = document.createElement("h9");		                

				h5name.appendChild(userText);
				h9comp.appendChild(compText);
				h9ip.appendChild(ipText);
				h9mac.appendChild(macText);
				h9time.appendChild(startTime);

				usernameDiv.appendChild(h5name);
				usercompDiv.appendChild(h9comp);
				useripDiv.appendChild(h9ip);
				usermacDiv.appendChild(h9mac);
				usertimeDiv.appendChild(h9time);
		
				break;
			}
		} 

	     },

	  removeContents: function(contentItem) {
                contentItem.removeChild(contentItem.childNodes[0]);
             }

  
      }

/***********************************************
  isUrl
		check to see if the message is a url

************************************************/

function isUrl(message) {
	var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
	return regexp.test(message);
}

