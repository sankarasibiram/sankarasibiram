
function lipiText(elem, text) {Lipi.setText(elem,text);}
function setVisibilityState(elems, visibility_flag) {Lipi.setVisibility(elems, visibility_flag);}
function setActiveState(elems, flag) {Lipi.setActive(elems, flag);}
function removeElement(element) {Lipi.removeElement(element);}


class Lipi {

	static lipi_selection_element_id = null;

	static _get_element(elem) {
		if (elem instanceof Element) return elem;
		let e = document.getElementById(elem);
		if (e) return e;
		throw "Unknown element";
	}

	static _get_current_lipi() {
		let def = "devanagari";
		try{
			//alert(Lipi.lipi_selection_element_id)
			let e = document.getElementById(Lipi.lipi_selection_element_id);
			return e.value;
		} catch (err) {
			return "devanagari";
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

		try{
			let newlipi = Lipi._get_current_lipi();
			Lipi.changeDisplayLipi(newlipi);	
		} catch (err) {
			console.log("Could not change lipi " + err.message);
			console.log(err);
		}
	}

	static changeDisplayLipi(new_lipi) {
		let all_elements = document.getElementsByClassName("multi-lipi");
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
		try {
			let ele = Lipi._get_element(elem);;
			let cur_class = ele.getAttribute("class");
			if (! cur_class.includes("multi-lipi")) return;
			let orig_lipi = ele.getAttribute("data-lipi");
			let orig_text = ele.getAttribute("data-text");
			ele.setAttribute("data-display-lipi", new_lipi);
			if(! ((orig_lipi) && (orig_text)) ) throw ("lipi or text not set");
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
		for (let x=0; x<myarray.length; x++) {
			try {
				let e = document.getElementById(myarray[x]); //Lipi._get_element(myarray[x]);
				if (e) { 
					id = e.id;
					if (visibility_flag) {
						e.style.display = ""; 
					} else {
						e.style.display = "none";
					}
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
