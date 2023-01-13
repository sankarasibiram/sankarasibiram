var app_display = null;

class Base {
    constructor() {
        this.config = {};
        this.data = {}
    }

    get_data_item(item) {
        let tree_items = item.split(".");
        let cur = this.data;
        for (let x=0; x<tree_items.length; x++) {  
            if(Object.keys(cur).includes(tree_items[x])) {
                cur = cur[tree_items[x]];
            } else {
                console.log(tree_items[x] + " not found in the object " + item);
                return null;
            }
        }
        //return this.data[item];
        return cur;
    }

    set_data_item(item, value) {
        this.data[item] = value;  
    }

    get_config_item(item) {
        let tree_items = item.split(".");
        let cur = this.config;
        //alert(Object.keys(cur))
        for (let x=0; x<tree_items.length; x++) {  
            if(Object.keys(cur).includes(tree_items[x])) {
                cur = cur[tree_items[x]];
            } else {
                console.log(tree_items[x] + " not found in the object " + item);
                return null;
            }
        }
        //return this.data[item];
        return cur;
    }

    set_config_item(item, value) {
        this.config[item] = value;  
    }

    load_json_file(file_location) {
        try {
            let d = jsonResponseForGET(file_location);
            return d;
        } catch (err) {
            console.log("Error loading file " + file_location);
            return false;
        }
    }
}

class Grantha extends Base {

    /*
        data: grantha
    */
    
    constructor(file_location) {
        super();
        
        this.config = {};
        this.data = {}
        if (file_location) {
            this.grantha_location = file_location; 
            this.load_grantha();
        }
    }

    static get_grantha_object(file_loc) {
        
        let mygrantha = null;
        let content = jsonResponseForGET(file_loc);
        let type = content["grantha_type"]

        if(type) {
            if (type == "prasnottara"){
                mygrantha = new PrasnottharaGrantha();
            } else if (type == "stotra") {
                mygrantha = new Grantha();
            }
        }
        mygrantha.grantha_location = file_loc;
        mygrantha.set_data_item("grantha", content);
        mygrantha.initialize();
        return mygrantha;
    }

    initialize() {

    }

    load_grantha() {
        this.set_data_item("grantha", this.load_json_file(this.grantha_location) );
    }

    get_grantha() {return this.get_data_item("grantha");}

    getGranthaName() {
        return this.get_grantha().grantha;
    }

    getGranthaKartha() {
        //let g = JSON.stringify(this.get_grantha());
        return this.get_grantha().grantha_kartha;
    }

    getGranthaType() {
        let g = this.get_data_item("grantha");
        return g.grantha_type;
    }

    getSlokaCount() {
        return this.get_grantha().slokas.length;
    }

    getSlokaNumbers() {
        let slokas = this.get_grantha().slokas;
        let arr = new Array();
        for(let i=0; i<slokas.length; i++) {
            arr.push(parseInt(slokas[i].sloka_number));
        }
        return arr.sort(function (a, b) {  return a - b;  });
    }

    getSloka(sloka_number) {
        let slokas = this.get_grantha().slokas;
        let sloka_to_return = null;
        for(let i=0; i<slokas.length; i++) {
            if (slokas[i].sloka_number == sloka_number) sloka_to_return = slokas[i];
        }
        if (sloka_to_return) {

            ["sloka", "sloka_with_student"].forEach( ele => {
                let mediafile = this.getMediaFilesForID(sloka_number, ele);
                if (mediafile != null ) sloka_to_return[(ele+"_audio_file")] = mediafile;
            });
            
            return sloka_to_return;
        }

        throw new Error("Invalid sloka requested.")
    }

