
var grantha = null;

class Grantha {

    constructor(file_loc) {
        this.grantha_location = file_loc;
        this.prasnas = new Array();
        this.grantha = null;
        
        try {
            this.grantha = jsonResponseForGET(this.grantha_location);
        } catch (err) {
            console.log("Error loading the grantha.");
            return false;
        }

        if (this.grantha.grantha_type == "prasnottara") this.parsePrasnasInGrantha();
    }

    getGranthaName() {
        return this.grantha.grantha;
    }

    getGranthaKartha() {
        return this.grantha.grantha_kartha;
    }

    getGranthaType() {
        return this.grantha.grantha_type;
    }

    getSlokaCount() {
        return this.grantha.slokas.length;
    }

    getSlokaNumbers() {
        let slokas = this.grantha.slokas;
        let arr = new Array();
        for(let i=0; i<slokas.length; i++) {
            arr.push(parseInt(slokas[i].sloka_number));
        }
        return arr.sort(function (a, b) {  return a - b;  });
    }

    getSloka(sloka_number) {
        let slokas = this.grantha.slokas;
        for(let i=0; i<slokas.length; i++) {
            if (slokas[i].sloka_number == sloka_number) return slokas[i];
        }
        throw new Error("Invalid sloka count.")
    }

    getMediaFilesForID(id, type) {
        let audio = this.grantha.audio_files;
        let str = audio.folder;
        let a_sl = null;

        if (type == "sloka") a_sl = audio.slokas;
        else if(type == "sloka_with_student") a_sl = audio.slokas_with_student;
        else if(type == "question") a_sl = audio.questions;
        else if(type == "answer") a_sl = audio.answers;

        str += a_sl.prefix + id + "." + audio.file_type;

        let avail = a_sl.availability;
        let _list = a_sl.list;

        if (avail) {
            if (_list.includes(parseInt(id))) return str;
            else return null;
        } else {
            if (_list.includes(parseInt(id))) return null;
            else return str;                
        }
        return str;
    }

    getLineCountInSloka(sloka_number) {
        _sloka = this. getSloka(sloka_number);
        return _sloka.sloka.length;
    }

    getAnvaya(sloka_number) {
        let s = this.getSloka(sloka_number);
        if ( (! s.anvaya) || (s.anvaya == null) || (s.anvaya.length == 0)) return [this.grantha.anvaya_error];
        return s.anvaya;
    }

    parsePrasnasInGrantha() {
        if (this.getGranthaType() != "prasnottara") throw Error("Invalid operation requested.");
        let reqfile = this.grantha.prasna_uttaras_only_file;
        let mydata = jsonResponseForGET(reqfile);
        this.prasnas = mydata;
        return mydata;
    }

    parsePrasnasInGrantha1() {

        if (this.getGranthaType() != "prasnottara") throw Error("Invalid operation requested.");
        let questions = new Array();
        let answers = new Array();
        let slokas = this.grantha.slokas;
        slokas.forEach( (_sloka, sloka_index, sloka_array) => {

            let lines = _sloka.sloka;
            
            lines.forEach((myline, line_index, line_array) => {
                let _line_parts = myline.line_parts;

                _line_parts.forEach(lpart => {
                    let text_to_include = lpart.text.replace("।","").replace("॥","");

                    if (lpart.type == "prasna") {
                        let p = {"sloka_number": _sloka.sloka_number, "question_number": lpart.number, "prasna":text_to_include}
                        questions.push(p);
                    } else if (lpart.type == "utharam") {
                        let u = {"sloka_number": _sloka.sloka_number, "question_number": lpart.number, "utharam":text_to_include}
                        //questions[answers.length].utharam = text_to_include;
                        answers.push(u);
                    }                      
                });                    
            });
            
        });

        for (let x=0; x<questions.length; x++) {
            let q = questions[x];
            let ans = "";
            for (let z=0; z < answers.length; z++) {
                if (answers[z].question_number == q.question_number) ans += " " + answers[z].utharam;
            }

            questions[x].utharam = ans + " ।";
            questions[x].prasna +=  " ?";
        }

        this.prasnas = questions;
        return questions;       
    }

    getPrasnaCount() {
        if (this.getGranthaType() != "prasnottara") throw new Error("Invalid operation requested.");
        if (this.prasnas.length == 0) this.parsePrasnasInGrantha()
        return this.prasnas.length;
    }

    getPrasna(prasna_number) {
        
        if (this.getGranthaType() != "prasnottara") throw new Error("Invalid operation requested.");
        if (this.prasnas.length == 0) this.parsePrasnasInGrantha()
        for(let i=0; i<this.prasnas.length; i++) {
            if (this.prasnas[i].question_number == prasna_number) return this.prasnas[i];
        }

        throw new Error("Prasna " + prasna_number + " not available.");
    }

    getPrasnaNumbers() {
        if (this.getGranthaType() != "prasnottara") throw new Error("Invalid operation requested.");
        if (this.prasnas.length == 0) this.parsePrasnasInGrantha();
        let arr = new Array();
        for(let i=0; i<this.prasnas.length; i++) {
            arr.push(parseInt(this.prasnas[i].question_number));
        }

        return arr.sort(function (a, b) {  return a - b;  });
    }

    getMeaningLanguages() {
        let meanings = this.grantha.meaning;
        return meanings;
    }

