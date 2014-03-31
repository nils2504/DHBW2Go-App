Parse.initialize("hDtpdjERu38kwQaINl0lXK5XEBEokQXXPYMt2SYH", "6UMsLO8HzwhZCOsRiD20PUh5uRGP9NN1SBQP4C87");
UserObj = Parse.Object.extend("User");
NewsObj = Parse.Object.extend("News");
ErrorObj = Parse.Object.extend("Errors");
PermObj = Parse.Object.extend("Permissions");
var currentUser = Parse.User.current();
var localdb = window.openDatabase("dhbw", "1.0", "DHBW2Go", 1000000);
var savedCal;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

<!-- Initalize Device Ready Functions -->
app.onDeviceReady = new function(){
}

<!-- Rest of Javascript - called by an event -->

$(document).ready(function() {
	$("#loginForm").on("submit", function(e) {
		e.preventDefault();
		$("#loginstatus").html("").removeClass("errorDiv");
		
		var user = $("#user").val();
		var password = $("#password").val();
		
		var errors = "";
        if(user === "") errors += "Benutzername falsch.<br/>";
        if(password === "") errors += "Passwort falsch.<br/>";

        if(errors !== "") {
            $("#loginstatus").html(errors).addClass("errorDiv");
            return;
        }
		 
        $("#loginstatus").html("<b>Logging in...</b>");
		
		Parse.User.logIn(user, password, {
            success:function(user) {        
				currentUser = user;
                document.location.href='index.html';
            },
            error:function(user, error) {
				$("#loginstatus").html("Fehler in der Anmeldung: "+error);
               reportError(user, "Error bei der Anmeldung","Error: " + error.code + " " + error.message);
            }
        });
	});
	$("#registerForm").on("submit", function(e) {
		e.preventDefault();
		var user = $("#user").val();
		var password = $("#password").val();
		var email = $("#mail").val();		
		var stuv = false;
		if(email == "stuv@dhbw-loerrach.de"){
		stuv = true;
		}
		var newUser = new UserObj();
		newUser.save({
			username: user,
			password: password,
			email: email
		}, {
				success: function(permAgain) {
				  alert("Du bist nun registriert!");				  
				  var perm = new PermObj();
				  perm.save({
					UserObject: newUser.id,
					allowedEvent: stuv,
					allowedAdmin: stuv
				  }, {
					success: function(permAgain) {
						window.location = "index.html";
					},
					error: function(permAgain, error) {
					}
				  });
				},
				error: function(permAgain, error) {
				  alert("Failed!");
				}
		});
	});
	$("#newsForm").on("submit", function(e) {
		e.preventDefault();
		
		var User = Parse.Object.extend("Permissions");
		var query = new Parse.Query(User);
		query.equalTo("UserObject", currentUser.id);
		query.find({
			success: function(results) {
				
					if(results[0].get('allowedEvent')){
						var header = $("#header").val();
						var uhr = $("#uhr").val();
						var ort = $("#uhr").val();
						var date = $("#date").val();
						var price = $("#price").val();
						var special = $("#special").val();
						var beschreibung = $("#beschreibung").val();
						var linktofb = $("#linktofb").val();
						
						var newNews = new NewsObj();
						newNews.save(
								{
									header:header,
									uhr:uhr,
									ort:ort,
									date:date,
									price:price,
									special:special,
									beschreibung:beschreibung,
									linktofb:linktofb
								},{
									success:function(object) {
										document.location.href='news.html';
										queryNews();
									},
									error:function(model, error) {
										
									}
								});
						}
						else{
							alert("Keine Berechtigung ein Event anzulegen");
							}
					},
					error: function(error) {
						reportError(currentUser.id, "Error bei der Funktion newsForm.on(submit)","Error: " + error.code + " " + error.message);
					}
				});
	 });
  
});		


