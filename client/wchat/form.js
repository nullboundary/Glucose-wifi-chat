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

    
function init()
{

	Event.observe('login','click',login,false);
	Event.observe(window, 'keyup', handleKeys, false);
}


function login()
{
	
	var username = $('name');
        var userInfo = username.value;

	var par = escape(userInfo);
	
	window.open("http://192.168.1.1:5469/wchat/interface.php?name="+par,"wifi Chat",'height=320,width=750,status=1,scrollbars=0');
	

	var urlLoc = window.location;
	
	window.location=urlLoc;
	
	
}

function handleKeys(event)
{
        var key = event.which || event.keyCode;

	var username = $('name');
        var message = escape(username.value);

        if(key == Event.KEY_RETURN)
        {
                //don't send blank messages
                if(message != "")
                {
                        login();
                }
        }
}