    getMeaningForSloka(lang, sloka_id) {
        let langs = this.getMeaningLanguages();
        for (let x=0; x<langs.length; x++) {
            if (langs[x].lang == lang) {
                let meaning = null;

                if (langs[x].hasOwnProperty("meaning")) {
                    meaning = langs[x].meaning;
                } else {
                    meaning = jsonResponseForGET(langs[x].file_loc);
                    langs[x].meaning = meaning;
                }
                let slokas = meaning.slokas;
                for (let y=0; y<slokas.length; y++) {
                    if (slokas[y].sloka_number == sloka_id) return slokas[y].sloka;
                }
                return [meaning.error];
            }
        }
        return "Meaning not available.";
    }
}

class GranthaSetup {

    static grantha_select_id = "grantha-select"; // Dropdown to show grantha list
    static lipi_select_id = "lipi-select"; // Dropdown to show lipi list
    static grantha_card_id = "grantha-card";
    static grantha_card_title_id = "grantha-card-title";
    static sloka_learn_card_id = "sloka-learn-card";
    static prasna_learn_card_id = "prasna-learn-card";
    static grantha_load_button_id = "load-grantha-button-id";

    static test_dropdown_id = "test-dropdown-id";
    static learn_dropdown_id = "learn-dropdown-id";
    static learn_sloka_menu_id = "learn-sloka-menu-id";
    static learn_prasnottarani_menu_id = "learn-prasnottarani-menu-id";
    static learn_sloka_buttons_div_id = "prasna-buttons-div";

    static select_learn_sloka_id = "select-learn-sloka-number-id";
    static learn_sloka_previous_btn_id = "learn-sloka-previous-btn";
    static learn_sloka_next_btn_id = "learn-sloka-next-btn";
    static sloka_div_id = "sloka-div";
    static anvaya_div_id = "sloka-anvaya-div";
    static sloka_anvaya_chkbox_id = "sloka-anvaya-chkbox"
    static sloka_artha_div_id = "sloka-artha-div";
    static select_meaning_lang_id = "select-meaning-lang";
    static select_meaning_chkbox_id = "select-meaning-chkbox";

    static select_learn_prasna_number_id = "select-learn-prasna-number";
    static learn_prasna_previous_id="learn-prasna-previous-btn";
    static learn_prasna_buttons_div = "learn-prasna-buttons-div";
    static learn_prasna_next_id="learn-prasna-next-btn";
    static learn_prasna_div_id = "learn-prasna-div";
    static learn_uttaram_div_id = "learn-utharam-div";


    static practice_prasna_assisted_buttons_div_id = "practice-prasna-assisted-buttons-div";
    static practice_assisted_test_menu_id = "practice-assisted-test-menu";

    static generic_content_card_id = "generic-content-card";
    
    constructor(file_loc) {
        
        this.grantha = null; //When grantha loads, it will be available here.
        this.grantha_setup = jsonResponseForGET(file_loc);
        this.open_grantha_location = null;
        this.setLipiSelectionOptions();
        this.setGranthaSelectionOptions();
        this.display_cards = [GranthaSetup.sloka_learn_card_id, 
            GranthaSetup.prasna_learn_card_id, GranthaSetup.learn_prasna_buttons_div,
            GranthaSetup.practice_prasna_assisted_buttons_div_id, 
            GranthaSetup.learn_sloka_buttons_div_id,
            GranthaSetup.generic_content_card_id
        ];
        this.current_card = null;

        this.initializeDisplayState();

    }

    static check_lipi_changes(myobj) {
        //alert(myobj);
        myobj.setGranthaSelectionOptions();
        myobj.lipiLabelChanges();
        if (myobj.grantha) myobj.setGranthaTitle();
        if (myobj.current_card == GranthaSetup.sloka_learn_card_id) {
            let ele = document.getElementById(GranthaSetup.select_learn_sloka_id);
            myobj.setSlokaToLearnSlokaContent(ele.value);
        } else if (myobj.current_card == GranthaSetup.prasna_learn_card_id) {
            myobj.setPrasnaToLearnContent();
        }
    }

    lipiLabelChanges() {
        let elementsArray = [
            {"id": "navbar_learn_anchor", "text":"अध्ययनम्​" },
            {"id": "navbar_practice_anchor", "text":"अभ्यासः​" },
            {"id": "learn_slokas_anchor", "text":"श्लोकाः" },
            {"id": "learn_prasnottarani_anchor", "text":"प्रश्नोत्तराणि" },
            {"id": "sloka-include-anvayam-label", "text": "सान्वयम्"},
            {"id": "sloka-include-meaning-label", "text": "सार्थम्"},
            {"id": "sloka-repitition-label", "text": "अनूच्चारणम्"},
            {"id": "practice-assisted-test-anchor", "text": "मौखिकाभ्यासः"}
            
        ];

        for (var x=0; x<elementsArray.length; x++) {
            try {
                this.setElementText(elementsArray[x].id, elementsArray[x].text);
            } catch(err) {
                console.log(elementsArray[x].id + " not found.");
            }
        }
    }

    static check_grantha_changes(myobj) {
        //alert("Grantha change");
        let btnid = "load-grantha-button-id"
        if (document.getElementById(GranthaSetup.grantha_select_id).value == this.open_grantha_location) {
            document.getElementById(btnid).disabled = true;
        } else {
            document.getElementById(btnid).disabled = false;
        }
    }

    static getChosenLipi() {
        return document.getElementById(GranthaSetup.lipi_select_id).value;
    } 