    getMediaFilesForID(id, type) {
        let audio = this.get_grantha().audio_files;
        let str = audio.folder;
        let a_sl = null;
        if (! this.getSlokaNumbers().includes(id)) return null;

        if (type == "sloka") a_sl = audio.slokas;
        else if(type == "sloka_with_student") a_sl = audio.slokas_with_student;
        //else if(type == "question") a_sl = audio.questions;
        //else if(type == "answer") a_sl = audio.answers;

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

    getGranthaMeaningsConfig() {
        let g = this.get_data_item("grantha");
        if (Object.keys(g).includes("meaning")) return g.meaning;
        else return null;
        
    }

    getMeaningForSloka(lang, sloka_id) {
        let langs = this.getGranthaMeaningsConfig();
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

class PrasnottharaGrantha extends Grantha {
    
    /*
        data -> prasnas
    */
    constructor(file_location) {
        super(file_location);
        if (file_location) {
            if (this.getGranthaType() != "prasnottara") throw "This is not a prasnottara type of grantha.";
            this.loadPrasnasInGrantha();
        }
    }
    
    initialize() {
        this.loadPrasnasInGrantha();
    }

    loadPrasnasInGrantha() {
        let reqfile = this.get_grantha().prasna_uttaras_only_file;
        let mydata = jsonResponseForGET(reqfile);
        this.set_data_item("prasnas", mydata);
        return mydata;
    }

    get_prasnas() {
        return this.get_data_item("prasnas");
    }

    getPrasnaCount() {
        return this.get_prasnas().length;
    }

    getPrasna(prasna_number) {
        let prasnas = this.get_prasnas();
        let prasna_to_return = null;

        for(let i=0; i<prasnas.length; i++) {
            if (parseInt(prasnas[i].question_number) == prasna_number) {
                let k = prasnas[i];
                prasna_to_return = k;
                break;
            }
        }
        let q_audio = this.getMediaFilesForID(prasna_to_return.question_number, "question");
        let ans_audio = this.getMediaFilesForID(prasna_to_return.question_number, "answer");
        prasna_to_return["question_audio"] = q_audio;
        prasna_to_return["answer_audio"] = ans_audio;
        return prasna_to_return;

        throw ("Prasna " + prasna_number + " not available.");
    }

    getUttaram(prasna_number) {
        let answer = {};
        let pr = this.getPrasna(prasna_number);
        let q = pr.prasna;
        answer.utharam = pr.utharam;
        answer.other_utharams = [];
        let prasnas = this.get_prasnas();
        for (let x=0; x<prasnas.length; x++) {
            if ( (parseInt(prasnas[x].question_number) != prasna_number) && (prasnas[x].prasna == pr.prasna)) {
                answer.other_utharams.push(prasnas[x]);
            }
        }
        return answer;
    }

    getUttaramWithPrasnaNumber(prasna_number) {
        let answer = {};
        let pr = this.getPrasna(prasna_number);
        let q = pr.prasna;
        answer.utharams = [(prasna_number + ": " + pr.utharam)];
        //answer.other_utharams = [];
        let prasnas = this.get_prasnas();
        for (let x=0; x<prasnas.length; x++) {
            if ( (parseInt(prasnas[x].question_number) != prasna_number) && (prasnas[x].prasna == pr.prasna)) {
                answer.utharams.push(x+": "+prasnas[x].utharam);
            }
        }
        return answer.utharams;
    }

    getPrasnaNumbers() {
        let prasnas = this.get_prasnas();
        let arr = new Array();
        for(let i=0; i<prasnas.length; i++) {
            arr.push(parseInt(prasnas[i].question_number));
        }

        return arr.sort(function (a, b) {  return a - b;  });
    }

    getMediaFilesForID(id, type) {
        let audio = this.get_grantha().audio_files;
        let str = audio.folder;
        let a_sl = null;
        

        //if (type == "sloka") return super.getMediaFilesForID(id, type); //a_sl = audio.slokas;
        //else if(type == "sloka_with_student") a_sl = audio.slokas_with_student;
        
        if(type == "question") a_sl = audio.questions;
        else if(type == "answer") a_sl = audio.answers;
        else return super.getMediaFilesForID(id, type);

        if (! this.getPrasnaNumbers().includes(id)) return null;
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

}

class PracticeTest extends Base{

    constructor() {
        super();
        this.set_data_item("question_bank", []);
        this.set_data_item("questions_asked", []);
        this.set_data_item("test_type", "oral");
    }

    static startPracticeTest(test_required) {
        // Expect test_type (multiple-choice, oral), test_source (auto-generated, test-file), file_location,
        // grantha_object
        // time-limit, question-count ?? ()
        //alert("297: " + Object.keys(test_required));
        let test_type, test_source, file_location = "";
        let grantha = null;
        let keys = Object.keys(test_required);
        let required_keys = ["test_type","test_source","file_location","grantha"]
        required_keys.forEach(rk => {
            if (! keys.includes(rk)) console.log("Generating test: " + rk + " not received. This may cause issues with test.")
            else console.log("Generating test: " + rk + " received. Value is " + test_required[rk]);
        });

        if(keys.includes("test_type")) test_type = test_required["test_type"];
        if(keys.includes("test_source")) test_source = test_required["test_source"];
        if(keys.includes("file_location")) file_location = test_required["file_location"];
        if(keys.includes("grantha")) grantha = test_required["grantha"];

        //alert("306: test_type: " + test_type + ": test_source: "+questions_type+":"+file_location+ (test_type =="multiple-choice" ));
        let test_to_use = null;

        if (test_type == "multiple-choice") test_to_use = new PracticeTestMultipleChoice();
        else if (test_type == "oral") test_to_use = new PracticeTestOral();
        
        if (test_source == "auto-generated") test_to_use.set_questions_from_grantha(grantha, test_type);
        else if (test_source == "test-file") test_to_use.set_questions_from_file(file_location);

        //alert("319: " + JSON.stringify(test_to_use))
        if (test_to_use) return test_to_use;
        else throw "Could not generate test.";
    }

    set_unique_ids(ids) {
        this.set_data_item("ids", ids);
        this.set_data_item("asked_ids", []);
    }

    get_unique_ids(count) {

        let ids = this.get_data_item("ids");
        let asked_ids = new Array();
        for (let x=0; ((asked_ids.length<count) && (x<1000)); x++) {
            let range = ids.length;
            let n = Math.floor(Math.random() * range) ;
            if(asked_ids.includes(ids[n])) continue;
            let selectedId = ids[n];
            asked_ids.push(selectedId);
        }
        return asked_ids;  
    }

    select_unique_id() {
        let ids = this.get_data_item("ids");
        let asked_ids = this.get_data_item("asked_ids");
        let curids = []; //ids.filter(x => !asked_ids.includes(x));
        for (let x=0; x<ids.length; x++) if (! asked_ids.includes(ids[x])) curids.push(ids[x]);
        let range = curids.length;
        let n = Math.floor(Math.random() * range) ;
        let selectedId = curids[n];
        asked_ids.push(selectedId);
        this.set_data_item("asked_ids", asked_ids);
        return selectedId;        
    }

    shuffle_array(arr) {
        let cur_arr = [];
        let new_arr = [];
        let len = arr.length;
        arr.forEach(ele => cur_arr.push(ele));

        for(let x=0; x<len; x++ ) {
            let n = Math.floor(Math.random() * cur_arr.length) ;
            //alert("x is " + x + "; " + n + " of " + cur_arr.length + " new array length: " + new_arr.length);
            new_arr.push(cur_arr[n]);
            cur_arr.splice(n,1);   
        };
        return new_arr;
    }

    set_answers(answers) {

    }

    generated_question() {
        let question = {};
        let g = this.get_data_item("grantha")
        let q_id = this.select_unique_id();
        //alert("380: disable next line" );
        //q_id = 18;
        let p = g.getPrasna(q_id);
        let u = g.getUttaram(q_id);
        //alert(JSON.stringify(g.getUttaram(q_id)))
        let q_audio = g.getMediaFilesForID(q_id, "question");
        let a_audio ="";

        let a_audio_tmp = [];
        
        a_audio_tmp.push(g.getMediaFilesForID(q_id, "answer"));
        if(u.other_utharams.length >0) u.other_utharams.forEach(e => {
            a_audio_tmp.push(g.getMediaFilesForID(e["question_number"], "answer"))
        });
        a_audio = a_audio_tmp.join(",");
        
        
        let option_vals = [];
        question["question"] = p.prasna;
        option_vals.push(p.utharam);

        let option_ids = this.get_unique_ids(7);
        try {
            for (let z=0; z<option_ids.length; z++) {
                let myid = option_ids[z];
                let u = g.getPrasna(myid).utharam;
                if (option_vals.includes(u)) continue;
                if (option_vals.length <5) option_vals.push(u);
            }
            //option_ids.forEach(myid => option_vals.push(g.getPrasna(myid).utharam));
        } catch (err) {console.log("Error in selecting answers");}
        
        question["options"] = this.shuffle_array(option_vals);

        question["correct_answer"] = [p.utharam]; 
        question["all_answers_for_question"] = g.getUttaramWithPrasnaNumber(q_id);
        
        if(u.other_utharams.length >0) u.other_utharams.forEach(e => {question["correct_answer"].push(e.utharam)});
        question["options_type"] = "radio";
        let answers_found_count = 0;
        if (question.correct_answer.length>1) {
            question.correct_answer.forEach(ans => {
                if(question["options"].includes(ans)) answers_found_count = answers_found_count+1
            });
        }
        if(q_audio) question["question_audio"] = q_audio;
        if(a_audio) question["answer_audio"] = a_audio;
        if (answers_found_count>1) question["options_type"] = "checkbox";
        // alert(JSON.stringify(question) + ": 374 : " + question);
        return question;
    }    

    get_question() {
        //alert((this.get_data_item("test_type")))
        let question = null;
        if(this.get_data_item("test_type") == "multiple-choice") question = this.get_multiple_choice_question();
        if(this.get_data_item("test_type") == "oral") question = this.get_oral_question();
        
        console.log(JSON.stringify(question));

        return question;
    }
    
    get_oral_question() {
        let random = this.select_unique_id();

        let qb= this.get_data_item("question_bank");
        let question_arr = this.get_data_item("questions_asked");

        let q = qb[parseInt(random)];
        
        q["id"] = "QAuto_" + (question_arr.length+1);
        question_arr.push(q);

        let q_to_send = JSON.parse(JSON.stringify(q));

        console.log(q_to_send);
        console.log(q);
        return q_to_send;
    }

    get_multiple_choice_question() {
        let random = this.select_unique_id();

        let qb= this.get_data_item("question_bank");
        let question_arr = this.get_data_item("questions_asked");

        let q = qb[parseInt(random)];
        //alert("310: " + JSON.stringify(q))
        q["id"] = "QAuto_" + (question_arr.length+1);
        question_arr.push(q);

        let q_to_send = JSON.parse(JSON.stringify(q));

        delete q_to_send.correct_answer;
        console.log(q_to_send);
        console.log(q);
        return q_to_send;
    }

    multiple_choice_question_response() {
        alert('PracticeTest: multiple_choice_question_response: not implemented')
    }
    
    get_multiple_questions(count) {
        let  arr = [];
        for (let x=0; x< count; x++) {
            //arr.push(this.get_multiple_choice_question());
            let obj = this.get_question();
            if(obj != null) arr.push(obj);
        }
        //alert("539: " + JSON.stringify(arr));
        console.log("540: IDs chosen are " + this.get_data_item("asked_ids") );
        return arr;
    }

}

class PracticeTestMultipleChoice extends PracticeTest {
    constructor(prasnottaragrantha_object) {
        super();
        this.set_data_item("test_type", "multiple-choice");
    }

    set_questions_from_grantha(prasnottaragrantha_object, test_type) {
        //alert("486: " + prasnottaragrantha_object)
        this.set_data_item("grantha", prasnottaragrantha_object);
        this.set_unique_ids(prasnottaragrantha_object.getPrasnaNumbers());
        this.set_config_item("generate-from-grantha", true);
        this.get_multiple_choice_question = function() {return this.get_auto_generated_multiple_choice_question();}
    }

    set_questions_from_file(file_loc) {
        let myquestions = this.load_json_file(file_loc);
        let qb = myquestions["questions"];

        // Ensure there are only 5 options and they include the correct options
        for (let x=0; x<qb.length; x++) {
            
            let correct = qb[x]["correct_answer"];
            let options = qb[x]["options"];
            let opt1 = this.shuffle_array(options);
            
            let new_options = [];
            for (let y=0; y<correct.length; y++) new_options.push(correct[y]);
            for (let y=0; y<opt1.length; y++) {                
                if ( (new_options.length < 5) && (! new_options.includes(opt1[y])) ) new_options.push(opt1[y]);
            }

            qb[x]["options"] = this.shuffle_array(new_options).slice(0,5);

            let answers_found_count = 0;
            let question = qb[x];
            if (question.correct_answer.length>1) {
                question.correct_answer.forEach(ans => {
                    if(question["options"].includes(ans)) answers_found_count = answers_found_count+1
                });
            }
            //if(q_audio) question["question_audio"] = q_audio;
            //if(a_audio) question["answer_audio"] = a_audio;
            if (answers_found_count>1) qb[x]["options_type"] = "checkbox";
            else qb[x]["options_type"] = "radio";
                      
        }

        //alert(JSON.stringify(myquestions["questions"]));
        
        this.set_data_item("question_bank", qb);
        //alert("587: " + JSON.stringify(qb))
        let id_arr = []
        for(let x=0;x<myquestions.questions.length;x++) id_arr.push(x);
        this.set_unique_ids(id_arr);
        this.set_data_item("test_type", myquestions["type"]);
        this.set_config_item("generate-from-grantha", false);
    }



    get_auto_generated_multiple_choice_question() {
        
        let q = this.generated_question();
        let question_arr = this.get_data_item("questions_asked");
        //alert("420: " + question_arr.length)
        q["id"] = "QAuto_" + (question_arr.length+1);
        question_arr.push(q);

        let q_to_send = JSON.parse(JSON.stringify(q));
        
        delete q_to_send.correct_answer;
        console.log("440: " + q_to_send);
        console.log(q);
        return q_to_send;
    }

    set_answers(answers) {
        this.multiple_choice_question_response(answers);
        return this.get_data_item("questions_asked");
    }

    multiple_choice_question_response(answers) {
        let question_arr = this.get_data_item("questions_asked");
        for (let x=0; x<answers.length; x++) {
            let marked_options = null;
            if ( (Object.keys(answers[x]).includes("marked-options")) ) 
                marked_options = answers[x]["marked-options"];

            let question = null;
            for (let y=0; y<question_arr.length;y++) {
                if(answers[x].id == question_arr[y].id) {
                    question = question_arr[y]; break;
                }
            }

            let answers_given = [];
            let state = "Correct";
            if (marked_options) {
                for (let y=0; y<marked_options.length; y++) {
                    answers_given.push(question["options"][marked_options[y]]);
                }
            }
            question["answers_given"] = answers_given;

            
            


            for(let y=0; y<answers_given.length; y++) {
                if(! question["correct_answer"].includes(answers_given[y])) state = "Incorrect";
            }

            let options = question["options"];
            for(let y=0; y<options.length; y++) {
                let this_option = options[y];
                let this_state = "Correct";
                if (question["correct_answer"].includes(this_option)) {
                    if (! answers_given.includes(this_option)) {state = "Incorrect"; this_state = "Incorrect"}
                } else {
                    if (answers_given.includes(this_option)) {state = "Incorrect"; this_state = "Incorrect"}
                }
                //alert("661: " + this_state + " Testing " + this_option + " against " + options);
            } 

            if (answers_given.length == 0) state = "Unanswered";
            question["state"] = state;
            question["marked-options"] = marked_options;
            //alert("672: " + JSON.stringify(question));

        }
        //alert("483: " + question_arr.length);
    }
}

class PracticeTestOral extends PracticeTest {
    constructor() {
        super();
        this.set_data_item("test_type", "oral");
    }

    set_questions_from_grantha(prasnottaragrantha_object, test_type) {
        this.set_data_item("grantha", prasnottaragrantha_object);
        this.set_unique_ids(prasnottaragrantha_object.getPrasnaNumbers());
        this.set_config_item("generate-from-grantha", true);
        this.get_oral_question = function() {return this.get_auto_generated_oral_question();}
    }

    get_auto_generated_oral_question() {
        
        let q = this.generated_question();
        let question_arr = this.get_data_item("questions_asked");
        //alert("420: " + question_arr.length)
        q["id"] = "QAuto_" + (question_arr.length+1);
        question_arr.push(q);

        let q_to_send = JSON.parse(JSON.stringify(q));
        
        //delete q_to_send.correct_answer;
        if (Object.keys(q_to_send).includes("options")) delete q_to_send.options;
        if (Object.keys(q_to_send).includes("all_answers_for_question")) {
            q_to_send["correct_answer"] = q_to_send["all_answers_for_question"];
            delete q_to_send.all_answers_for_question;
        }
        console.log("440: " + q_to_send);
        console.log(q);
        return q_to_send;
    }

    set_questions_from_file(file_loc) {
        let myquestions = this.load_json_file(file_loc);
        let qb = myquestions["questions"];

        this.set_data_item("question_bank", qb);

        let id_arr = []
        for(let x=0;x<myquestions.questions.length;x++) id_arr.push(x);
        this.set_unique_ids(id_arr);
        this.set_data_item("test_type", myquestions["type"]);
        this.set_config_item("generate-from-grantha", false);
        //alert(JSON.stringify(this.get_data_item("question_bank")));
    }    
}

class BaseDisplay extends Base {
    constructor() {
        super();
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

    set_test_object(obj) {
        this.set_data_item("test-object", obj);
    }

    set_display_config(config_element) {

        let full_config = app_display.getDisplayConfig();
        
        if(Object.keys(full_config).includes(config_element)) {
            let cfg = full_config[config_element];
            let arr = ["buttons","display-divs","states","other-elements"];
            for (let x=0; x<arr.length; x++) {
                if (Object.keys(cfg).includes(arr[x])) {
                    this.set_config_item(arr[x], cfg[arr[x]]);
                } else {
                    this.set_config_item[arr[x]] = [];
                }
            }
        }
    }

    turn_all_display_off() {
        let all_display_divs = this.get_config_item("display-divs");
        let all_buttons = this.get_config_item("buttons");
        all_display_divs.forEach(d => setVisibilityState(d.id, false));
        all_buttons.forEach(d => setVisibilityState(d.id, false));
    }

    _get_element(name) {
       
       let e = document.getElementById(this._get_button_id(name));
       if (e) return e;
       e = document.getElementById(this._get_div_id(name));
       if (e) return e;       
       e = document.getElementById(this._get_id(name));
       if (e) return e;  
       e = document.getElementById(name);
       if (e) return e;         
       console.log(name + " element was not found.")
       return null;
    }

    _get_id(name) {
        let items = ["buttons", "display-divs", "other-elements"]
        for (let a=0; a<items.length; a++) {
            let eles = this.get_config_item(items[a]);
            if (!eles) continue;
            for(let x=0; x<eles.length; x++) {
                let e = eles[x];
                if(e["name"] == name) return e["id"];
            };            
        }

        return null;
    }

    _get_button_id(name) {
        let all_buttons = this.get_config_item("buttons");
        if(! all_buttons) return null;
        for(let x=0; x<all_buttons.length; x++) {
            let e = all_buttons[x];
            if(e["name"] == name) return e["id"];
        };
        return null;
    }

    _get_div_id(name) {
        let all_display_divs = this.get_config_item("display-divs");
        if (!all_display_divs) return null;
        for(let x=0; x<all_display_divs.length; x++) {
            let e = all_display_divs[x];
            if(e["name"] == name) return e["id"];
        };
        return null;
    }    

    set_state(state) {
        let all_display_divs = this.get_config_item("display-divs");
        let all_buttons = this.get_config_item("buttons");
        this.turn_all_display_off();
        let states = this.get_config_item("states")
        console.log(state + ": States available: " + JSON.stringify(states));
        let curstate = null;

        states.forEach(s => {if (s.state == state) curstate = s;});
        if (curstate == null) {
            console.log("setting state " + state + " was not found.");
                //throw "Error occured."
        }
        let eles = []
        
        if (curstate["displayed-buttons"].length >0) curstate["displayed-buttons"].forEach(e => {eles.push(this._get_button_id(e));});
        if (curstate["displayed-divs"].length >0) curstate["displayed-divs"].forEach(e => {eles.push(this._get_div_id(e));});

        //alert("Will be enabled: " + eles); 

        setVisibilityState(eles, true);
        let that = this;
        this._get_element("start-button").onclick = function() {that.start_test()}
        this._get_element("submit-button").onclick = function() {that.submit_test()}
        this._get_element("review-button").onclick = function() {that.review_test()}
        this._get_element("next-button").onclick = function() {that.show_new_item("next")}
        this._get_element("previous-button").onclick = function() {that.show_new_item("previous")}
        this._get_element("select-item-button").onchange = function() {that.show_new_item("select")}

        // Enable elements
        if (Object.keys(curstate).includes("enable_elements")) {
            let arr = curstate["enable_elements"];
            if (arr.length >0 ) arr.forEach(e => {setActiveState(this._get_id(e), true)});
        }
            
        if (Object.keys(curstate).includes("disable_elements")) {
            let arr = curstate["disable_elements"];
            if (arr.length >0 ) arr.forEach(e => {
                setActiveState(this._get_id(e), false)});
        }      

    }
}

class PracticeTestDisplay extends BaseDisplay {

    constructor() {
        super();
        //this.set_config_item("max-question-count", 3);
        //this.set_config_item("display_state", "test");
    }

    static getPracticeTestDisplay(test_object, test_type) {
        let p = null;
        if (test_type == "multiple-choice")  p = new PracticeTestMultipleChoiceDisplay();
        if (test_type == "oral")  p = new PracticeTestOralDisplay();
        //alert("900: " + JSON.stringify(test_object));
        if(p) p.set_test_object(test_object);
    }

    get_current_question() {
        let questions = this.get_data_item("questions");
        let cur_index = this.get_data_item("displayed-question-index"); 
        return questions[cur_index];       
    }

    show_new_item(val) {
        
        let that = this;
        let cur_index = this.get_data_item("displayed-question-index");
        let sele_el = this._get_element("select-item-button");

        if (val == "next") that.set_data_item("displayed-question-index", (cur_index+1) );
        else if (val == "previous") that.set_data_item("displayed-question-index", (cur_index - 1) );
        else if (val == "select") that.set_data_item("displayed-question-index", sele_el.selectedIndex );
        if(sele_el) sele_el.selectedIndex = this.get_data_item("displayed-question-index");

        that.show_item();
    }
     
    show_item() {
        //alert('here')
        let display_state = this.get_config_item("display_state");

        let questions = this.get_data_item("questions");
        if (display_state == "review") questions = this.get_data_item("questions");
        this.get_config_item("display_state", "test");
        //alert( "709: " + JSON.stringify(questions))

        let cur_index = this.get_data_item("displayed-question-index");

        let next = this._get_element("next-button");
        let prev = this._get_element("previous-button");
        let submit = this._get_element("submit-button");

        if (cur_index == 0) {prev.disabled = true;}
        else prev.disabled = false;

        if (cur_index == (questions.length-1)) {next.disabled = true;}
        else {next.disabled = false;}

        if (this.get_data_item("answered-question-index").length == questions.length) submit.disabled=false;
        else submit.disabled=true;

        let myq = questions[cur_index];

        let q_div = this._get_element("question-div");
        lipiText(q_div, (myq["question"].replace("?","") + " ? "));

        //this.show_multiple_choice_options(myq, display_state);

        this.set_info();

    }

    show_multiple_choice_options(myq, display_state) {
        //let myq = questions[cur_index];
        let marked_options = [];
        if (Object.keys(myq).includes("marked-options")) marked_options = myq["marked-options"];

        //let q_div = this._get_element("question-div");
        //lipiText(q_div, (myq["question"].replace("?","") + " ?"));
        //q_div.innerText = myq["question"];
        //this.set_info();

        let o_div = this._get_element("practice-multiple-choice-options-div");
        o_div.innerText = "";
        

        let root = document.createElement("div");
        o_div.appendChild(root);
        //alert("994: " + JSON.stringify(myq));
        for (let x=0; x<myq["options"].length; x++) {
            
            let divele = document.createElement("div");
            divele.classList.add("option-div");
            root.appendChild(divele);
            /*
            divele.onclick = function() {
                let inputs = this.children;
                for (let d=0; d<inputs.length; d++) {
                    if(inputs[d].name == "multi-answer") {
                        let mychkbox = inputs[d];
                        if(mychkbox.checked) mychkbox.checked = false;
                        else mychkbox.checked = true;
                        that.mark_answer();
                    }
                }
            }
            */

            let option_type = myq["options_type"];
            if(option_type == null) option_type = "radio";
            let chkboxid = "multi-answer-" + x;
            let e = document.createElement("input");
            e.setAttribute("name", "multi-answer");
            e.setAttribute("type", option_type);
            e.id = chkboxid;
 
            e.classList.add("form-check-input", "mb-2");
            let mytext = myq["options"][x]; 
            e.value = mytext;
            divele.appendChild(e);
            if (marked_options.includes(x)) e.checked = true;
            let that = this;

            e.onclick = function() {that.mark_answer();}

            let s = document.createElement("label");
            s.setAttribute("style", "padding-left: 15px;"); 
            s.setAttribute("for",chkboxid);        
            divele.appendChild(s);
            lipiText(s, mytext);

            if (display_state == "review") {
                e.disabled = true;
                let symb = document.createElement("span");
                
                symb.style = "margin-left: 15px;"
                if(myq["correct_answer"].includes(mytext))  symb.innerHTML = correct_symbol;
                else if (e.checked) symb.innerHTML = incorrect_symbol;
                divele.appendChild(symb);
            }
            
        }
    }

    mark_answer(index) {
    
        let questions = this.get_data_item("questions");
        let cur_index = this.get_data_item("displayed-question-index");
        

        let options = document.getElementsByName("multi-answer");
        let marked_vals = [];

        for (let x=0; x<options.length; x++) {
            if (options[x].checked) marked_vals.push(x);
        }

        if (marked_vals.length > 0) {
            questions[cur_index]["marked-options"] = marked_vals;
            let answers_available = this.get_data_item("answered-question-index");
            if (! answers_available.includes(cur_index)) answers_available.push(cur_index);
        } else {
            questions[cur_index]["marked-options"] = [];
            let answers_available = this.get_data_item("answered-question-index");
            if(answers_available.includes(cur_index)) {
                answers_available.splice(answers_available.indexOf(cur_index),1);
            }        
        }
        this.set_info();        
    }

    set_review_info(info_div_id) {

        let questions = this.get_data_item("questions");

        let cur_index = this.get_data_item("displayed-question-index"); 
        let correct_answers = 0;
        let incorrect_answers = 0;
        let skipped_answers = 0;
        let unanswered_answers = 0;

        let cur_question_state = "Unknown";
        let symbols = {"Correct": "&#x2705;", "Incorrect": "&#x274C;", "Skipped": "Skipped", "Unanswered":"&#x1F914;"};
        let info = "";

        for (let x=0; x<questions.length; x++) {
            let q = questions[x];
            //alert(JSON.stringify(q))
            if (! Object.keys(q).includes("state")) q["state"] = "Unanswered";

            if (q["state"] == "Correct") correct_answers++;
            else if (q["state"] == "Incorrect") incorrect_answers++;
            else if (q["state"] == "Skipped") skipped_answers++;
            else if (q["state"] == "Unanswered") unanswered_answers++;
            
            if(x == cur_index) cur_question_state = q["state"];
        }

        let symbol_to_include = symbols[cur_question_state];
        if (symbol_to_include == null) symbol_to_include = cur_question_state;

        info = "<b>" + symbols[cur_question_state] + "</b> प्रश्नक्रमः " + (cur_index + 1) + " [प्रश्नाः " + questions.length + "] ";
        info += "(उत्तराणि साधु: " + correct_answers + " असाधु: " + incorrect_answers;
        info += " न सूचितम्: " + unanswered_answers + ")";

        //let info_div = this._get_element("info-div");
        let info_div = this._get_element(info_div_id);
        lipiText(info_div,info);
        //info_div.classList.add("multi-lipi");              
    }

    set_test_info(info_div_id) {
        //alert('here')
        let questions = this.get_data_item("questions");
        let cur_index = this.get_data_item("displayed-question-index");
        let submit = this._get_element("submit-button");

        if (this.get_data_item("answered-question-index").length == questions.length) {
            submit.style.display="";
            submit.disabled = false;
        } else submit.style.display="none";

        //let info_div = this._get_element("info-div");
        let info_div = this._get_element(info_div_id);

        // Set information
        info_div.innerHTML = "";
        let info_text = "Question " + (cur_index+1) + " of " + questions.length;
        info_text += ". " + this.get_data_item("answered-question-index").length + " answered so far.";
        info_div.innerHTML = info_text;        
    }
    
    set_info() {
        let infodiv = "info-div";
        if ( this.get_config_item("test_type") == "multiple-choice") infodiv = "practice-multiple-choice-info-div";

        if (this.get_config_item("display_state") == "test") this.set_test_info(infodiv);
        if (this.get_config_item("display_state") == "review") this.set_review_info(infodiv);
    }

    start_test() {        
        this.set_config_item("max-question-count", parseInt(this._get_element("max-questions").value));
        this.set_config_item("max-time", parseInt(this._get_element("max-time").value));
        let cnt = this.get_config_item("max-question-count");
        //alert("1103: " + JSON.stringify(this.data));
        let myq = this.get_data_item("test-object").get_multiple_questions(cnt);
        this.set_data_item("questions", myq)
        this.set_data_item("displayed-question-index", 0);
        this.set_data_item("answered-question-index", []);
        //this.set_state("on-practice-test-start");
        //alert('1127 here');
        let sele_el = this._get_element("select-item-button");
        sele_el.innerHTML = ""; // remove existing options.
        let questions = this.get_data_item("questions");
        for(let x=0; x<questions.length; x++) {
            let opEle = document.createElement("option");
            opEle.value = x;
            opEle.innerText = (x+1);
            sele_el.appendChild(opEle);
        }
        this.startTimer();
    }

    submit_test() {

    }

    startTimer() {
        let that =  this;
        
        let timecheckFunc = function(a) {that.timeCheck(a);}
        let onexpiryFunc = function() {that.timeExpired();}

        let t = new Timer(onexpiryFunc, "timer" );
        this.set_data_item("timer", t);
        t.set_function("function_on_timecheck", timecheckFunc );
        t.startTimer(this.get_config_item("max-time"));
    }

    review_test() {
        //alert("review")
        let newstate = "on-practice-test-review";
        if ( this.get_config_item("test_type") == "multiple-choice") newstate = "on-practice-multiple-choice-test-review";
        this.set_data_item("displayed-question-index", 0);
        this.set_config_item("display_state", "review");
        this.set_state(newstate);
        this.show_item();

    }

    timeCheck(remaining_time) {
        //alert('here ' + remaining_time);
        /*
        if(remaining_time < 15) {
            let submit = this._get_element("submit-button");
            submit.style.display = ""; 
            submit.style.disabled = false;    
        }
        */
    }

    timeExpired() {
       alert('Time expired. Submit test');
       let eles = document.getElementsByName("multi-answer");
       setVisibilityState(
        [
            this._get_element("next-button"), this._get_element("previous-button"),this._get_element("select-item-button")
        ], false
       );

       eles.forEach(e => e.disabled = true);
       this._get_element("submit-button").disabled = false;
       this._get_element("submit-button").style.display = ""; 
    }
}

class PracticeTestMultipleChoiceDisplay extends PracticeTestDisplay {
    
    constructor() {
        super();
        this.set_display_config("my_app_display");
        this.set_config_item("display_state", "test");        
        this.set_config_item("test_type", "multiple-choice");
        this.set_state("on-practice-multiple-choice-test-open");
    }
    

    show_item() {
        //alert('here')
        //super.show_item();

        let display_state = this.get_config_item("display_state");
        let questions = this.get_data_item("questions");
        let cur_index = this.get_data_item("displayed-question-index");
        let myq = questions[cur_index];

        let next = this._get_element("next-button");
        let prev = this._get_element("previous-button");
        let submit = this._get_element("submit-button");

        if (cur_index == 0) {prev.disabled = true;}
        else prev.disabled = false;

        if (cur_index == (questions.length-1)) {next.disabled = true;}
        else {next.disabled = false;}

        if (this.get_data_item("answered-question-index").length == questions.length) submit.disabled=false;
        else submit.disabled=true;


        let q_div = this._get_element("practice-multiple-choice-question-div");
        lipiText(q_div, (myq["question"].replace("?","") + " ? "));

        this.show_multiple_choice_options(myq, display_state);
        this.set_info();

    }

    start_test() {
        this.set_state("on-practice-multiple-choice-test-start");
        super.start_test();
        this.show_item();
    }

    submit_test() {
        let test_object = this.get_data_item("test-object")
        let questions = this.get_data_item("questions");
        
        let submit_object = [];

        for (let x=0; x<questions.length; x++) {
            let q = questions[x];
            let o = [];
            if (Object.keys(q).includes("marked-options")) o = q["marked-options"];
            let ans_object = {"id": q["id"], "marked-options": o, "time_taken": 0};
            submit_object.push(ans_object);
        }

        this.get_data_item("timer").stopTimer();
        
        let review = test_object.set_answers(submit_object);
        this.set_data_item("questions", review);
        this.set_state("on-practice-test-submit");
        this.review_test();
    }    
}

class PracticeTestOralDisplay extends PracticeTestDisplay {
    
    constructor() {
        super();
        this.set_display_config("my_app_display");        
        this.set_config_item("display_state", "test");        
        this.set_config_item("test_type", "oral");
        this.set_state("on-practice-oral-test-open");
    };


    show_item() {
        //alert('here')
        super.show_item();

        let display_state = this.get_config_item("display_state");

        let questions = this.get_data_item("questions");
        let cur_index = this.get_data_item("displayed-question-index");

        let myq = questions[cur_index];
        let answers_available = this.get_data_item("answered-question-index");

        if ((answers_available) && (answers_available.includes((cur_index)))) {
            this._get_element("correct-button").disabled = true;
            this._get_element("incorrect-button").disabled = true;
        } else {
            this._get_element("correct-button").disabled = false;
            this._get_element("incorrect-button").disabled = false;            
        }

        //alert("1046: " + JSON.stringify(myq));
        let answers = myq["correct_answer"];
        let answerDiv = this._get_element("answer-div");
        answerDiv.innerHTML = "";
        let a_audio_div = this._get_element("answer-audio-div");
        a_audio_div.innerHTML = "";

        setVisibilityState([answerDiv, a_audio_div], false);

        for (let x=0; x<answers.length; x++) {
            let ansEle = document.createElement("div");
            lipiText(ansEle, answers[x]);
            answerDiv.appendChild(ansEle);
        }

        // show audio elements
        let q_audio_div = this._get_element("question-audio-div");
        q_audio_div.innerHTML = "";
        let q_audio_ele = document.createElement("Audio");
        let ans_audio_ele = document.createElement("Audio");

        setVisibilityState([q_audio_div], true);
        
        let previously_shown = false;


        if ( (Object.keys(myq)).includes("previously_shown") ) previously_shown = myq["previously_shown"];
        else myq["previously_shown"] = true;


        if ( Object.keys(myq).includes("question_audio") ) {
            let s1 = myq["question_audio"];
            let s1Ele = q_audio_ele;
            s1Ele.preload = "";
            if(! previously_shown) s1Ele.autoplay = true;
            s1Ele.controls = true;
            s1Ele.setAttribute("src", s1);
            q_audio_div.appendChild(s1Ele); 
            s1Ele.classList.add("app-audio")
        }

        if ( Object.keys(myq).includes("answer_audio") ) {
            let s1 = myq["answer_audio"];
            let s2 = [];
            if (s1) s2 = s1.split(",");
            let s1Ele = ans_audio_ele;
            s1Ele.preload = ""; 
            s1Ele.autoplay = false;
            s1Ele.controls = true; 
            s1Ele.classList.add("app-audio");
            
            let se = document.createElement("source")
            se.setAttribute("src", s2[0]);
            s1Ele.appendChild(se);
            a_audio_div.appendChild(s1Ele); 
        }

        if (this.get_config_item("display_state") == "review") {
            if(q_audio_ele) q_audio_ele.autoplay = false;
            setVisibilityState([answerDiv,a_audio_div], true);
            setVisibilityState([this._get_element("correct-button"), this._get_element("incorrect-button")], false)
        } 
        //this.show_multiple_choice_options(myq, display_state);
    }

    set_state(state) {
        super.set_state(state);
        let that = this;
        let cur_index = this.get_data_item("displayed-question-index");
        let answers_available = this.get_data_item("answered-question-index");
        let enable = true;
        //alert("1325: " + JSON.stringify(this.config));
        this._get_element("correct-button").onclick = function() {that.question_answered("correct")}
        this._get_element("incorrect-button").onclick = function() {that.question_answered("incorrect")}
        this._get_element("show-answer-button").onclick = function() {that.show_answer();}
    }

    get_oral_question() {
        alert("to be implemented .. in oral");
    }

    mark_answer(index) {
        let questions = this.get_data_item("questions");
        let cur_index = this.get_data_item("displayed-question-index");
        
        let answers_available = this.get_data_item("answered-question-index");
        if (! answers_available.includes(cur_index)) answers_available.push(cur_index);
        else {alert("Already answered!")}
        
        this.set_info();

        if (answers_available.length == questions.length) {
            setVisibilityState(this._get_element("submit-button"), true);
            this._get_element("submit-button").disabled = false;
        }

        if (! ((cur_index+1) == questions.length) ) this.show_new_item("next");
        else {this.show_item();}
    }    
    
    question_answered(marked) {
        let q = this.get_current_question();
        if (marked == "correct") {
            q["marked-options"] = [0]; 
            q["state"] = "Correct"
        } else if (marked == "incorrect") {
            q["marked-options"] = [1]; 
            q["state"] = "Incorrect"
        } else {
            return;
        }
        this.mark_answer();
        
    }

    show_answer() {
        let answerDiv = this._get_element("answer-div");
        let answerAudioDiv = this._get_element("answer-audio-div");
        setVisibilityState([answerDiv, answerAudioDiv], true);
    }

    start_test() {
        this.set_state("on-practice-oral-test-start");
        super.start_test();
        this.show_item();
    }

    submit_test() {
        let test_object = this.get_data_item("test-object")
        let questions = this.get_data_item("questions");
        this.get_data_item("timer").stopTimer();
        
        //this.set_data_item("questions", review);
        this.set_state("on-practice-test-submit");
        //this.set_state("on-practice-test-review");
        this.review_test();
    }

    timeExpired() {
        alert('Time expired. Submit test');
        let eles = document.getElementsByName("multi-answer");
        setVisibilityState(
            [
                this._get_element("next-button"), this._get_element("previous-button"),this._get_element("select-item-button"),
                this._get_element("correct-button"), this._get_element("incorrect-button"),this._get_element("show-answer-button")
            ], false
        );
        /*
        this._get_element("next-button").disabled = true;
        this._get_element("previous-button").disabled = true;
        this._get_element("select-item-button").disabled = true;
        this._get_element("correct-button").disabled = true;
        this._get_element("incorrect-button").disabled = true;
        */
        eles.forEach(e => e.disabled = true);
        this._get_element("submit-button").disabled = false;
        this._get_element("submit-button").style.display = ""; 
     }
}

class ApplicationSetup extends BaseDisplay {
    // Needs to setup grantha_config_file, lipi_selection_element_id, grantha_selection_element_id, open_book_button_id;
    // display_config, homepage
    constructor (cfg) {
        super();
        let keys = Object.keys(cfg);
        keys.forEach(e => this.set_config_item(e, cfg[e]));
        let required_keys = ["grantha_config_file", "lipi_selection_element_id", "grantha_selection_element_id", 
        "open_book_button_id", "main_menu_learn_id", "main_menu_practice_id", "display_config_file", "homepage"];
        required_keys.forEach(k => {if(! keys.includes(k)) throw "Required parameter " + k + " not received."});
        this.setup();
        //set this up as a global variable
        app_display = this;
    }

    setup() {
        let file_loc = this.get_config_item("grantha_config_file")
        this.set_data_item("granthas", jsonResponseForGET(file_loc));
        this.setLipiSelectionOptions();
        this.setGranthaSelectionOptions();
        this.set_data_item("open_grantha", null);
        let btnid = this.get_config_item("open_book_button_id");
        let that = this;
        document.getElementById(btnid).onclick = function() {that.get_grantha();} 
        this.setupNavbarMenus()      
        //this.open_grantha_location = null;
    }

    init_for_new_grantha() {
        let learnAnchor = this._get_element( this.get_config_item("main_menu_learn_id"));
        let learn_submenu_id = "submenu-"+learnAnchor.id;
        this._get_element(learn_submenu_id).innerHTML = "";

        let practiceAnchor = this._get_element( this.get_config_item("main_menu_practice_id"));
        let practice_submenu_id = "submenu-" + practiceAnchor.id;
        this._get_element(practice_submenu_id).innerHTML = "";        
    }

    addNavbarMenu(menu_name, id, display_text, func) {
        try {
                let main_anchor = null;
                if (menu_name == "learn") {
                    main_anchor = this._get_element( this.get_config_item("main_menu_learn_id"));
                } else if ((menu_name == "practice")) {
                    main_anchor = this._get_element( this.get_config_item("main_menu_practice_id"));
                }

                let submenu_id = "submenu-"+main_anchor.id;
                let submenu = this._get_element(submenu_id);

                let liEle = document.createElement("LI");
                let anchor = document.createElement("anchor");
                submenu.appendChild(liEle);
                liEle.appendChild(anchor); 
                anchor.setAttribute("href", "#");
                
                anchor.onclick = func;
                anchor.classList.add("dropdown-item");
                liEle.id = id;
                lipiText(anchor, display_text);
                this.setupNavbarMenus();
            } catch(err) {alert(err);}
    }

    setupNavbarMenus() {
        let learnAnchor = this._get_element( this.get_config_item("main_menu_learn_id"));
        let practiceAnchor = this._get_element( this.get_config_item("main_menu_practice_id"));

        let nav_anchor_array = [learnAnchor, practiceAnchor];
        for (let x=0; x<nav_anchor_array.length; x++) {
            let anch = nav_anchor_array[x]
            let submenu_id = "submenu-"+anch.id;
            let submenu = document.getElementById(submenu_id);
            if (submenu) {
                if (submenu.children.length > 0) {
                    anch.style.display = ""
                } else {
                    anch.style.display = "none"
                }
            }
        }  
    }

    setLipiSelectionOptions() {
        let sEle = this._get_element( this.get_config_item("lipi_selection_element_id"));
        
        let lipis = this.get_data_item("granthas")["lipi"]; //grantha_setup.lipi;
        for (let i=0; i<lipis.length; i++) {
            let oEle = document.createElement("option");
            oEle.value = lipis[i].name;
            oEle.text = lipis[i].display;
            sEle.appendChild(oEle);
        }
        Lipi.set_lipi_element(sEle.id);
	}

    setGranthaSelectionOptions() {
        let sEle = this._get_element( this.get_config_item("grantha_selection_element_id"));
        let cur_grantha = sEle.value;
        let granthas = this.get_data_item("granthas")["granthas"];
        sEle.innerHTML = "";
        for (let i=0; i<granthas.length; i++) {
            let oEle = document.createElement("option");
            oEle.value = granthas[i].name;
            lipiText(oEle,granthas[i].name);
            if (cur_grantha == oEle.value) oEle.selected = true;
            sEle.appendChild(oEle);
        }
        let that = this;
        sEle.onchange = function(){that.check_grantha_changes();}        
    }

    check_grantha_changes() {
        //alert("Grantha change");
        let that = this;
        let btnid = this.get_config_item("open_book_button_id");
        let sEle = this._get_element( this.get_config_item("grantha_selection_element_id"));
        let cur_grantha = this.get_data_item("open_grantha");
        document.getElementById(btnid).onclick = function() {that.get_grantha();}
        if ((cur_grantha == null) || (cur_grantha != sEle.value)) {
            document.getElementById(btnid).disabled = false;
        } else {
            document.getElementById(btnid).disabled = true;
        }
    }

    get_grantha() {

        let sEle = this._get_element( this.get_config_item("grantha_selection_element_id"));
        let required_grantha = sEle.value;
        //alert("getting " + required_grantha)
        let file_loc = null;
        let granthas = this.get_data_item("granthas")["granthas"];
        for (let i=0; i<granthas.length; i++) {
            if (required_grantha == granthas[i].name) {
                file_loc = granthas[i]["file_location"];
                break;
            }
        }

        try {
            if (file_loc) {
                let content = jsonResponseForGET(file_loc);
                if (content) {
                    this.set_data_item("open_grantha", required_grantha);
                    let mygrantha = Grantha.get_grantha_object(file_loc);
                    this.init_for_new_grantha()
                    this.set_data_item("grantha", mygrantha);
                    let disp = GranthaDisplay.initGranthaDisplay(mygrantha);
                    disp.initialize();
                    document.getElementById(this.get_config_item("open_book_button_id")).disabled = true;
                }
                
                //this.check_grantha_changes();
                //alert(JSON.stringify(this.get_data_item("open_grantha_content")))
                //return this.get_data_item("open_grantha_content");
            }
        } catch(err) {
            console.log("Error loading grantha ")
        }
    }

    getDisplayConfig() {
        let disp_file = this.get_config_item("display_config_file");
        let disp_config = this.get_data_item("display_configuration");
        if (disp_config == null) {
            disp_config = jsonResponseForGET(disp_file);
            this.set_data_item("display_configuration", disp_config);
        }
        return disp_config;
    }

    show_card(mydiv) {
        let dispconfig = this.getDisplayConfig();
        let divs = dispconfig["high_lelel_divs"]
        for (let x=0; x<divs.length; x++) if (divs[x] != mydiv) document.getElementById(divs[x]).style.display = "none";
        let staticdiv = this.get_config_item("static_page_div");
        //if(staticdiv != mydiv) staticdiv.innerHTML = "";
        document.getElementById(mydiv).style.display = "";
        Lipi.change_lipi()
    }

    home() {
        let pg = this.get_config_item("homepage");
        let mydiv = this.get_config_item("static_page_div");
        this.show_static_page(pg);
    }

    show_static_page(page_location) { 
        let div_id_to_show = (this.get_config_item("static_page_div"));     
        includeHTML(div_id_to_show, page_location);
        this.show_card(div_id_to_show);
    }

}

class GranthaDisplay extends BaseDisplay {
    constructor() {
        super();
        this.set_display_config("my_app_display");
        this.set_config_item("display_state", "learn-sloka");
    }

    static initGranthaDisplay(grantha) {
        let disp = null;
        if (grantha.getGranthaType() == "stotra") disp = new GranthaDisplay();
        else if (grantha.getGranthaType() == "prasnottara") disp = new PrasnottaraGranthaDisplay();
        disp.set_data_item("grantha", grantha);

        return disp;
    }

    get_grantha() {
        return this.get_data_item("grantha");
    }

    initialize() {

        try {
            let that = this;
            // Add learn slokas menu item.
            let text = "श्लोकाः";
            let anchor_id = "learn_slokas_anchor"
            let func = function() {that.learnSlokas();}
            let func2 = function(a) {that.practiceTest(a);}
            app_display.addNavbarMenu("learn", anchor_id, text, func); 

            let practice_tests = this.get_grantha().get_data_item("grantha.practice_tests");
            if(practice_tests == null) practice_tests = [];
            
            for (let x=0; x<practice_tests.length; x++) {
                let thisobj = practice_tests[x];
                let n = practice_tests[x]["name"];

                app_display.addNavbarMenu("practice", ("practice_test_" + x), n, function(){func2(thisobj)});
            }
            
            if (Object.keys(this.get_grantha().get_data_item("grantha"))) { 
                let intro_pg = this.get_grantha().get_data_item("grantha.intro_file");
                app_display.show_static_page(this.get_grantha().get_data_item("grantha.intro_file"));
            }
        } catch(err) {
            console.log("GranthaDisplay: initialize: " + err);
        }
        
    }

    enable_grantha_display() {
        app_display.show_card("grantha-card");
        let titlediv = document.getElementById("grantha-title");
        if(titlediv) titlediv.innerHTML = this.get_data_item("grantha.data.grantha.grantha");
    }

    learnSlokas() {
        this.set_data_item("learn-type", "sloka");
        this.setup_grantha_card();
        this.enable_grantha_display();
        //alert("OK. We will learn slokas.")
    }
    
    practiceTest(test_obj) {
        //alert(JSON.stringify(test_obj) + " will be started.")
        let cfg = {};

        let type = test_obj["type"];
        let source = test_obj["source"];
        //let test_type = test_obj["test_type"];

        cfg["grantha"] = this.get_data_item("grantha");
        cfg["test_source"] = source;
        cfg["test_type"] = type;
        if(Object.keys(test_obj).includes("file_location")) cfg["file_location"] = test_obj["file_location"];
        //alert(JSON.stringify(cfg));
        //let multi_cfg = {"grantha":p,"questions_type": "auto-generated","test_type":"multiple-choice"}
        this.enable_grantha_display();
        let p1 = PracticeTest.startPracticeTest(cfg);
        let d = PracticeTestDisplay.getPracticeTestDisplay(p1, type);

        if (Object.keys(test_obj).includes("max_questions")) {
            document.getElementById("practice-max-questions").max = test_obj.max_questions;
            document.getElementById("practice-max-questions").value = test_obj.max_questions;
        }
        
        let func_questions = function() {
            let val = parseInt(document.getElementById("practice-max-questions").value);
            let max = parseInt(document.getElementById("practice-max-questions").max);
            let submitbtn = document.getElementById("submit-response-btn");

            if ( (val > max) ) {
                alert("Can't set value to greater than " + max);
                document.getElementById("practice-max-questions").value = max;
            } else if (val < 1) {
                document.getElementById("practice-max-questions").value = 1;
            }
        }
        document.getElementById("practice-max-questions").onchange = func_questions;

        if (Object.keys(test_obj).includes("max_time")) {
            document.getElementById("practice-max-time").max = test_obj.max_time * 60;
            document.getElementById("practice-max-time").value = test_obj.max_time * 60;
        }
        
        let func_time = function() {
            let val = parseInt(document.getElementById("practice-max-time").value);
            let max = parseInt(document.getElementById("practice-max-time").max);
            let submitbtn = document.getElementById("submit-response-btn");

            if ( (val > max) ) {
                alert("Can't set value to greater than " + max);
                document.getElementById("practice-max-time").value = max;
            } else if (val < 1) {
                document.getElementById("practice-max-time").value = 10;
            }
        }
        document.getElementById("practice-max-time").onchange = func_time;
        //alert("1573: " + JSON.stringify(p1));
        
    }

    set_item_list() {
        let myg = this.get_grantha();
        let item_list = myg.getSlokaNumbers();
        this.set_data_item("item_list", item_list);
    }

    initialize_state() {
        this.set_state("learn-sloka");
    }


    setSlokaAnvaya() {
        let anvayadiv = this._get_element("learn-sloka-anvaya-div");
        let chkbox = this._get_element("sloka-anvaya-chkbox");
        if(chkbox.checked) {
            anvayadiv.style.display = "";
        } else {
            anvayadiv.style.display = "none";
        }
    }

    setMeaningOptions() {
        let meanings = this.get_grantha().getGranthaMeaningsConfig();
        
        let chkbox = this._get_element("select-meaning-chkbox");

        let sEle = this._get_element("select-meaning-lang");
        sEle.onchange = function() {that.setSlokaMeaning();};
        let curval = sEle.selected;

        sEle.innerHTML = "";
        
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

        let chkbox = this._get_element("select-meaning-chkbox");
        let meaningdiv = this._get_element("learn-sloka-meaning-div");
        let sEle = this._get_element("select-meaning-lang");

        if (! chkbox.checked) {
            meaningdiv.style.display = "none";
            sEle.style.display = "none";
            return;
        }
        sEle.style.display = ""
        let lang = sEle.value;
        let sloka_number = (this.get_data_item("item_list"))[this.get_data_item("displayed-question-index")];

               
        let t = this.get_grantha().getMeaningForSloka(lang, sloka_number);
        meaningdiv.style.display = "";
        meaningdiv.innerHTML = "";
        for (let x=0; x<t.length; x++) {
            let d = document.createElement("text");
            d.innerText = t[x];
            meaningdiv.appendChild(d);
            meaningdiv.appendChild(document.createElement("BR"));
        }
    }

    setSlokaToLearnAudio(_sloka) {
        let that = this;

        let s1, s2 = null;
        if (Object.keys(_sloka).includes("sloka_audio_file")) s1=_sloka["sloka_audio_file"]
        if (Object.keys(_sloka).includes("sloka_with_student_audio_file")) s2=_sloka["sloka_with_student_audio_file"]
        let chkbox = document.getElementById("sloka-audio-checkbox");
        chkbox.disabled = false;
        let sloka_span = document.getElementById("sloka-audio");
        let sloka_stud_span = document.getElementById("sloka-with-student-audio");
        let auto_play = false;
        let autoEle = this._get_element("select-autoplay-chkbox");
        if(autoEle) auto_play = autoEle.checked;

        sloka_span.innerHTML = "";
        sloka_stud_span.innerHTML = "";


        let autoplayFunction = function() {
            let autoplayElement = document.getElementById("select-autoplay-chkbox");
            if (autoplayElement == null) return;
            if (autoplayElement.checked) {
                that.show_new_item("next");
            }            
        }
        

        let s1Ele = null; // for sloka
        let s2Ele = null; // for with student

        if (s1) {          
            s1Ele = document.createElement("Audio"); 
            s1Ele.id = "sloka_audio_element"; 
            s1Ele.preload = "none";
            s1Ele.controls = true;
            s1Ele.setAttribute("src", s1);            
            sloka_span.appendChild(s1Ele);
            s1Ele.classList.add("app-audio"); 
            s1Ele.addEventListener("ended", autoplayFunction );           
        } else {
            if (s2) chkbox.checked = true;
            chkbox.disabled = true;                
        }
        //alert(s1E.parentElement.innerHTML)

        if (s2) {            
            s2Ele = document.createElement("Audio");
            s2Ele.id = "sloka_with_student_audio_element";
            s2Ele.preload = "none";
            s2Ele.controls = true;
            s2Ele.setAttribute("src", s2);            
            sloka_stud_span.appendChild(s2Ele);
            s2Ele.classList.add("app-audio");
            s2Ele.addEventListener("ended", autoplayFunction );               
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

        
        if (auto_play) {
            if (chkbox.checked) {
                if (s2Ele) {
                    s2Ele.preload = true; 
                    s2Ele.autoplay = true;
                } 
            } else  {
                if (s1Ele) {
                    s1Ele.preload = true; 
                    s1Ele.autoplay = true;
                } 
            } 
        }

        let autoplayOncheck = function() {
            let e1 = document.getElementById("sloka_audio_element"); 
            let e2 = document.getElementById("sloka_with_student_audio_element");
            let autoply_chkbox =  document.getElementById("select-autoplay-chkbox");
            let checked = false;
            if(autoply_chkbox) checked = autoply_chkbox.checked;
            if (! checked) return;

            let isAudioPlaying = false;
            if (e1) {
                if (!e1.paused && !e1.ended && 0 < e1.currentTime) isAudioPlaying = true;
            }
            if (e2) {
                if (!e2.paused && !e2.ended && 0 < e2.currentTime) isAudioPlaying = true;
            }

            if (! isAudioPlaying) that.setSlokaToLearnAudio(_sloka);
            //else alert ("Sloka audio is already playing: " + isAudioPlaying );
        }

        if(autoEle) autoEle.onclick = autoplayOncheck;

        chkbox.onclick = function() {that.setSlokaToLearnAudio(_sloka);}
    }

    setup_grantha_card() {
        this.initialize_state();
        this.set_item_list();
        let selEl = this._get_element("select-item-button");
        selEl.innerHTML = "";
        let item_list = this.get_data_item("item_list");
        for(let x=0; x<item_list.length; x++) {
            let opEle = document.createElement("option");
            opEle.value = x;
            opEle.innerText = item_list[x];
            selEl.appendChild(opEle);
        }
        this.set_data_item("displayed-question-index", 0);
        this.show_item();

        let that = this;
        let chkbox = this._get_element("sloka-anvaya-chkbox");
        chkbox.onchange = function(){that.setSlokaAnvaya()};
        //alert("1676: " + JSON.stringify(myg))

       this.setMeaningOptions();
    }

    show_new_item(val) {
        let that = this;
        let cur_index = this.get_data_item("displayed-question-index");
        let sele_el = this._get_element("select-item-button");

        if (val == "next") that.set_data_item("displayed-question-index", (cur_index+1) );
        else if (val == "previous") that.set_data_item("displayed-question-index", (cur_index - 1) );
        else if (val == "select") that.set_data_item("displayed-question-index", sele_el.selectedIndex );
        if(sele_el) sele_el.selectedIndex = this.get_data_item("displayed-question-index");

        that.show_item();
    }

    show_item() {

        let cur_index = this.get_data_item("displayed-question-index");
        let item_list = this.get_data_item("item_list");

        let next = this._get_element("next-button");
        let prev = this._get_element("previous-button");
        let submit = this._get_element("submit-button");

        if (cur_index == 0) {prev.disabled = true;}
        else prev.disabled = false;

        if (cur_index == (item_list.length-1)) {next.disabled = true;}
        else {next.disabled = false;}

        let myq = this.get_grantha().getSloka(item_list[cur_index]);
        //alert("1882: " + JSON.stringify(myq));
        //let htmldiv = this.htmlForSloka(item_list[cur_index]);
        let htmldiv = this.htmlForSloka(myq);

        let sloka_div = this._get_element("learn-sloka-div");
        //alert(htmldiv.innerHTML);
        sloka_div.innerHTML = "";
        sloka_div.appendChild(htmldiv);


        let anvayadiv = this._get_element("learn-sloka-anvaya-div");
        anvayadiv.innerHTML = "";
        anvayadiv.appendChild(this.htmlForAnvaya(myq));
        this.setSlokaAnvaya();

        this._get_element("learn-sloka-meaning-div").innerHTML = "";
        this.setSlokaMeaning();
        this.setSlokaToLearnAudio(myq);

        let lbl = this._get_element("sloka_number_label");
        lbl.innerText = item_list[cur_index];
   
    }

    htmlForSloka(_sloka) {

        //let _sloka = this.grantha.getSloka(sloka_id);

        let lines = _sloka.sloka;
        let tmpSlokaDiv = document.createElement("DIV");
        tmpSlokaDiv.classList.add("SlokaText");

        let text = "";
            
        lines.forEach((myline, line_index, line_array) => {
            let _line_parts = myline.line_parts;
            //let last_class_type = "SlokaText";
            let last_class_type = "mx-2 px-2";
            _line_parts.forEach(lpart => {

                let textEl = document.createElement("span");
                //textEl.innerText = LipiText.text(lpart.text) + " ";
                //lipiText(textEl, (lpart.text + " "));
                lipiText(textEl, (lpart.text));

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
                slokaNumEl.innerText = _sloka.sloka_number + "॥"
                //slokaNumEl.classList.add(last_class_type);
                //tmpSlokaDiv.appendChild(slokaNumEl);
            }
            tmpSlokaDiv.appendChild(document.createElement("br"));
        });
        return tmpSlokaDiv;

    }

    htmlForAnvaya(_sloka) {

        //let _sloka = this.grantha.getSloka(sloka_id);
        let anvayam_unavailable = "अन्वयमलभ्यम्";

        let lines = null;
        let tmpdiv = document.createElement("span");
        if(Object.keys(_sloka).includes("anvaya")) lines = _sloka.anvaya;
        lines.forEach (myline => {
            let span = document.createElement("span");
            lipiText(span, myline);
            tmpdiv.appendChild(span);
            tmpdiv.appendChild(document.createElement("br"))
        });
        if (lines == null) {
            let span = document.createElement("span");
            lipiText(span, anvayam_unavailable);
            tmpdiv.appendChild(span);            
        }
        return tmpdiv;
    } 
}

class PrasnottaraGranthaDisplay extends GranthaDisplay {
    constructor() {
        super();
        this.set_display_config("/display_cfg.json", "my_app_display");
        this.set_config_item("display_state", "learn-prasnottara");
        //alert('initializing prasnottara')
    }

    initialize() {
        super.initialize();

        let that = this;

        // Add learn slokas menu item.
        let text = "प्रश्नोत्तराणि";
        let anchor_id = "learn_question_answer_anchor";
        let func = function() {that.learnPrasnas();}

        app_display.addNavbarMenu("learn", anchor_id, text, func); 
    }

    initialize_state() {
        let learn = this.get_data_item("learn-type");
        if (learn == "sloka") {super.initialize_state(); return;}
        this.set_state("learn-prasna");
    }

    set_item_list() {
        let learn = this.get_data_item("learn-type");
        if (learn == "sloka") {super.set_item_list(); return;}
        //alert("1726 Learn: " + learn)
        let myg = this.get_grantha();
        let item_list = myg.getPrasnaNumbers();
        this.set_data_item("item_list", item_list);
    }

    show_item() {

        let learn = this.get_data_item("learn-type");
        if (learn == "sloka") {super.show_item(); return;}
        //alert("1737 Learn: " + learn)

        let cur_index = this.get_data_item("displayed-question-index");
        let item_list = this.get_data_item("item_list");

        let next = this._get_element("next-button");
        let prev = this._get_element("previous-button");
        let submit = this._get_element("submit-button");

        if (cur_index == 0) {prev.disabled = true;}
        else prev.disabled = false;

        if (cur_index == (item_list.length-1)) {next.disabled = true;}
        else {next.disabled = false;}

        let myq = this.get_grantha().getPrasna(item_list[cur_index]);
        //alert(JSON.stringify(myq))
        let q_div = this._get_element("question-div");
        let q_a_div = this._get_element("question-audio-div");
        q_a_div.innerHTML = "";
        let ans_div = this._get_element("answer-div");
        let ans_audio_div = this._get_element("answer-audio-div");
        ans_audio_div.innerHTML = "";

        let infoDiv = this._get_element("info-div");
        let infoText = "श्लोकक्रमः " + myq.sloka_number + " प्रश्नक्रमः " + myq.question_number;
        lipiText(infoDiv, infoText);
        
        let qAudio = document.createElement("Audio");
        qAudio.src = myq["question_audio"];
        qAudio.classList.add("app-audio");
        qAudio.preload = "meta";
        qAudio.controls = true;
        
        q_a_div.appendChild(qAudio);
        
        let ansAudio = document.createElement("Audio");
        ansAudio.src = myq["answer_audio"];
        ansAudio.classList.add("app-audio");
        ansAudio.preload = "meta";
        ansAudio.controls = true;
        
        ans_audio_div.appendChild(ansAudio);

        lipiText(q_div, (myq["prasna"].replace("?","") + " ? "));
        lipiText(ans_div, (myq["utharam"].replace("।","").replace("॥","") + " । "));    
    }

    learnPrasnas() {
        this.set_data_item("learn-type", "prasna");
        this.setup_grantha_card();
        this.enable_grantha_display();
        //alert("OK. We will learn prasnas.")
    }
}



//alert('loaded')