function queryNews() {
var News = Parse.Object.extend("News");
var query = new Parse.Query(News);
query.find({
  success: function(results) {	  
    for (var i = 0; i < results.length; i++) {
      var object = results[i];

	  var dd = new Date();
	  <!-- 1 Tag länger darf die News drinnen sein, daher wird der heutige Tag um eins zurückgesetzt-->
	  ddt = dd.getDate();
	  if(ddt < 10){
		ddt = "0"+ddt; 		  
	  }
	  ddm = dd.getMonth()+1;
	  if(ddm < 10){
		ddm = "0"+ddm;  
	  }
	  ddy = dd.getFullYear();
	  var edd = object.get('date');
	  var edda = edd.split("-");
	  var eddt = edda[2];
	  var eddm = edda[1];
	  var eddy = edda[0];
	  if(ddy > eddy){
		  object.destroy();
		  object = null;
		  
	  }	  
	  else if(ddy == eddy){		 
		  if(ddm > eddm){
		  	object.destroy();
		  	object = null;		  
		  }
		  else if(ddm == eddm){	
			  	if(ddt > eddt){
					object.destroy();
					object = null;
			  }
		  }
	  }
	  if(object != null){
      var div = document.getElementById('newsContent');
      var newInf = document.createElement("DIV");
      var headLine = document.createElement("DIV");
      var body = document.createElement("DIV");
      var headerP = document.createElement("H3");
      var dateP = document.createElement("H4");
		      
      if(i%2 != 0){      
      	newInf.setAttribute("class", "event gray");
      }
      else{
      newInf.setAttribute("class", "event");
      }
      headLine.setAttribute("class", "headLine");
      body.setAttribute("class", "body");
      
      newInf.setAttribute("onclick", "queryNewsDetail('"+object.id+"')");
	  
	  datum= eddt+'.'+eddm+'.'+eddy;
      var header = document.createTextNode(object.get('header'));
      var date = document.createTextNode('Datum: '+datum);
      var uhr = document.createTextNode('Wann: '+object.get('uhr'));
      var ort = document.createTextNode('Wo: '+object.get('ort'));
      var price = document.createTextNode('Eintritt: '+object.get('price'));
      headerP.appendChild(header);
      dateP.appendChild(date);
      body.appendChild(uhr);
      body.appendChild(document.createElement("BR"));
      body.appendChild(ort);
      body.appendChild(document.createElement("BR"));
      body.appendChild(price);
      headLine.appendChild(headerP);
      headLine.appendChild(dateP);
      
      newInf.appendChild(headLine);
      newInf.appendChild(body);
      div.appendChild(newInf);
    }
	}
  },
  error: function(error) {
    reportError(currentUser.id, "Error bei der Funktion queryNews","Error: " + error.code + " " + error.message);
  }
});
<!--- Button zum Hinzufügen von Events hinzufügen -->
var perm = Parse.Object.extend("Permissions");
var query = new Parse.Query(perm);
query.equalTo("UserObject", currentUser.id);
query.find({
  		success: function(results) {			
			var u = results[0];
			var allowed = u.get('allowedEvent');
			if(allowed){
			document.getElementById('eventAdd').style.display = "block";	
			}
		},
		error:function(model, error) {
		errorMsg.innerHTML = 'Passwort erfolgreich ge&auml;ndert';
		}
					
		
	});
}