    static load_grantha(myobj) {
        myobj.initializeDisplayState();
        myobj.grantha = new Grantha(document.getElementById(GranthaSetup.grantha_select_id).value);

        document.getElementById(GranthaSetup.learn_dropdown_id).style.display = "";
        GranthaSetup.setGranthaCardDisplay(true);
        myobj.setGranthaTitle();
        this.open_grantha_location = document.getElementById(GranthaSetup.grantha_select_id).value;
        document.getElementById("load-grantha-button-id").disabled = true;        
        
        let g_t = myobj.grantha.grantha.grantha_type;
        if (g_t == "prasnottara") {
            myobj.setDisplayForPrasnottara();
            document.getElementById(GranthaSetup.test_dropdown_id).style.display = ""; 
        } else if (g_t == "stotra") {
            myobj.setDisplayForStotra();
            document.getElementById(GranthaSetup.test_dropdown_id).style.display = "none";
            removeElement("learn_prasnottarani_anchor");
        }

        //alert(JSON.stringify(myobj.grantha));
    }

    static setGranthaCardDisplay(show) {
        let e = document.getElementById(GranthaSetup.grantha_card_id);
        if (show) e.style.display = "inherit";
        else e.style.display = "none";
    }    

    static setSlokaLearnCardDisplay(show) {
        let e = document.getElementById(GranthaSetup.sloka_learn_card_id);
        if (show) e.style.display = "inherit";
        else e.style.display = "none";

    }

    static setPrasnaLearnCardDisplay(show) {
        let e = document.getElementById(GranthaSetup.prasna_learn_card_id);
        if (show) e.style.display = "inherit";
        else e.style.display = "none";
    }    

    static learnSlokas(myobj) {
        myobj.showDisplayCard(GranthaSetup.sloka_learn_card_id);
        myobj.setupLearnSlokaDisplayCard();
    }    

    static learnPrasnottarani(myobj) {
        
        myobj.showDisplayCard(GranthaSetup.prasna_learn_card_id);
        myobj.setupLearnPrasnaDisplayCard();

        //alert("prasna ids: " + myobj.grantha.getPrasnaNumbers());
        myobj.setPrasnaToLearn(myobj.grantha.getPrasnaNumbers()[0]);
    }

    getGrantha() {
        return this.grantha;
    }

    initializeDisplayState() {
        
        GranthaSetup.setSlokaLearnCardDisplay(false); //Disable Sloka Learn card
        GranthaSetup.setPrasnaLearnCardDisplay(false);
        GranthaSetup.setGranthaCardDisplay(false);

        // Setup grantha_load button
        let e = document.getElementById(GranthaSetup.grantha_load_button_id);
        let that = this;
        e.onclick = function() {GranthaSetup.load_grantha(that);}

        // Disable learn dropdown
        if (this.grantha == null) {
            document.getElementById(GranthaSetup.learn_dropdown_id).style.display = "none";
            document.getElementById(GranthaSetup.test_dropdown_id).style.display = "none";
        }
        
        this.disableAllDisplayCards();    
    }

    setElementText(element_id, text) {
        let e = document.getElementById(element_id);
        try{
            e.innerText = LipiText.text(text);
        } catch (err) {
            console.log("Error setting text value " + text + " to " + element_id);
            throw err;
        }
    }

    disableAllDisplayCards() {
        let arr = this.display_cards;
        for (let x=0; x<arr.length; x++) {
            document.getElementById(arr[x]).style.display = "none"
        } 
    }

    showDisplayCard(card_to_show) {
        this.disableAllDisplayCards();
        document.getElementById(card_to_show).style.display = "";
        this.current_card = card_to_show;
    }

    setupNavMenuAnchor(anchor_text, anchor_id, parent_element_id, func_to_include) {        
        let that = this;
        let ae = document.createElement("A");
        ae.classList.add("dropdown-item");
        ae.setAttribute("href","#");
        ae.setAttribute("id",anchor_id);
        ae.innerText = anchor_text;
        ae.onclick = func_to_include;

        let e2 = document.getElementById(parent_element_id);
        e2.innerHTML = "";
        e2.style.display = "";
        e2.appendChild(ae);     
    }

    setupLearnSlokasAnchor() {
        let that = this;
        let pid = GranthaSetup.learn_sloka_menu_id;
        let t = LipiText.text("श्लोकाः");
        let a_id = "learn_slokas_anchor"
        let func = function() {GranthaSetup.learnSlokas(that);return false;}
        this.setupNavMenuAnchor(t, a_id, pid, func);       
    }

    setupLearnPrasnottaraniAnchor() {
        let that = this;
        let pid = GranthaSetup.learn_prasnottarani_menu_id;
        let t = LipiText.text("प्रश्नोत्तराणि");
        let a_id = "learn_prasnottarani_anchor"
        let func = function() {GranthaSetup.learnPrasnottarani(that);return false;}
        this.setupNavMenuAnchor(t, a_id, pid, func);       
    }

    setupPracticeAssistedTestAnchor(){
        let that = this;
        let pid = GranthaSetup.practice_assisted_test_menu_id;
        let t = LipiText.text("मौखिकाभ्यासः");
        let a_id = "practice-assisted-test-anchor"
        let func = function() {that.setupPracticeAssistedTest();return false;}
        this.setupNavMenuAnchor(t, a_id, pid, func);
    }

    setDisplayForPrasnottara() {
        this.setupLearnSlokasAnchor();
        this.setupLearnPrasnottaraniAnchor();
        this.setupPracticeAssistedTestAnchor();
    }

    setDisplayForStotra() {
        //alert('one');
        this.setupLearnSlokasAnchor();
    }    

