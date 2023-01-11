
function lipiText(elem, text) {Lipi.setText(elem,text);}
function setVisibilityState(elems, visibility_flag) {Lipi.setVisibility(elems, visibility_flag);}
function setActiveState(elems, flag) {Lipi.setActive(elems, flag);}
function removeElement(element) {Lipi.removeElement(element);}

var correct_symbol = "&#x2705;"
var incorrect_symbol = "&#x274C";
var speaker_symbol = "&#x1F50A;";


class Lipi {

	static lipi_selection_element_id = null;

	static _get_element(elem) {
		//alert(elem);
		//if(elem) alert(this._get_element.innerHTML);
		if (elem instanceof Element) return elem;
		let e = document.getElementById(elem);
		if (e) return e;
		throw "Unknown element";
	}

	static _get_iframe_element(elem) {
		let fr = null;
		let iframes = document.getElementsByTagName("iframe");
		for (let x=0; x<iframes.length; x++) {
			let e = iframes[x].contentWindow.document.getElementById(elem);
			if(e) return e;
		}
		return null;	
	}

	static _get_current_lipi() {
		let def = "devanagari";
		try{
			//alert(Lipi.lipi_selection_element_id)
			let e = document.getElementById(Lipi.lipi_selection_element_id);
			return e.value;
		} catch (err) {
			return "devanagari";
			//return "telugu";
		}
	}

	static set_lipi_element(element_id) {
		let e = Lipi._get_element(element_id);
		Lipi.lipi_selection_element_id = element_id;
		if (! e) throw "Could not find " + element_id;
		e.onchange = function() {Lipi.change_lipi();}
	}

	static setText(element, text) {
		let elem = Lipi._get_element(element);
		Lipi.setMultiLipiText(elem, "devanagari", text);
		Lipi.displayMultiLipiText(elem, Lipi._get_current_lipi());
	}

	static change_lipi() {
		//alert('changing lipi');
		try{
			let newlipi = Lipi._get_current_lipi();
			Lipi.changeDisplayLipi(newlipi);
			//alert( 'Changing lipi to ' + newlipi);
		} catch (err) {
			console.log("Could not change lipi " + err.message);
			console.log(err);
		}
	}

	static changeDisplayLipi(new_lipi) {
		let all_elements = [];
		let eles = document.getElementsByClassName("multi-lipi");
		for (let x=0; x<eles.length; x++) all_elements.push(eles[x]);

		for (let x=0; x<all_elements.length; x++) {
			let element = all_elements[x];
			Lipi.displayMultiLipiText(element, new_lipi);
		}
		
	}

	static setMultiLipiText(elem, lang, text) {
		try {
			//let ele = dom_element;
			let ele = Lipi._get_element(elem);
			ele.classList.add("multi-lipi");
			ele.setAttribute("data-lipi", lang);
			ele.setAttribute("data-text", text);
		} catch(err) {
			console.log("setMultiLipiText: Error in setting text value of " + dom_element.id + " in " + lang + " Error: " + err.message);
		}
	}

	static displayMultiLipiText(elem, new_lipi) {
		//alert(elem + ":" + (elem.tagName))
		try {
			let ele = Lipi._get_element(elem);
			let cur_class = ele.getAttribute("class");
			if (! cur_class.includes("multi-lipi")) return;
			let orig_lipi = ele.getAttribute("data-lipi");
			let orig_text = ele.getAttribute("data-text");
			ele.setAttribute("data-display-lipi", new_lipi);
			if(! ((orig_lipi) && (orig_text)) ) {
				orig_lipi = "devanagari";
				orig_text = ele.innerText
				ele.setAttribute("data-lipi", orig_lipi);
				ele.setAttribute("data-text", orig_text);

			}
			//throw ("lipi or text not set");
			ele.innerText = Sanscript.t(orig_text, orig_lipi, new_lipi);
		} catch (err) {
			//console.log("displayMultiLangText: Error in setting text value of " + element + " in " + new_lipi);
			console.log("displayMultiLangText: Error in changing text value to show in " + new_lipi);
			console.log(err);
		}	
	}

