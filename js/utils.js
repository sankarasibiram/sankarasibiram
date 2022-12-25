

function responseForGET(url) {
	//var http = new ActiveXObject("MSXML2.XMLHTTP.3.0");
	//alert(url);
	var http = getHTTPRequestObject();
	if (http == null) return;

	http.open("GET", url, false);
	try	{
		http.send("null");
	} catch (error) {
		alert('Alert: ' + error);
		return;
	}

	if (http.status >399) {
		alert("Error occured. Status: " + http.status);
		return;
	}
	//alert(http.responseText);
	return http.responseText;
}

function jsonResponseForGET(url) {
	//alert('utils: ' + url);
	var respText = responseForGET(url);
	//alert('utils: ' +respText);
	var resp = JSON.parse(respText);
	/** 
	alert(resp);
	alert(resp.status);
    if (resp.success != 0) {
      alert("URLGET Error occured:" + resp.message)
      return false;
	}
	//alert('utils: ' +JSON.stringify(resp));
	**/
	return resp;
}

function responseForPOST(url, message) {
	//var http = new ActiveXObject("MSXML2.XMLHTTP.3.0");
	var http = getHTTPRequestObject();
	if (http == null) return;
	alert(url + "\n" + message);
	http.open("POST", url, false);
  	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  	//http.setRequestHeader("Content-length", message.length);
  	//http.setRequestHeader("Connection", "close");

	http.send(message);

	//alert(http.status);
	if (http.status >399) {
		alert("Error occured. Status: " + http.status);
		return;
	}
	//alert(http.responseText);
	return http.responseText;
}


function jsonResponseForPOST(url, message) {
	//alert('utils: ' + url);
	var respText = responseForPOST(url, message);
	//alert('utils: ' +respText);
	var resp = JSON.parse(respText);


	if (resp.success != 0) {
		alert("URLGET Error occured:" + resp.message)
		return false;
	}
	//alert('utils: ' +JSON.stringify(resp));
	return resp;
}



function getHTTPRequestObject() {
   var xmlhttp = null;
   // code for Mozilla, etc.
   if (window.XMLHttpRequest)  {
		xmlhttp = new XMLHttpRequest();
   }  else if (window.ActiveXObject) {
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
   }

   if (xmlhttp != null) {
		return xmlhttp;
   } else {
	   alert("Cant determine the object to use. Use IE 6 or above");
	   return null;
   }

}

function getXMLObject(str) {
	var xmldoc = new ActiveXObject("MSXML2.DOMDocument");
	xmldoc.loadXML(str);
	return xmldoc;
}

function getXMLResponse(url) {
	//alert('URL is ' + url);
	//alert(getXMLObject(responseForGET(url)));
	return (getXMLObject(responseForGET(url)));
}

class Timer {

	static timer;

	//constructor(config_js) {
	constructor(function_on_expiry, time_remaining_display) {

		this.inProgress = false;
		this.time_remaining = 0;
		this.time_allowed = 0;
		//this.function_on_start = function_on_start;
		this.time_remaining_display_element = time_remaining_display;
		this.function_on_expiry = function_on_expiry;
		//this.time_remaining_display_element = config_js.time_remaining_display;
		//alert(this.time_remaining_display_element);
	}

	startTimer(allowedTime) {
		let that = this;
		this.inProgress = true;
		this.time_allowed = allowedTime;
		this.time_remaining = allowedTime;
		console.log("time remaining " + this.time_remaining);
		setInterval(function(){that.checkTimer();}, 1000);
	}

	checkTimer() {
		
		if (! this.inProgress) return;
		//console.log("Remaining time " + this.time_remaining);
		
		this.time_remaining = this.time_remaining - 1;
		//console.log("checkTimer: " + this.time_remaining_display_element);
		document.getElementById(this.time_remaining_display_element).value = this.time_remaining;
		if (this.time_remaining > 0) return;

		if (this.time_remaining < 1) {
			this.inProgress = false;
			//console.log("time up");
			this.function_on_expiry();
			document.getElementById(this.time_remaining_display_element).value = this.time_allowed;
		}
		
		
	}
}


//alert("utils loaded");