    setGranthaSelectionOptions() {
        let sEle = document.getElementById(GranthaSetup.grantha_select_id);
        let cur_grantha = sEle.value;
        let granthas = this.grantha_setup.granthas;
        sEle.innerHTML = "";
        for (let i=0; i<granthas.length; i++) {
            let oEle = document.createElement("option");
            oEle.value = granthas[i].file_location;
            oEle.text = LipiText.text(granthas[i].name);
            if (cur_grantha == oEle.value) oEle.selected = true;
            sEle.appendChild(oEle);
        }
        let that = this;
        sEle.onchange = function(){GranthaSetup.check_grantha_changes(that);}        
    }
    
    setLipiSelectionOptions() {
        let sEle = document.getElementById(GranthaSetup.lipi_select_id);
        
        let lipis = this.grantha_setup.lipi;
        for (let i=0; i<lipis.length; i++) {
            let oEle = document.createElement("option");
            oEle.value = lipis[i].name;
            oEle.text = lipis[i].display;
            sEle.appendChild(oEle);
        }
        let that = this;
        sEle.onchange = function(){GranthaSetup.check_lipi_changes(that);}
    }

    setGranthaTitle() {
        if (this.grantha) {
            this.setElementText(GranthaSetup.grantha_card_title_id, this.grantha.getGranthaName());
        }
    }

    setupLearnSlokaDisplayCard() {
        
        if (! this.grantha) {console.log("Grantha not selected."); return;}
        let that = this;
        document.getElementById(GranthaSetup.learn_sloka_buttons_div_id).style.display = "";
        //Set up the select sloka id
        let ele = document.getElementById(GranthaSetup.select_learn_sloka_id);
        let curval = ele.value;
        ele.innerHTML = "";
        let sloka_ids = this.grantha.getSlokaNumbers();
        for (let x=0; x<sloka_ids.length; x++) {
            let e = document.createElement("Option");
            e.value = sloka_ids[x];
            e.innerText = sloka_ids[x];
            if (sloka_ids[x] == curval) e.selected = true;
            ele.appendChild(e);
        }
        
        ele.onchange = function() {that.setSlokaToLearn(ele.value);}
        this.setLanguagesForMeaningOptions();
        //this.setLearnSlokaButtonStates();
        this.setSlokaToLearn(sloka_ids[0]);
    }

    setLearnSlokaButtonStates() {
        let that = this;
        let ele = document.getElementById(GranthaSetup.select_learn_sloka_id);
        let curval = ele.value;
        let curindex = ele.selectedIndex;
        let pBtn = document.getElementById(GranthaSetup.learn_sloka_previous_btn_id);
        let nBtn = document.getElementById(GranthaSetup.learn_sloka_next_btn_id);
        let sloka_ids = this.grantha.getSlokaNumbers();
        if (curval == sloka_ids[0]) pBtn.disabled = true;
        else pBtn.disabled = false;

        if (curval == sloka_ids[sloka_ids.length-1]) nBtn.disabled = true;
        else nBtn.disabled = false;
        
        pBtn.onclick =function() {that.setSlokaToLearn(sloka_ids[curindex-1]);}
        nBtn.onclick =function() {that.setSlokaToLearn(sloka_ids[curindex+1]);}
    }

    setSlokaToLearn(sloka_id) {
        //alert('new sloka: ' + sloka_id );
        let ele = document.getElementById(GranthaSetup.select_learn_sloka_id);
        ele.value = sloka_id;
        this.setLearnSlokaButtonStates();
        this.setSlokaToLearnSlokaContent(sloka_id);        
        this.setSlokaToLearnAudio(sloka_id);
        this.setSlokaMeaning();
    }

    setSlokaToLearnSlokaContent(sloka_id) {
        let mydiv = document.getElementById(GranthaSetup.sloka_div_id);        
        mydiv.innerText = ""; //Clear sloka div
        mydiv.appendChild(this.htmlForSloka(sloka_id));
        this.setSlokaAnvaya(sloka_id);
        this.lipiLabelChanges();
    }

    setSlokaAnvaya() {
        let mydiv = document.getElementById(GranthaSetup.anvaya_div_id);
        mydiv.innerText = ""; //Clear sloka div

        let chkbox = document.getElementById(GranthaSetup.sloka_anvaya_chkbox_id);
        let that = this;
        chkbox.onchange = function(){that.setSlokaAnvaya();}
        if(! chkbox.checked) {
            mydiv.style.display = "none";
            return;
        }

        
        let ele = document.getElementById(GranthaSetup.select_learn_sloka_id);
        mydiv.style.display = "";
        let t = this.grantha.getAnvaya(ele.value);
        for (let x=0; x<t.length; x++) {
            let d = document.createElement("text");
            d.innerText = LipiText.text(t[x]);
            mydiv.appendChild(d);
            mydiv.appendChild(document.createElement("BR"));
        }        
    }

    setSlokaToLearnAudio(sloka_id) {
        let that = this;
        let s1 = this.grantha.getMediaFilesForID(sloka_id, "sloka");
        let s2 = this.grantha.getMediaFilesForID(sloka_id, "sloka_with_student");

        let chkbox = document.getElementById("sloka-audio-checkbox");
        chkbox.disabled = false;
        let sloka_span = document.getElementById("sloka-audio");
        let sloka_stud_span = document.getElementById("sloka-with-student-audio");
        sloka_span.innerHTML = "";
        sloka_stud_span.innerHTML = "";

        if (s1) {
            let s1Ele = document.createElement("Audio");
            s1Ele.preload = "none";
            s1Ele.controls = true;
            s1Ele.setAttribute("src", s1);            
            sloka_span.appendChild(s1Ele);            
        } else {
            if (s2) chkbox.checked = true;
            chkbox.disabled = true;                
        }

        if (s2) {
            let s2Ele = document.createElement("Audio");
            s2Ele.preload = "none";
            s2Ele.controls = true;
            s2Ele.setAttribute("src", s2);            
            sloka_stud_span.appendChild(s2Ele);
        } else {
            chkbox.checked = false;
            chkbox.disabled = true;
        }
        
        //alert(chkbox.checked);
        if (chkbox.checked) {
            sloka_span.style.display = "none";
            sloka_stud_span.style.display = "";
        } else {
            sloka_span.style.display = "";
            sloka_stud_span.style.display = "none";
        }
        chkbox.onclick = function() {that.setSlokaToLearnAudio(sloka_id);}
    }