function queryNewsDetail(x) {

var News = Parse.Object.extend("News");
var query = new Parse.Query(News);
query.equalTo("objectId", x);
query.find({
  success: function(results) {
  document.getElementById('newsContentDetail').style.display = 'block';
  document.getElementById('newsContentDetail').innerHTML = '';
  document.getElementById('newsContent').style.display = "none";
  document.getElementById('eventHBut').style.display = "block";
  
    for (var i = 0; i < results.length; i++) {
      var object = results[i];
      var div = document.getElementById('newsContentDetail');
      var beschr = document.createElement("DIV");
      var infos = document.createElement("DIV");
      var but = document.createElement("Button");
      var butFb = document.createElement("Button");
	  var head = document.getElementById('eventHtext');
	
      beschr.setAttribute("class", "beschr");
      infos.setAttribute("class", "infos gray");
      
	  but.innerHTML = "In den Kalender importieren";
	  but.setAttribute("class","btn btn-block btn-primary");  
	  but.setAttribute("onclick","newsInCal('"+object.get('header')+"','"+object.get('date')+"','"+object.get('uhr')+"','"+object.get('ort')+"','"+object.get('beschreibung')+"')");
	  
	  butFb.innerHTML = "Event auf Facebook";
	  butFb.setAttribute("class","fbevent span12");
	  butFb.setAttribute("onclick","document.location.href='"+object.get('linktofb')+"'");
	  var spanFb = document.createElement("SPAN");
	  spanFb.setAttribute("class","glyphicon glyphicon-arrow-right");
	  butFb.appendChild(spanFb);
	  but.setAttribute("class","btn btn-block btn-primary");  
	  but.setAttribute("onclick","newsInCal('"+object.get('header')+"','"+object.get('date')+"','"+object.get('uhr')+"','"+object.get('ort')+"','"+object.get('beschreibung')+"')");
      
      head.innerHTML = object.get('header')+' - Details';
      
      var beschrText = document.createTextNode(object.get('beschreibung'));
      var beschrH4 = document.createElement("H4");
      beschrH4.appendChild(document.createTextNode('Beschreibung'));
      beschr.appendChild(beschrH4);
      beschr.appendChild(beschrText);
      
      var infoH4 = document.createElement("H4");
      infoH4.appendChild(document.createTextNode('Informationen'));
      infos.appendChild(infoH4);
      infos.appendChild(document.createTextNode('Datum: '+object.get('date')));
      infos.appendChild(document.createElement("BR"));
      infos.appendChild(document.createTextNode('Uhrzeit: '+object.get('uhr')));
      infos.appendChild(document.createElement("BR"));
      infos.appendChild(document.createTextNode('Ort: '+object.get('ort')));
      infos.appendChild(document.createElement("BR"));
      infos.appendChild(document.createTextNode('Eintritt: '+object.get('price')));
      infos.appendChild(document.createElement("BR"));
      infos.appendChild(document.createTextNode('Special: '+object.get('special')));
      
            
      div.appendChild(beschr);
      div.appendChild(infos);
      div.appendChild(butFb);
      //div.appendChild(but);  comming soon
    }
  },
  error: function(error) {
    reportError(currentUser, "Error bei der Funktion queryNewsDetails","Error: " + error.code + " " + error.message);
  }
});
}


//Wrapper for alert so I can dynamically use PhoneGap alert's on device
function doAlert(str,cb) {
	if(cb) cb();
}

function loadProfil(){
	var User = Parse.Object.extend("User");
	var query = new Parse.Query(User);
	query.equalTo("objectId", Parse.User.current().id);
	query.find({
  		success: function(results) {			
			var u = results[0];
			var profil = document.getElementById("profilDiv");
			var p = document.createElement("H5");
			p.setAttribute('style','font-size:2em; line-height:44px;');
			
			
			p.appendChild(document.createTextNode('Username: '+u.getUsername()));
			p.appendChild(document.createElement("BR"));
			p.appendChild(document.createTextNode('Kurs: '+u.get('class')));
			p.appendChild(document.createElement("BR"));
			p.appendChild(document.createTextNode('E-Mail: '+u.get('email')));
			p.appendChild(document.createElement("BR"));
			
			profil.appendChild(p);
			var perm = Parse.Object.extend("Permissions");
			var q = new Parse.Query(perm);
			q.equalTo("UserObject", Parse.User.current().id);
			q.find({
				success: function(results) {			
					var u = results[0].get("allowedAdmin");
					if(u){		
						document.getElementById('addNewUser').style.display = "block";
					}
				},
				error: function(e){
				}
			});
			
		
	},
  	error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
  });
}
function changePw(){
	var user = currentUser.getUsername();
	
	var pwa = document.getElementById('pwa').value;
	var pwn = document.getElementById('pwn').value;
	var pwn2 = document.getElementById('pwn2').value;
	var errorMsg =document.getElementById('errorMsg');
				
	Parse.User.logIn(currentUser.getUsername(), pwa, {
            success:function(user) {	
				if(pwn == pwn2){  			
				currentUser.save(
				{
					password:pwn
				},{
					success:function(object) {
						errorMsg.innerHTML = 'Passwort erfolgreich geÃ¤ndert';
					},
					error:function(model, error) {
						errorMsg.innerHTML = 'Passwort erfolgreich geÃ¤ndert';
					}
				});
								
				}
				else{errorMsg.innerHTML = 'Die neuen PasswÃ¶rter stimmen nicht Ã¼berein'}
							
            },
            error:function(user, error) {
                errorMsg.innerHTML = 'Das alte Passwort ist inkorrekt';
            }
        });
	
}
function forgetPw(){
	 Parse.User.requestPasswordResetInBackground("nils.rhode04@gmail.com",
     new function() {alert("AHA");}
     );
}
	
function errorCB(err) {
		  alert("Error processing SQL: "+err.code);
}
function errorQB(err) {
		  alert("Error Query SQL: "+err.code);
}