	static setVisibility(elems, visibility_flag) {

		let myarray = elems;
		if (! Array.isArray(elems)) myarray = [elems];
		let id = "none";
		//alert("utils: " + elems);
		for (let x=0; x<myarray.length; x++) {
			try {
				//let e = document.getElementById(myarray[x]); //Lipi._get_element(myarray[x]);
				let e = Lipi._get_element(myarray[x]);
				if (e) { 
					id = e.id;
					if (visibility_flag) {
						e.style.display = ""; 
					} else {
						e.style.display = "none";
					}
				} else {
					console.log("Changing visibility of " + id + " failed.");
				} 
			} catch(err) {
				console.log("Changing visibility of " + id + " failed."); 
				console.log(err);
			}
		}
		
	}

	static setActive(elems, flag) {

		let myarray = elems;
		if (! Array.isArray(elems)) myarray = [elems];
		let id = "none";
		for (let x=0; x<myarray.length; x++) {
			try {
				let e = Lipi._get_element(myarray[x]);
				//let e = document.getElementById(myarray[x]);
				if (e) { 
					id = e.id;
					if (flag) {
						e.disabled = false; 
					} else {
						e.disabled = true;
					}
				}
			} catch(err) {console.log("Changing disabled state of " + id + " failed."); console.log(err);}
		}
		
	}

	static removeElement(element) {	
		try {
			var elem = Lipi._get_element(element);
			if (elem) elem.parentNode.removeChild(elem);
		} catch (err) {
			console.log("Could not remove " + id);
			return false;
		}
		return true;
	}
}




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

function includeHTML() {
	let z, i, elmnt, file, xhttp;
	/* Loop through a collection of all HTML elements: */
	z = document.getElementsByTagName("*");
	for (i = 0; i < z.length; i++) {
		elmnt = z[i];
		/*search for elements with a certain atrribute:*/
		file = elmnt.getAttribute("w3-include-html");
		if (file) {
		/* Make an HTTP request using the attribute value as the file name: */
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
			if (this.status == 200) {elmnt.innerHTML = this.responseText;}
			if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
			/* Remove the attribute, and call this function once more: */
			elmnt.removeAttribute("w3-include-html");
			includeHTML();
			}
		}
		xhttp.open("GET", file, true);
		xhttp.send();
		/* Exit the function: */
		return;
		}
	}
}


class Timer {

	static timer;

	//constructor(config_js) {
	constructor(function_on_expiry, time_remaining_display) {

		this.inProgress = false;
		this.time_remaining = 0;
		this.time_allowed = 0;
		this.time_remaining_display_element = time_remaining_display;
		this.function_on_expiry = function_on_expiry;
		this.function_on_timecheck = function() {};
	}

	set_function(function_name, func) {
		if (function_name == "function_on_expiry") this.function_on_expiry = func;
		if (function_name == "function_on_timecheck") {
			this.function_on_timecheck = func;
		}
		
	}

	startTimer(allowedTime) {
		let that = this;
		this.inProgress = true;
		this.time_allowed = allowedTime;
		this.time_remaining = allowedTime;
		console.log("time remaining " + this.time_remaining);
		setInterval(function(){that.checkTimer();}, 1000);
		this.checkTimer();
	}

	format_time_remaining(secs) {

		let minutes = Math.floor((secs/ 60));
		let seconds = secs % 60;

		//let s = [minutes,seconds].map(v => v < 10 ? "0" + v : v).filter((v,i) => v !== "00" || i > 0).join(":")
		let s = [minutes,seconds].map(v => v < 10 ? "0" + v : v).join(":")
		
		return s;
	}

	stopTimer() {
		console.log("stopping timer")
		this.inProgress = false;
		let time_used = (this.time_allowed - this.time_remaining);
		let msg = "Time taken: " + this.format_time_remaining(time_used);
		//alert(this.time_allowed + ":" + this.time_remaining+":"+time_used)
		document.getElementById(this.time_remaining_display_element).innerHTML = msg;
	}

	checkTimer() {
		
		if (! this.inProgress) return;
		
		this.time_remaining = this.time_remaining - 1;
		//console.log("checking timer now.." + this.time_remaining)
		let de = document.getElementById(this.time_remaining_display_element);
		
		let s = this.format_time_remaining(this.time_remaining);
		//de.innerHTML = this.time_remaining;
		de.innerHTML = "Time Remaining: " + s;
		
		//document.getElementById(this.time_remaining_display_element).value = "Time Remaining: "; // + s;

		if ((this.time_remaining > 1)) {
			//if((this.inProgress)) 
			this.function_on_timecheck(this.time_remaining);
			return;
		}

		if (this.time_remaining < 1) {
			this.inProgress = false;
			this.stopTimer();

			this.function_on_expiry();
		} 
	}
}


//alert("utils loaded");