    htmlForSloka(sloka_id) {

        let _sloka = this.grantha.getSloka(sloka_id);

        let lines = _sloka.sloka;
        let tmpSlokaDiv = document.createElement("DIV");
        tmpSlokaDiv.classList.add("fw-bold", "lh-lg", "SlokaText");

        let text = "";
            
        lines.forEach((myline, line_index, line_array) => {
            let _line_parts = myline.line_parts;
            let last_class_type = "SlokaText";
            _line_parts.forEach(lpart => {

                let textEl = document.createElement("span");
                textEl.innerText = LipiText.text(lpart.text) + " ";

                if (lpart.type == "text") {
                    textEl.classList.add("SlokaText");
                    last_class_type = "SlokaText";
                } else if (lpart.type == "prasna") {
                    textEl.classList.add("PrasnaText");
                    last_class_type = "PrasnaText";
                } else if (lpart.type == "utharam") {
                        textEl.classList.add("UtharamText");
                    last_class_type = "UtharamText";
                }

                tmpSlokaDiv.appendChild(textEl);
                
            });
            if (line_index == line_array.length-1) {
                let slokaNumEl = document.createElement("span");
                slokaNumEl.innerText = " " + _sloka.sloka_number + " ॥"
                slokaNumEl.classList.add(last_class_type);
                tmpSlokaDiv.appendChild(slokaNumEl);
            }
            tmpSlokaDiv.appendChild(document.createElement("br"));
        });
        return tmpSlokaDiv;

    }    
    
    setLanguagesForMeaningOptions() {
        let meanings = this.grantha.getMeaningLanguages();
        let sEle = document.getElementById(GranthaSetup.select_meaning_lang_id);
        sEle.onchange = function() {that.setSlokaMeaning();};
        let curval = sEle.selected;
        sEle.innerHTML = "";
        let chkbox = document.getElementById(GranthaSetup.select_meaning_chkbox_id);
        let that = this;
        chkbox.onclick = function() {that.setSlokaMeaning();};

        //if (! chkbox.checked) {sEle.style.display = "none"; return;} // No need to display languages if checkbox is off.

        // Where there is no meaning available
        
        if ((meanings == null) || (meanings.length == 0)) {
            chkbox.checked = false;
            chkbox.disabled = true;
            sEle.style.display = "none"; 
            return;
        }

        for (let i=0; i<meanings.length; i++) {
            let d = document.createElement("Option");
            d.value = meanings[i].lang;
            d.text = meanings[i].display;
            if (d.value == curval) d.selected = true;
            sEle.appendChild(d);
        }
    }

    setSlokaMeaning() {

        let chkbox = document.getElementById(GranthaSetup.select_meaning_chkbox_id);
        let meaningdiv = document.getElementById(GranthaSetup.sloka_artha_div_id);
        let ele = document.getElementById(GranthaSetup.select_learn_sloka_id);
        let sEle = document.getElementById(GranthaSetup.select_meaning_lang_id);

        if (! chkbox.checked) {
            meaningdiv.style.display = "none";
            sEle.style.display = "none";
            return;
        }

        
        sEle.style.display = ""
        let lang = sEle.value;
               
        let t = this.grantha.getMeaningForSloka(lang, ele.value);
        meaningdiv.style.display = "";
        meaningdiv.innerHTML = "";
        for (let x=0; x<t.length; x++) {
            let d = document.createElement("text");
            d.innerText = t[x];
            meaningdiv.appendChild(d);
            meaningdiv.appendChild(document.createElement("BR"));
        }
    }

    setupLearnPrasnaDisplayCard() {

        if (! this.grantha) {console.log("Grantha not selected."); return;}
        let that = this;

        //Set up the select sloka id
        document.getElementById(GranthaSetup.learn_prasna_buttons_div).style.display = ""
        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
        let curval = ele.value;
        ele.innerHTML = "";
        let prasna_ids = this.grantha.getPrasnaNumbers();
        if (!curval) {
            curval = prasna_ids[0];
        }

        for (let x=0; x<prasna_ids.length; x++) {
            let e = document.createElement("Option");
            e.value = prasna_ids[x];
            e.innerText = prasna_ids[x];
            if(curval == prasna_ids[x]) e.selected = true; 
            ele.appendChild(e);
        }
        ele.onchange = function() {that.setPrasnaToLearn(curval);}
        //alert(ele.parentElement.innerHTML);
        //this.setPrasnaToLearn(prasna_ids[0]);
    }

    setPrasnaToLearn(p_id) {
        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
        ele.value = p_id;
        this.setLearnPrasnaButtonStates();
        this.setPrasnaToLearnContent();        
        this.setPrasnaToLearnAudio();
    }