function inoutauto(){
	if(currentUser == null)
	{
		document.getElementById('in').src = "img/login.jpg";
		document.getElementById('ina').setAttribute("href","login.html");
		
	}
	else{	
		document.getElementById('in').src = "img/profil.jpg";
		document.getElementById('ina').setAttribute("href","profil.html");
		var elems = document.getElementsByClassName('loginr');
		for(var i = 0; i<elems.length;i++){
			elems[i].setAttribute("onclick","");
			var elemimg = elems[i].getElementsByTagName('img')[0];
			var id = elemimg.getAttribute("id");
			elems[i].setAttribute("href",id+".html");	
			elemimg.src = "img/"+id+".jpg";	
		}
	}
	
}

function downloadIcs(){
var fileTransfer = new FileTransfer();
alert("FileTransfer l&auml;uft");
var uri = encodeURI("https://webmail.dhbw-loerrach.de/owa/calendar/kal-wse11b@dhbw-loerrach.de/Kalender/calendar.ics");
var filepath="www/";
fileTransfer.download(
    uri,
    filePath,
    function(entry) {
        alert("download complete: " + entry.fullPath);
    },
    function(error) {
        alert("download error source " + error.source);
        alert("download error target " + error.target);
        alert("upload error code" + error.code);
    },
    false,
    {
        headers: {
            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
        }
    }
);
}
function goOut(){
	
		currentUser = null;
		Parse.User.logOut();
		document.location.href="index.html";
		
}
function testError(){
	reportError(currentUser.id, "Error bei der Erstellung von...", "AHASHDASIDASIDZA");
}
function reportError(user,erb,error){
		var newError = new ErrorObj;
		newError.save(
				{
					uid:user,
					ErrorBeschr:erb,
					ErrorText:error
				},{
					success:function(object) {	
					},
					error:function(model, error) {
					}
				});	
}
function saveCal(){
	localdb.transaction(createCalTable);
}
function createCalTable(tx){
	var kurs = $("#kurs option:selected").text();		
	var kal = $("#kurs option:selected").val();	
	tx.executeSql('DROP TABLE IF EXISTS cal');	
	tx.executeSql('CREATE TABLE IF NOT EXISTS cal (id INTEGER PRIMARY KEY AUTOINCREMENT, kurs VARCHAR(50), kal VARCHAR(50))');
	tx.executeSql('INSERT INTO cal (id, kurs, kal) VALUES (1,"'+kurs+'","'+kal+'")');
	
}
function getCal(){
   		localdb.transaction(getTableCal);
}
function getTableCal(tx){
	tx.executeSql('SELECT * FROM cal',[], queryCalSucess, queryCalError);
}
function queryCalError(){
	showSelectCal(1);
}
function queryCalSucess(tx, results) {
	var sk;
	var len = results.rows.length;
	if(len == 1){
		savedCal =results.rows.item(0).kal;
		sk =results.rows.item(0).kurs;
		choosedCal(savedCal);
	}
	var sel = document.getElementById('kurs');
	var option = document.createElement("option");
	option.text = sk;
	option.value = savedCal;
	sel.appendChild(option);
	showSelectCal(0);
}
function addNewUser(x){
	document.getElementById('regnew').style.display = "block";
	x.innerHTML = "User anlegen";
	x.setAttribute("onclick","addNewUserFinally()");
}
function addNewUserFinally(){
var uo = "";
var email = $("#email").val();
var User = Parse.Object.extend("User");
var query = new Parse.Query(User);
query.equalTo("email", email);
query.find({
  		success: function(results) {
			uo = results[0].id;
			setPerm(uo);
		},
		error : function(e){
			alert("Diese Email Adresse ist nicht registriert");
		}
					
		
	});
				
}
function setPerm(x){
	var ad = $("#admin").prop("checked");
	var ev = $("#event").prop("checked");
	
	var perm = Parse.Object.extend("Permissions");
	var query = new Parse.Query(perm);
	
	query.equalTo("UserObject",x);
	query.find({
		success: function(object) {			
			object[0].set("allowedEvent",ev);
			object[0].set("allowedAdmin",ad);
			object[0].save();
			alert("Berechtigungen hinzugefügt!");
		  	document.getElementById('email').innerHTML = "";
		  	document.getElementById('regnew').style.display = "none";
		  	document.getElementById('addNewUser').innerHTML = "Neuen Benutzer berechtigen";
		},
		error: function(error){
		}
	});
}