    setLearnPrasnaButtonStates() {
        let that = this;
        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
        let curval = ele.value;
        let curindex = ele.selectedIndex;
        let pBtn = document.getElementById(GranthaSetup.learn_prasna_previous_id);
        let nBtn = document.getElementById(GranthaSetup.learn_prasna_next_id);
        let prasna_ids = this.grantha.getPrasnaNumbers();
        if (curval == prasna_ids[0]) pBtn.disabled = true;
        else pBtn.disabled = false;

        if (curval == prasna_ids[prasna_ids.length-1]) nBtn.disabled = true;
        else nBtn.disabled = false;
        
        pBtn.onclick =function() {that.setPrasnaToLearn(prasna_ids[curindex-1]);}
        nBtn.onclick =function() {that.setPrasnaToLearn(prasna_ids[curindex+1]);}
    }

    clearPrasnaToLearnPrasnaContent() {
        let pDiv = document.getElementById(GranthaSetup.learn_prasna_div_id);
        pDiv.innerHTML = "";
        let prasna_span = document.getElementById("learn-prasna-audio");
        prasna_span.innerHTML = "";        
    }

    setPrasnaToLearnPrasnaContent(prasna_id) {
        let pDiv = document.getElementById(GranthaSetup.learn_prasna_div_id);
        pDiv.style.display = "";
        pDiv.innerHTML = "";
        let pid = prasna_id;

        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
       
        if ((! prasna_id) && (ele)) {
            pid = ele.value;
        }
        let pData = this.grantha.getPrasna(pid);

        let d1 = document.createElement("span");
        d1.classList.add("fw-bold", "lh-lg", "PrasnaText");
        d1.innerText = LipiText.text(pData.prasna)+" ?";
        pDiv.append(d1);
    }

    clearPrasnaToLearnUttaramContent() {
        let uDiv = document.getElementById(GranthaSetup.learn_uttaram_div_id);
        uDiv.innerHTML = ""; 
        let uttaram_span = document.getElementById("learn-uttaram-audio");
        uttaram_span.innerHTML = "";        
    }

    setPrasnaToLearnUttaramContent(prasna_id) {

        let pid = prasna_id;
        let uDiv = document.getElementById(GranthaSetup.learn_uttaram_div_id);
        uDiv.innerHTML = "";
        uDiv.style.display = "";

        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
        if((! prasna_id) && (ele)) {
            pid = ele.value;
        }
        let pData = this.grantha.getPrasna(pid);

        let d2 = document.createElement("span");
        d2.classList.add("fw-bold", "lh-lg", "UtharamText");        
        d2.innerText = LipiText.text(pData.utharam) + " ।";
        uDiv.append(d2); 
    }

    setPrasnaToLearnContent(){
        this.setPrasnaToLearnPrasnaContent();
        this.setPrasnaToLearnUttaramContent();
    }

    setPrasnaToLearnPrasnaAudio(prasna_id, autoplay) {
        let that = this;
        let pid = prasna_id;
        
        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
        if((! prasna_id) && (ele)) {
            pid = ele.value;
        }

        let s1 = this.grantha.getMediaFilesForID(pid, "question");

        let prasna_span = document.getElementById("learn-prasna-audio");
        prasna_span.innerHTML = "";
        prasna_span.style.display = "";

        if ((s1) || (s1 != null))  {
            let s1Ele = document.createElement("Audio");
            s1Ele.preload = "none";
            s1Ele.controls = true;
            if (autoplay) {s1Ele.preload = ""; s1Ele.autoplay = true;}
            s1Ele.setAttribute("src", s1);            
            prasna_span.appendChild(s1Ele);            
        } else {
            prasna_span.style.display = "none";
        }
    }

    setPrasnaToLearnUttaramAudio(prasna_id,autoplay) {
        let that = this;
        let pid = prasna_id 
        
        let ele = document.getElementById(GranthaSetup.select_learn_prasna_number_id);
        if((! prasna_id) && (ele)) {
            pid = ele.value;
        }
        let s2 = this.grantha.getMediaFilesForID(pid, "answer");

        let uttaram_span = document.getElementById("learn-uttaram-audio");
        uttaram_span.innerHTML = "";
        uttaram_span.style.display = "";

        if ( (s2) || (s2 != null) ) {
            let s2Ele = document.createElement("Audio");
            s2Ele.preload = "none";
            s2Ele.controls = true;
            if(autoplay) {s2Ele.preload = ""; s2Ele.autoplay = true; }
            s2Ele.setAttribute("src", s2);            
            uttaram_span.appendChild(s2Ele);
        } else {
            uttaram_span.style.display = "none";
        }

    }

    setPrasnaToLearnAudio() {
        this.setPrasnaToLearnPrasnaAudio();
        this.setPrasnaToLearnUttaramAudio();
    }
    
    setupPracticeAssistedTest() {
        //this.setupLearnPrasnaDisplayCard();
        this.disableAllDisplayCards();
        document.getElementById(GranthaSetup.practice_prasna_assisted_buttons_div_id).style.display = "";        
        document.getElementById(GranthaSetup.prasna_learn_card_id).style.display = "";
        document.getElementById(GranthaSetup.prasna_learn_card_id).style.minHeight = "300px";

        let config_js = {
            "question_div_id" : GranthaSetup.learn_prasna_div_id,
            "answer_div_id" : GranthaSetup.learn_uttaram_div_id,
            "question_audio_div_id": "learn-prasna-audio", 
            "answer_audio_div_id": "learn-uttaram-audio",
            "start_button_id" : "practice-prasna-assisted-start-btn",
            "next_button_id" : "practice-prasna-assisted-next-btn",
            "show_answer_button_id" : "practice-prasna-assisted-show-answer-btn",
            "correct_answer_button_id" : "practice-prasna-assisted-correct-btn",
            "wrong_answer_button_id": "practice-prasna-assisted-incorrect-btn",
            "skip_answer_button_id": "practice-prasna-assisted-skip-btn",
            "review_button_id": "practice-prasna-assisted-review-btn",
            "endtest_button_id": "practice-prasna-assisted-end-btn",
            "allowed_time_id": "practice-prasna-assisted-allowed-time"
        }

        let t = new PracticePrasnaAssistedTest(config_js);
        let that = this;
        t.setTestObject(that);
        t.setTestDisplay();
    }
}

class LipiText {
    static text(t) {
        //let lipi = document.getElementById("lipi-select").value;
        let lipi = GranthaSetup.getChosenLipi();
        if(lipi != "devanagari") return Sanscript.t(t, "devanagari",lipi);
        else return t;
    }
}


class Test {

    constructor(config_json) {
        this.divs = ["question_div_id","answer_div_id", "question_audio_div_id", "answer_audio_div_id","generic-content-card"];        
        this.buttons = ["start_button_id","next_button_id","show_answer_button_id","wrong_answer_button_id",
            "correct_answer_button_id","skip_answer_button_id","review_button_id", "endtest_button_id"];
        this.inputsdiv = ["allowed_time_id"];
        this.min_allowed_time = 10;
        this.max_allowed_time = 300;
        this.config = config_json;

        this.testInProgress = false;
        this.test_object = null;
        this.question_ids = new Array();
        this.questions_asked = new Array();
    }

    setTestObject(myobj) {
        this.test_object = myobj;   
    }

    set_question_ids() {

    }

    getConfigItem(item_id) {
        if (Object.keys(this.config).includes(item_id)) return this.config[item_id];
        else {console.log("getConfigItem: " + item_id + " not found."); return null};
    }

    _set_display_visible(item_id, flag) {
        let x = this.getConfigItem(item_id);
        if ( x == null) return;
        let ele = document.getElementById(x);
        try {
            if (flag) ele.style.display = "";
            else ele.style.display = "none";
        } catch (err) {
            console.log("_set_display_visible: Error setting " + item_id + " to " + flag );
        }
    }

    setTestDisplay(){
        console.log("Test: setTestDisplay: Seting display");
        //Clear all display sections
        this.clearAllDisplaySections();

        for (let x=0; x<this.divs.length; x++) {
            let y = this._set_display_visible(this.divs[x]);
        }

        //Setup buttons
        this.visibleButtons(["start_button_id"]);
        this.enableButtons(["start_button_id"], true);
        this.setTimer();

        let that = this;

        
        let x = this.getConfigItem("start_button_id");        
        if (x != null) {
            let y = document.getElementById(x);
            if (y) y.onclick = function() {that.startTest();}
        }

        let x1 = this.getConfigItem("review_button_id");        
        if (x1 != null) {
            let y = document.getElementById(x1);
            if (y) y.onclick = function() {that.reviewTest();}
        }

    }
    
    setTestControls() {}

    startTest() {
        let that = this;
        
        let onexpiry = function() {that.timeExpired();}
        let ele_id = this.getConfigItem("allowed_time_id");
        let config = {"time_remaining_display_element":ele_id, "on_expiry_function": function() {that.timeExpired();} }
        this.set_question_ids();
        let timer = new Timer(onexpiry, ele_id);        
        this.testInProgress = true;
        this.questions_asked = new Array();
        timer.startTimer(document.getElementById(ele_id).value);

        
        let p = document.getElementById(GranthaSetup.generic_content_card_id);
        p.style.display = "none";
        p.innerHTML = "";

        this.showQuestion();
    }

    endTest() {}

    clearAllDisplaySections() {
        for (let x=0; x<this.divs.length; x++) {
            let y = this.getConfigItem(this.divs[x]);
            if (y==null) continue;
            try {
                let ele = document.getElementById(y);
                ele.innerHTML = "";
            } catch (err) {console.log("clearAllDisplaySections: Error in clearing " + this.divs[x]);}        
        }
    }

    setTimer () {
        let y = this.getConfigItem("allowed_time_id");
        if(y == null) return;
        let x = document.getElementById(y);
        
        if ((x.value < this.min_allowed_time) || (x.value>this.max_allowed_time)) {
            this.enableButtons(["start_button_id"], false);
        } else {
            this.enableButtons(["start_button_id"], true);
        }

        let that = this;
        if (this.testInProgress) x.onchange = function() {};
        else x.onchange = function() {that.setTimer();};
    }

    visibleButtons(visible_buttons) {
        
        let all_buttons = this.buttons;
        for (let x=0; x<all_buttons.length; x++) {
            //console.log("setting state of " + all_buttons[x]);
            if (visible_buttons.includes(all_buttons[x])) this._set_display_visible(all_buttons[x], true);
            else this._set_display_visible(all_buttons[x], false);
        }
    }

    _enable_button(button_id, flag) {
        let x = this.getConfigItem(button_id);
        if(x == null) return;
        let ele = document.getElementById(x);
        try {
            ele.disabled = (! flag);
        } catch (err) {
            console.log("_enable_button: Error setting " + item_id + " to " + flag );
        }        
    }

    enableButtons(buttons_enabled, enabled_flag) {
        // enabled_flag - true - enable buttons, false - disable buttons
        for (let x=0; x<this.buttons.length; x++) {
            if (buttons_enabled.includes(this.buttons[x])) 
                this._enable_button(this.buttons[x], enabled_flag);
        }
    }

    selectQuestionID() {        
        let range = this.question_ids.length;
        let n = Math.floor(Math.random() * range) ;
        let selectedId = this.question_ids[n];
        this.question_ids.splice(n,1);
        return selectedId;
    }

    showQuestion() {

    }

    get_question(question) {
    }

    get_answer(question) {

    }

    getNextQuestion() {}

    showAnswer() {
    }


    showAnswerOptions() {
    }

    setAnswerState(ans) {
        let q = this.questions_asked[this.questions_asked.length - 1];
        this.questions_asked[this.questions_asked.length-1].state = ans;
        console.log(JSON.stringify(this.questions_asked[this.questions_asked.length - 1]));
        this.showQuestion();
    }

    answerSkipped() {}

    answeredRight() {}

    answeredWrong() {}

    logQuestionAnswer() {}
 
    reviewTest() {

    }

    timeExpired() {
        this.testInProgress = false;
        let total = this.questions_asked.length; 
        let correct = 0;
        let wrong = 0;
        let skip = 0;

        for (let x=0; x<this.questions_asked.length; x++) {
            let y = this.questions_asked[x];

            if (y.state == -1) skip = skip+1;
            else if (y.state == 0) wrong = wrong+1;
            else if (y.state == 1) correct = correct+1;            
        }

        let msg = "Total questions asked: " + total;
        msg += ", Correct: " + correct;
        msg += ", Wrong: " + wrong;
        msg += ", Skip: " + skip;
        alert(msg);
        this.visibleButtons(["start_button_id", "review_button_id"]);
        
    }

}

class PracticePrasnaAssistedTest extends Test {
    constructor(config_json) {
        super(config_json);        
    }

    startTest() {
        super.startTest();
        this.show_buttons_on_question();

    }

    set_question_ids() {
        this.question_ids = (this.test_object.grantha.getPrasnaNumbers());
    }

    getNextQuestion() {
        console.log(this.test_object.grantha.getPrasnaNumbers());
        let s = this.selectQuestionID();
        let q = this.test_object.grantha.getPrasna(s);
        return q;
    }

    get_question(question) {
        return question.prasna;
    }
    get_answer(question) {
        return question.utharam;
    }

    show_buttons_on_question() {
        this.visibleButtons(["show_answer_button_id","wrong_answer_button_id","correct_answer_button_id","skip_answer_button_id"]);
        let that = this;

        document.getElementById(this.getConfigItem("show_answer_button_id")).onclick = 
            function() {that.showAnswer();};

        document.getElementById(this.getConfigItem("wrong_answer_button_id")).onclick = 
            function() {that.setAnswerState(0);};

        document.getElementById(this.getConfigItem("correct_answer_button_id")).onclick = 
        function() {that.setAnswerState(1);};

        document.getElementById(this.getConfigItem("skip_answer_button_id")).onclick = 
        function() {that.setAnswerState(-1);};
    }

    showQuestion() {
        console.log('in showquestion');
        let q = this.getNextQuestion();
        q.state = -1;
        this.questions_asked.push(q);

        let p1 = document.getElementById(GranthaSetup.prasna_learn_card_id);
        p1.style.display = "";

        this.test_object.setPrasnaToLearnPrasnaAudio(q.question_number, true);        
        this.test_object.setPrasnaToLearnPrasnaContent(q.question_number);

        document.getElementById(this.getConfigItem("answer_div_id")).style.display = "none";
        document.getElementById(this.getConfigItem("answer_div_id")).innerHTML = "";

        document.getElementById(this.getConfigItem("answer_audio_div_id")).style.display = "none";
        document.getElementById(this.getConfigItem("answer_audio_div_id")).innerHTML = "";

        //this.test_object.setPrasnaToLearnUttaramAudio(q.question_number, false);
        //this.test_object.setPrasnaToLearnUttaramContent(q.question_number);
        this.show_buttons_on_question();

    }
    
    showAnswer() {
        let q = this.getNextQuestion();
        this.test_object.setPrasnaToLearnUttaramContent(q.question_number);
        this.test_object.setPrasnaToLearnUttaramAudio(q.question_number, false);
    }
    
    reviewTest() {
        let questions = this.questions_asked;
        
        let tbl = document.createElement("table");
        tbl.classList.add("table", "table-striped", "table-hover");
        let keys = ["sloka_number", "question_number", "prasna", "utharam", "state"];
        let keys_label = ["Sloka", "Question No", "Question", "Answer", "Review"];

        let th = document.createElement("thead");
        tbl.appendChild(th);
        th.classList.add("sticky-header");

        let tbody = document.createElement("tbody");
        tbl.appendChild(tbody);
        // Add header
        for (let y=0; y<keys_label.length; y++) {
            let key = keys_label[y];
            let td = document.createElement("th");
            td.innerText = key;
            th.appendChild(td);
        }

        for (let x=0; x<questions.length; x++) {
            let question = questions[x];
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            for (let y=0; y<keys.length; y++) {
                let key = keys[y];
                let td = document.createElement("td");
                if (key == "state") {
                    if (question[key] == -1) td.innerText = "Skipped";
                    else if (question[key] == 0) td.innerText = "Incorrect"; //"&#x2717;";
                    else if (question[key] == 1) td.innerText = "Correct"; //"&#x2713;";
                } else if ((key == "prasna") || (key == "utharam") ) {
                    td.innerText = LipiText.text(question[key]);
                } else {
                    td.innerText =question[key];
                }
                tr.appendChild(td);
            }
        }

        let p = document.getElementById(GranthaSetup.generic_content_card_id);
        p.style.display = "";
        p.innerHTML = "";
        p.appendChild(tbl);

        

        let p1 = document.getElementById(GranthaSetup.prasna_learn_card_id);
        p1.style.display = "none";

        let x = document.getElementById(this.getConfigItem("review_button_id"));
        x.style.display = "none";
        
        

    }
}

console.log('loaded grantha.js');