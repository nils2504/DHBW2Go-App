Parse.initialize("hDtpdjERu38kwQaINl0lXK5XEBEokQXXPYMt2SYH", "6UMsLO8HzwhZCOsRiD20PUh5uRGP9NN1SBQP4C87");
UserObj = Parse.Object.extend("User");
NewsObj = Parse.Object.extend("News");
ErrorObj = Parse.Object.extend("Errors");
PermObj = Parse.Object.extend("Permissions");
var currentUser = Parse.User.current();
var localdb = window.openDatabase("dhbw", "1.0", "DHBW2Go", 1000000);
var savedCal;
<!-- hier wurden bisher die Objekte der Datenbank bekannt gemacht, da diese öfters verwendet werden. -->


var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

<!-- Initalize Device Ready Functions -->
app.onDeviceReady = new function () {}

<!-- Rest of Javascript - called by an event -->

// Formulare zum Login
$(document).ready(function () {
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();
        $("#loginstatus").html("").removeClass("errorDiv");

        var user = $("#user").val();
        var password = $("#password").val();

        var errors = "";
        if (user === "") errors += "Benutzername falsch.<br/>";
        if (password === "") errors += "Passwort falsch.<br/>";

        if (errors !== "") {
            $("#loginstatus").html(errors).addClass("errorDiv");
            return;
        }

        $("#loginstatus").html("<b>Logging in...</b>");

        Parse.User.logIn(user, password, {
            success: function (user) {
                currentUser = user;
                document.location.href = 'index.html';
            },
            error: function (user, error) {
                $("#loginstatus").html("Fehler in der Anmeldung: " + error);
                reportError(user, "Error bei der Anmeldung", "Error: " + error.code + " " + error.message);
            }
        });
    });
    // Formular zur Registrierung
    $("#registerForm").on("submit", function (e) {
        e.preventDefault();
        var user = $("#user").val();
        var password = $("#password").val();
        var email = $("#mail").val() + "@dhbw-loerrach.de";
        // Wenn Stuv, dann alle Berechtigungen erteilen	
        var stuv = false;
        if (email == "stuv@dhbw-loerrach.de") {
            stuv = true;
        }
        var newUser = new UserObj();
        newUser.save({
            username: user,
            password: password,
            email: email
        }, {
            success: function (permAgain) {
                alert("Du bist nun registriert!");
                var perm = new PermObj();
                perm.save({
                    UserObject: newUser.id,
                    allowedEvent: stuv,
                    allowedAdmin: stuv
                }, {
                    success: function (permAgain) {
                        window.location = "index.html";
                    },
                    error: function (permAgain, error) {}
                });
            },
            error: function (permAgain, error) {
                alert("Failed!");
            }
        });
    });
    // Neue News anlegen
    $("#newsForm").on("submit", function (e) {
        e.preventDefault();

        var User = Parse.Object.extend("Permissions");
        var query = new Parse.Query(User);
        query.equalTo("UserObject", currentUser.id);
        query.find({
            success: function (results) {

                if (results[0].get('allowedEvent')) {
                    var header = $("#header").val();
                    var uhr = $("#uhr").val();
                    var ort = $("#uhr").val();
                    var date = $("#date").val();
                    var price = $("#price").val();
                    var special = $("#special").val();
                    var beschreibung = $("#beschreibung").val();
                    var linktofb = $("#linktofb").val();

                    var newNews = new NewsObj();
                    newNews.save({
                        header: header,
                        uhr: uhr,
                        ort: ort,
                        date: date,
                        price: price,
                        special: special,
                        beschreibung: beschreibung,
                        linktofb: linktofb
                    }, {
                        success: function (object) {
                            document.location.href = 'news.html';
                            queryNews();
                        },
                        error: function (model, error) {

                        }
                    });
                } else {
                    alert("Keine Berechtigung ein Event anzulegen");
                }
            },
            error: function (error) {
                reportError(currentUser.id, "Error bei der Funktion newsForm.on(submit)", "Error: " + error.code + " " + error.message);
            }
        });
    });

});

// Hier folgen "manuell" aufgerufene Events

// Holt alle News aus der DB
function queryNews() {
    var News = Parse.Object.extend("News");
    var query = new Parse.Query(News);
    query.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
				
				// Wenn Event-Datum in der Vergangenheit liegt, wird dieses gelöscht - in der DB
                var dd = new Date();
                ddt = dd.getDate();
                if (ddt < 10) {
                    ddt = "0" + ddt;
                }
                ddm = dd.getMonth() + 1;
                if (ddm < 10) {
                    ddm = "0" + ddm;
                }
                ddy = dd.getFullYear();
                var edd = object.get('date');
                var edda = edd.split("-");
                var eddt = edda[2];
                var eddm = edda[1];
                var eddy = edda[0];
                if (ddy > eddy) {
                    object.destroy();
                    object = null;

                } else if (ddy == eddy) {
                    if (ddm > eddm) {
                        object.destroy();
                        object = null;
                    } else if (ddm == eddm) {
                        if (ddt > eddt) {
                            object.destroy();
                            object = null;
                        }
                    }
                }
				// Wenn das Objekt die vorherige Überprüfung überstanden hat
                if (object != null) {
                    var div = document.getElementById('newsContent');
                    var newInf = document.createElement("DIV");
                    var headLine = document.createElement("DIV");
                    var body = document.createElement("DIV");
                    var headerP = document.createElement("H3");
                    var dateP = document.createElement("H4");
					// jede 2te Zeile wird grau.
                    if (i % 2 != 0) {
                        newInf.setAttribute("class", "event gray");
                    } else {
                        newInf.setAttribute("class", "event");
                    }
                    headLine.setAttribute("class", "headLine");
                    body.setAttribute("class", "body");
					// Bei Onclick soll in die News-Details navigiert werden.
                    newInf.setAttribute("onclick", "queryNewsDetail('" + object.id + "')");
					
					// Hier wird ein Event zusammengestellt, dynamisch, und an den DIV-COntainer angehängt
                    datum = eddt + '.' + eddm + '.' + eddy;
                    var header = document.createTextNode(object.get('header'));
                    var date = document.createTextNode('Datum: ' + datum);
                    var uhr = document.createTextNode('Wann: ' + object.get('uhr'));
                    var ort = document.createTextNode('Wo: ' + object.get('ort'));
                    var price = document.createTextNode('Eintritt: ' + object.get('price'));
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
        error: function (error) {
            reportError(currentUser.id, "Error bei der Funktion queryNews", "Error: " + error.code + " " + error.message);
        }
    });
    <!--- Button zum Hinzufügen von Events hinzufügen, wenn User berechtigt -->
    var perm = Parse.Object.extend("Permissions");
    var query = new Parse.Query(perm);
    query.equalTo("UserObject", currentUser.id);
    query.find({
        success: function (results) {
            var u = results[0];
            var allowed = u.get('allowedEvent');
            if (allowed) {
                document.getElementById('eventAdd').style.display = "block";
            }
        },
        error: function (model, error) {
            errorMsg.innerHTML = 'Passwort erfolgreich ge&auml;ndert';
        }


    });
}
// News Details anzeigen (extra Bildschirm)
function queryNewsDetail(x) {

    var News = Parse.Object.extend("News");
    var query = new Parse.Query(News);
	//Hole das Object, dass die Id der vorherigen "groben" Events hat
    query.equalTo("objectId", x);
    query.find({
        success: function (results) {
			// Der Bildschirm von zuvor wird ausgeblendet und die NEws Details eingeblendet. AUch die Button zur Navigation werden angepasst
            document.getElementById('newsContentDetail').style.display = 'block';
            document.getElementById('newsContentDetail').innerHTML = '';
            document.getElementById('newsContent').style.display = "none";
            document.getElementById('eventHBut').style.display = "block";

            for (var i = 0; i < results.length; i++) {
				// Hier werden die News Details dynamisch erstellt und an den DIV-COntainer angehängt
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
                but.setAttribute("class", "btn btn-block btn-primary");
                but.setAttribute("onclick", "newsInCal('" + object.get('header') + "','" + object.get('date') + "','" + object.get('uhr') + "','" + object.get('ort') + "','" + object.get('beschreibung') + "')");

                butFb.innerHTML = "Event auf Facebook";
                butFb.setAttribute("class", "fbevent span12");
                butFb.setAttribute("onclick", "document.location.href='" + object.get('linktofb') + "'");
                var spanFb = document.createElement("SPAN");
                spanFb.setAttribute("class", "glyphicon glyphicon-arrow-right");
                butFb.appendChild(spanFb);
                but.setAttribute("class", "btn btn-block btn-primary");
                but.setAttribute("onclick", "newsInCal('" + object.get('header') + "','" + object.get('date') + "','" + object.get('uhr') + "','" + object.get('ort') + "','" + object.get('beschreibung') + "')");

                head.innerHTML = object.get('header') + ' - Details';

                var beschrText = document.createTextNode(object.get('beschreibung'));
                var beschrH4 = document.createElement("H4");
                beschrH4.appendChild(document.createTextNode('Beschreibung'));
                beschr.appendChild(beschrH4);
                beschr.appendChild(beschrText);

                var infoH4 = document.createElement("H4");
                infoH4.appendChild(document.createTextNode('Informationen'));
                infos.appendChild(infoH4);
                infos.appendChild(document.createTextNode('Datum: ' + object.get('date')));
                infos.appendChild(document.createElement("BR"));
                infos.appendChild(document.createTextNode('Uhrzeit: ' + object.get('uhr')));
                infos.appendChild(document.createElement("BR"));
                infos.appendChild(document.createTextNode('Ort: ' + object.get('ort')));
                infos.appendChild(document.createElement("BR"));
                infos.appendChild(document.createTextNode('Eintritt: ' + object.get('price')));
                infos.appendChild(document.createElement("BR"));
                infos.appendChild(document.createTextNode('Special: ' + object.get('special')));


                div.appendChild(beschr);
                div.appendChild(infos);
                div.appendChild(butFb);
                //div.appendChild(but);  comming soon -> Button zum hinzufügen des Termins in den Kalender
            }
        },
        error: function (error) {
            reportError(currentUser, "Error bei der Funktion queryNewsDetails", "Error: " + error.code + " " + error.message);
        }
    });
}


//Wrapper for alert so I can dynamically use PhoneGap alert's on device
function doAlert(str, cb) {
    if (cb) cb();
}

// Lade das Benutzerprofil.
function loadProfil() {
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.equalTo("objectId", Parse.User.current().id);
    query.find({
        success: function (results) {
            var u = results[0];
            var profil = document.getElementById("profilDiv");
            var p = document.createElement("H5");
            p.setAttribute('style', 'font-size:2em; line-height:44px;');


            p.appendChild(document.createTextNode('Username: ' + u.getUsername()));
            p.appendChild(document.createElement("BR"));
            p.appendChild(document.createTextNode('E-Mail: ' + u.get('email')));
            p.appendChild(document.createElement("BR"));

            profil.appendChild(p);
            var perm = Parse.Object.extend("Permissions");
            var q = new Parse.Query(perm);
            q.equalTo("UserObject", Parse.User.current().id);
            q.find({
                success: function (results) {
                    var u = results[0].get("allowedAdmin");
                    if (u) {
                        document.getElementById('addNewUser').style.display = "block";
                    }
                },
                error: function (e) {}
            });


        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}
// Ändere das Passwort
function changePw() {
    var user = currentUser.getUsername();

    var pwa = document.getElementById('pwa').value;
    var pwn = document.getElementById('pwn').value;
    var pwn2 = document.getElementById('pwn2').value;
    var errorMsg = document.getElementById('errorMsg');

    Parse.User.logIn(currentUser.getUsername(), pwa, {
        success: function (user) {
            if (pwn == pwn2) {
                currentUser.save({
                    password: pwn
                }, {
                    success: function (object) {
                        errorMsg.innerHTML = 'Passwort erfolgreich ge&auml;ndert';
                    },
                    error: function (model, error) {
                        errorMsg.innerHTML = 'Passwort erfolgreich ge&auml;ndert';
                    }
                });

            } else {
                errorMsg.innerHTML = 'Die neuen PasswÃ¶rter stimmen nicht &uuml;berein'
            }

        },
        error: function (user, error) {
            errorMsg.innerHTML = 'Das alte Passwort ist inkorrekt';
        }
    });

}
// Passwort vergessen, hier wird eigentlich. Parse.User.current().get('Email'); eingefügt
function forgetPw() {
    Parse.User.requestPasswordResetInBackground("nils.rhode04@gmail.com",
        new function () {
            alert("AHA");
        }
    );
}

// Für index.html - anpassung, wenn user eingelogt oder nicht - wird automatisch beim Start ausgeführt
function inoutauto() {
    if (currentUser == null) {
        document.getElementById('in').src = "img/login.jpg";
        document.getElementById('ina').setAttribute("href", "login.html");

    } else {
        document.getElementById('in').src = "img/profil.jpg";
        document.getElementById('ina').setAttribute("href", "profil.html");
        var elems = document.getElementsByClassName('loginr');
        for (var i = 0; i < elems.length; i++) {
            elems[i].setAttribute("onclick", "");
            var elemimg = elems[i].getElementsByTagName('img')[0];
            var id = elemimg.getAttribute("id");
            elems[i].setAttribute("href", id + ".html");
            elemimg.src = "img/" + id + ".jpg";
        }
    }

}
// Dateien können auf das MobilePhone heruntergeladen werden -> derzeit aber erstmal deaktiviert. siehe Doku.
//z.B. https://webmail.dhbw-loerrach.de/owa/calendar/kal-wse11b@dhbw-loerrach.de/Kalender/calendar.ics"
function downloadIcs(url) {
    var fileTransfer = new FileTransfer();
    alert("FileTransfer l&auml;uft");
    var uri = encodeURI(url);
    var filepath = "www/";
    fileTransfer.download(
        uri,
        filePath,
        function (entry) {
            alert("download complete: " + entry.fullPath);
        },
        function (error) {
            alert("download error source " + error.source);
            alert("download error target " + error.target);
            alert("upload error code" + error.code);
        },
        false, {
        }
    );
}
// LOGOUT; User Model wird auf null gesetzt.
function goOut() {
    currentUser = null;
    Parse.User.logOut();
    document.location.href = "index.html";
}

// ERROR werden in die DB geschrieben, um in der Startphase probleme besser festzustellen. Mit User-ID um diesem dann zu helfen
function reportError(user, erb, error) {
    var newError = new ErrorObj;
    newError.save({
        uid: user,
        ErrorBeschr: erb,
        ErrorText: error
    }, {
        success: function (object) {},
        error: function (model, error) {}
    });
}
// Wenn ein neuer Kalender ausgewählt wird, wird dieser für den nächsten STart gespeichert - in der lokalen DAtenbank
function saveCal() {
    localdb.transaction(createCalTable);
}

function createCalTable(tx) {
    var kurs = $("#kurs option:selected").text();
    var kal = $("#kurs option:selected").val();
    tx.executeSql('DROP TABLE IF EXISTS cal');
    tx.executeSql('CREATE TABLE IF NOT EXISTS cal (id INTEGER PRIMARY KEY AUTOINCREMENT, kurs VARCHAR(50), kal VARCHAR(50))');
    tx.executeSql('INSERT INTO cal (id, kurs, kal) VALUES (1,"' + kurs + '","' + kal + '")');

}
// Der Kalender wird aus der DB geladen
function getCal() {
    localdb.transaction(getTableCal);
}

function getTableCal(tx) {
    tx.executeSql('SELECT * FROM cal', [], queryCalSucess, queryCalError);
}

function queryCalError() {
    showSelectCal(1);
}

function queryCalSucess(tx, results) {
    var sk;
    var len = results.rows.length;
    if (len == 1) {
        savedCal = results.rows.item(0).kal;
        sk = results.rows.item(0).kurs;
        choosedCal(savedCal);
    }
    var sel = document.getElementById('kurs');
    var option = document.createElement("option");
    option.text = sk;
    option.value = savedCal;
    sel.appendChild(option);
    showSelectCal(0);
}

// Neuen User hinzufügen zu Berechtigungen
function addNewUser(x) {
    document.getElementById('regnew').style.display = "block";
    x.innerHTML = "User anlegen";
    x.setAttribute("onclick", "addNewUserFinally()");
}

function addNewUserFinally() {
    var uo = "";
    var email = $("#email").val();
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.equalTo("email", email);
    query.find({
        success: function (results) {
            uo = results[0].id;
            setPerm(uo);
        },
        error: function (e) {
            alert("Diese Email Adresse ist nicht registriert");
        }


    });

}

function setPerm(x) {
    var ad = $("#admin").prop("checked");
    var ev = $("#event").prop("checked");

    var perm = Parse.Object.extend("Permissions");
    var query = new Parse.Query(perm);

    query.equalTo("UserObject", x);
    query.find({
        success: function (object) {
            object[0].set("allowedEvent", ev);
            object[0].set("allowedAdmin", ad);
            object[0].save();
            alert("Berechtigungen hinzugefügt!");
            document.getElementById('email').innerHTML = "";
            document.getElementById('regnew').style.display = "none";
            document.getElementById('addNewUser').innerHTML = "Neuen Benutzer berechtigen";
        },
        error: function (error) {}
    });
}
// ENDE USER RECHTE HINZUFÜGEN

// Die Details in News werden angepasst, wenn news Details ausgewählt.
function changeDetails() {
    document.getElementById('newsContent').style.display = 'block';
    document.getElementById('newsContentDetail').style.display = 'none';
    document.getElementById('eventHBut').style.display = "none";
    document.getElementById('eventHtext').innerHTML = "Events";
}
// Neue News in den Kalender schreiben --> Derzeit deaktiviert -> s. Doku
function newsInCal(title, date, uhr, ort, beschr) {
    var edda = date.split("-");
    var eddt = edda[2];
    var eddm = edda[1] - 1;
    var eddy = edda[0];
    var u = uhr.split(":");
    var uh = u[0];
    var um = u[1];
    var uh2 = "22";
    var endDate = new Date(eddy, eddm, eddt, uh2, um);
    var startDate = new Date(eddy, eddm, eddt, uh, um);

    var success = function (message) {
        alert("Success: " + message);
    };
    var error = function (message) {
        alert("Error: " + message);
    };

    window.plugins.calendar.createEvent(title, "", beschr, startDate, endDate, success, error);
    alert("KEIN ERROR");
    //window.plugins.calendar.createEvent(title,"",beschr,uhr,endDate,success,error);
}

<!--- Kal List -->
function showSelectCal(x) {
    var filter = new Array();
    var sels = document.getElementsByClassName('selCal');
    for (var i = 0; i < sels.length; i++) {
        if (sels[i].checked) {
            filter[i] = sels[i].getAttribute("value");
        } else {
            filter[i] = "keinMatchMoeglich";
        }
    }
    if (x == 1) {
        $("#kurs").empty();
    }
    var option = document.createElement("option");
    var url = "http://www.dhbw-loerrach.de/fileadmin/pubdocs/cal-app/calendar_calendars.xml";
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function () {

        if (req.readyState === 4) {
            var doc = req.responseXML;
            var entries = doc.getElementsByTagName('Calendar');
            for (var i = 0, l = entries.length; i < l; i++) {
                var entry = entries[i];

                var naEl = entry.getElementsByTagName('DisplayName')[0];
                var urlEl = entry.getElementsByTagName('iCalUrl')[0];
                var option = document.createElement("option");
                for (var j = 0; j < filter.length; j++) {
                    if (naEl.textContent.match(filter[j]) || naEl.textContent == "StuV") {
                        option.text = naEl.textContent;
                        option.value = urlEl.textContent;
                        sel.appendChild(option);
                        j = 4;
                    }
                }
            }
        }
    };
    req.send(null);
}

var ical;
var tag = "";
var tt = "";
var beschr;

var newEv;
var concatenate = "";
var monat = "";
var monatZahl = "";
var tagZahl = "";
var jahr = "";
var zeit = "";
var ort = "";
var tag1 = "";
var tag2 = "";
var z = 0;
var id = "";
var monthAbk = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
var month = new Array("Januar", "Februar", "M&auml;rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember");
<!--- KAL LIST ENDE --->	

<!--- Ausgewählten Kalender anzeigen -->
function choosedCal(cal) {
    $.blockUI({
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
        }
    });
    setTimeout($.unblockUI, 4000);
    document.getElementById('calInhalt').style.display = "block";
    var divs = document.getElementsByClassName('CalConents');
    for (var i = 0; i < divs.length; i++) {
        divs[i].innerHTML = "";
    }

    $("#divout").load(cal, function (msg) {
        var myArray = msg.split("\n");

        <!-- Kalendar in ical Objekt -->
        var content = document.getElementById('divout').innerHTML;
        ical = $.icalendar.parse(content);
        <!-- Inhalt leeren -->
        document.getElementById('divout').innerHTML = "";
        <!-- Für jedes ical Objekt -->
        $.each(ical, function (key, value) {
            <!--- wenn du ein event bist -->
            if (key == "vevent") {
                var events = value;
                <!-- für jedes event -->
                $.each(events, function (key, value) {
                    var ev = value;
                    <!-- für jedes Event ein eigener DIV-Container -->
                    newEv = document.createElement("DIV");
                    newEv.setAttribute("class", "event");
                    var firstT = 0;
                    $.each(ev, function (key, value) {
                        <!-- wenn Schlüssel = Ort und auch ein Wert vorhanden -->
                        if (key == "location" && value != "") {
                            ort = document.createElement("P");
                            ort.setAttribute("class", "calOrt");
                            ort.innerHTML = "Ort: " + value;
                        } else {
                            ort = "";
                        }
                        if (key == "summary") {
                            beschr = document.createElement("H5");
                            beschr.setAttribute("class", "calBeschr");
                            beschr.innerHTML = value;
                        }
                        if (key == "dtstart" || key == "dtend") {
                            var t = value;
                            $.each(t, function (key, value) {
                                if (key == "_value") {
                                    var val = String(value);
                                    var valu = val.split(" ");
                                    monat = valu[1];
                                    if (firstT == 0) {
                                        id = valu[2] + "." + valu[1] + "." + valu[3];
                                        <!-- Wochentag festlegen -->
                                        var wdays = new Array("Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag");
                                        var wdaysAbk = new Array("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
                                        for (var i = 0; i < wdays.length; i++) {
                                            if (wdaysAbk[i] == valu[0]) {

                                                concatenate = concatenate + " " + wdays[i];
                                            }
                                        }

                                        <!-- Datum festlegen -->
                                        tagZahl = valu[2];
                                        concatenate = concatenate + ", den " + valu[2] + ".";

                                        <!-- zum Monat hinzufügen -->

                                        for (var j = 0; j < month.length; j++) {

                                            if (monthAbk[j] == valu[1]) {
                                                concatenate = concatenate + " " + month[j];
                                                monatZahl = j;
                                            }
                                        }

                                        <!-- Jahr festlegen -->
                                        jahr = valu[3];
                                        concatenate = concatenate + " " + valu[3];
                                        <!-- An H4 Element übergeben -->			
                                        tag = document.createElement("H4");
                                        tag.innerHTML = concatenate;

                                        <!-- Uhrzeit von festlegen -->
                                        tt = "Uhrzeit: " + valu[4];
                                        firstT = 1;
                                    } else if (firstT == 1) {
                                        tt = tt + " bis " + valu[4];
                                        firstT = 0;
                                    }
                                }

                                zeit = document.createElement("P");
                                zeit.innerHTML = tt;

                            });
                        }

                    });

                    tag1 = tag.innerHTML;
                    if (tag1 != tag2) {
                        newEv.appendChild(tag);
                        newEv.setAttribute("id", id);
                        tag2 = tag1;
                        if (z % 2 != 0) {
                            newEv.setAttribute("class", "event gray");
                        }
                    }
                    z++;
                    newEv.appendChild(beschr);
                    newEv.appendChild(zeit);
                    if (ort != "") {
                        newEv.appendChild(ort);
                    }
                    if (jahr < new Date().getFullYear()) {
                        newEv.setAttribute("value", "nv");
                        newEv.setAttribute("style", "display:none");
                    } else if (jahr == new Date().getFullYear()) {
                        if (monatZahl == new Date().getMonth()) {
                            if (tagZahl <= new Date().getDate()) {
                                newEv.setAttribute("value", "nv");
                                newEv.setAttribute("style", "display:none");
                            }
                        } else if (monatZahl < new Date().getMonth()) {
                            newEv.setAttribute("value", "nv");
                            newEv.setAttribute("style", "display:none");
                        }
                        document.getElementById(monat).appendChild(newEv);
                    }

                    concatenate = "";



                });

            }
        });
    });
    setTimeout(function () {
        showBut();
    }, 4000);
}
<!-- ENDE Kalender anzeigen ENDE -->

<!-- MonatText wiedergeben -->
function MonatText(Zahl) {
    return monthAbk[Zahl];
}
<!-- ENDE MonatText wiedergeben ENDE -->

<!-- Aktuellen Monat anzeigen ~auto~ -->
var MonatAktuell = new Date().getMonth();
showCal(MonatText(MonatAktuell), MonatAktuell);
document.getElementById('showMonth').innerHTML = month[MonatAktuell];
<!-- ENDE Aktuellen Monat anzeigen ENDE -->

<!-- Zeige Button an --->
function showBut() {
    var cm = document.getElementsByClassName('chooseMonth');
    window.console.log("ELEM ANZAHL:" + cm.length);
    for (var k = 0; k < cm.length; k++) {
        window.console.log(document.getElementById(MonatText(k)));
        window.console.log(k + ": " + document.getElementById(MonatText(k)).hasChildNodes());
        if (!document.getElementById(MonatText(k)).hasChildNodes()) {

            cm[k].setAttribute("style", "display:none");
        } else {
            cm[k].setAttribute("style", "");
        }
    }
}
<!-- ENDE Zeige Button an ENDE --->

// ausgewählten Monats-Kalender anzeigen
function showCal(x, y) {
    var d = document.getElementsByClassName('CalConents');
    for (var j = 0; j < d.length; j++) {
        d[j].style.display = "none";
    }
    document.getElementById(x).style.display = "block";
    document.getElementById('showMonth').innerHTML = month[y];
}

// DOZEN`TEN BEWERTUNG
// hole die Dozenten Bewertung
function getDozB() {
    var div = document.getElementById('showRate');
    div.innerHTML = "";
    kurse.length = 0;
    ph = 0;
	// ID des Dozenten
    var currentDozent = $("#dozentenSelect :selected").val();


    var dk = Parse.Object.extend("DozentenKurse");
    var qdk = new Parse.Query(dk);
    qdk.equalTo("dozentenObject", currentDozent);
    var j = 0;
    qdk.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                dozk[j] = results[i].id;
                j++;
                dozk[j] = results[i].get('name');
                j++;

            }
        },
        error: function () {}
    });


    var db = Parse.Object.extend("DozentenBewertung");
    var qdb = new Parse.Query(db);
    qdb.equalTo("dozentenObject", currentDozent);
    qdb.find({
        success: function (results) {
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                fillDozentBewert(object.get('kurseObject'), object.get('note'), object.get('gesamt'));
            }
            if (kurse.length > 0) {
                loadKurse(kurse);
            } else {
                div.innerHTML = "Keine Kurse gefunden - sei der erste der diesen Dozent bewertet";
            }
        },
        error: function () {}
    });
}

// Hole die DOzentenBewertung in den DIV Container
function fillDozentBewert(kurseObj, noteObj, gesObj) {

    var neuerKurs = 1;
    var neuerKursPoint;
    var bewInhalt = 0;
    for (var j = 0; j < kurse.length; j++) {
        if (kurseObj == kurse[j][0]) {
            neuerKurs = 0;
            neuerKursPoint = j;
        }
    }
    if (neuerKurs == 1) {
        kurse[ph] = new Array();
        kurse[ph][0] = kurseObj;

        kurse[ph][1] = new Array();
        kurse[ph][1][0] = parseFloat(noteObj);

        kurse[ph][2] = new Array();
        kurse[ph][2][0] = parseFloat(gesObj);
        ph = ph + 1;
    } else {
        var x = kurse[neuerKursPoint][1].length;
        var y = kurse[neuerKursPoint][2].length;
        kurse[neuerKursPoint][1][x] = parseFloat(noteObj);
        kurse[neuerKursPoint][2][y] = parseFloat(gesObj);
        neuerKurs = 1;
    }
}

function loadKurse(kurse) {
    var num = 0;
    var div = document.getElementById('showRate');

    for (var i = 0; i < kurse.length; i++) {

        var summeN = 0;
        var summeB = 0;
        var fach = document.createElement("H5");
        for (var l = 0; l < dozk.length; l++) {
            if (dozk[l] == kurse[i][0]) {
                var m = l + 1;
                fach.innerHTML = dozk[m];
            }
        }


        var divFach = document.createElement("DIV");

        for (var j = 0; j < kurse[i][2].length; j++) {
            summeB = summeB + kurse[i][2][j];
        }
        summeB = (summeB / kurse[i][2].length).toFixed(2);

        var bew = document.createElement("P");
        var span0 = document.createElement("SPAN");
        span0.setAttribute("class", "star glyphicon glyphicon-star-empty");
        var span1 = document.createElement("SPAN");
        span1.setAttribute("class", "star glyphicon glyphicon-star-empty");
        var span2 = document.createElement("SPAN");
        span2.setAttribute("class", "star glyphicon glyphicon-star-empty");
        var span3 = document.createElement("SPAN");
        span3.setAttribute("class", "star glyphicon glyphicon-star-empty");
        var span4 = document.createElement("SPAN");
        span4.setAttribute("class", "star glyphicon glyphicon-star-empty");

        if (summeB >= 1) {
            span0.setAttribute("class", "star glyphicon glyphicon-star");
        }
        if (summeB >= 2) {
            span1.setAttribute("class", "star glyphicon glyphicon-star");
        }
        if (summeB >= 3) {
            span2.setAttribute("class", "star glyphicon glyphicon-star");
        }
        if (summeB >= 4) {
            span3.setAttribute("class", "star glyphicon glyphicon-star");
        }
        if (summeB == 5) {
            span4.setAttribute("class", "star glyphicon glyphicon-star");
        }

        bew.innerHTML = "Gesamtbewertung: ";
        bew.appendChild(span0);
        bew.appendChild(span1);
        bew.appendChild(span2);
        bew.appendChild(span3);
        bew.appendChild(span4);
        bew.appendChild(document.createTextNode(" (" + summeB + " Sterne)"));


        for (var k = 0; k < kurse[i][1].length; k++) {
            summeN = summeN + kurse[i][1][k];
        }
        summeN = (summeN / kurse[i][1].length).toFixed(2);
        var note = document.createElement("P");
        note.innerHTML = "Notenschnitt: " + summeN;
        divFach.appendChild(fach);
        divFach.appendChild(note);
        divFach.appendChild(bew);
        var pp = document.createElement('P');
        pp.innerHTML = "Abgegebene Bewertungen:" + kurse[i][2].length;
        divFach.appendChild(pp);
        div.appendChild(divFach);
    }
}



function showNewRate() {
    document.getElementById('newKurseSelect').style.display = "none";
    document.getElementById('newKurseSelectBut').style.display = "none";
    if (document.getElementById('addNew').style.display == "block") {
        document.getElementById('addNew').style.display = "none";
        document.getElementById('showRate').style.display = "block";

    } else {
        document.getElementById('addNew').style.display = "block";
        document.getElementById('showRate').style.display = "none";
        var myNode = document.getElementById('kurseSelect');
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        currentDozent = $("#dozentenSelect :selected").val();
        var dk = Parse.Object.extend("DozentenKurse");
        var qdk = new Parse.Query(dk);
        setTimeout(function () {
            qdk.equalTo("dozentenObject", currentDozent);
            qdk.find({
                success: function (results) {
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];
                        var val = object.get('name');
                        var id = object.id;
                        var option = document.createElement("option");
                        option.text = val;
                        option.value = id;
                        document.getElementById("kurseSelect").appendChild(option);
                    }
                    var option = document.createElement("option");
                    option.text = "neuen Kurs hinzufügen:";
                    option.value = "add";
                    document.getElementById("kurseSelect").appendChild(option);
                },
                error: function () {}
            });
        }, 500);
        document.getElementById('name').setAttribute("readonly", "true");
        $("#name").val($("#dozentenSelect :selected").text());
    }
}

function newKurse() {
    dk = Parse.Object.extend("DozentenKurse");
    var dkn = new dk;
    var dobj = $("#dozentenSelect :selected").val();
    var nobj = $("#newKurseSelect").val();
    dkn.save({
        dozentenObject: dobj,
        name: nobj
    }, {
        success: function (permAgain) {
            var id = permAgain.id;
            var opt = document.createElement("OPTION");
            opt.text = nobj;
            opt.value = id;
            opt.setAttribute("selected", "selected");
            document.getElementById('kurseSelect').appendChild(opt);
            document.getElementById('newKurseSelect').style.display = "none";
            document.getElementById('newKurseSelectBut').style.display = "none";

        },
        error: function (permAgain, error) {

        }
    });
}

function starover(x) {
    for (var i = 1; i <= 5; i++) {
        var span = "star" + i;
        if (i <= x) {
            document.getElementById(span).setAttribute('class', 'bstar glyphicon glyphicon-star');
        } else {
            document.getElementById(span).setAttribute('class', 'bstar glyphicon glyphicon-star-empty');
        }
    }
}

function addBew() {
    var n = parseInt($('#note').val());
    var g = parseInt(document.getElementsByClassName('bstar glyphicon-star').length);
    var ko = $('#kurseSelect :selected').val();
    var dob = $('#dozentenSelect :selected').val();
    console.log(n);
    console.log(g);
    console.log(ko);
    console.log(dob);
    db = Parse.Object.extend("DozentenBewertung");
    var dbn = new db;
    dbn.save({
        dozentenObject: dob,
        kurseObject: ko,
        gesamt: g,
        note: n
    }, {
        success: function (object) {
            document.getElementById('showRate').style.display = "block";
            document.getElementById('addNew').style.display = "none";
            getDozB();
        },
        error: function (model, error) {
            alert(error);
        }
    });
}

// DOZEN`TEN BEWERTUNG ENDE

// MENSA AUFBEREITEN
//hole aktuelle KalenderWoche
function KalenderWoche() {
    var KWDatum = new Date();

    var DonnerstagDat = new Date(KWDatum.getTime() +
        (3 - ((KWDatum.getDay() + 6) % 7)) * 86400000);

    KWJahr = DonnerstagDat.getFullYear();

    var DonnerstagKW = new Date(new Date(KWJahr, 0, 4).getTime() +
        (3 - ((new Date(KWJahr, 0, 4).getDay() + 6) % 7)) * 86400000);

    KW = Math.floor(1.5 + (DonnerstagDat.getTime() -
        DonnerstagKW.getTime()) / 86400000 / 7);
    return KW;
}
// Zeige beim Start das aktuelle Tagesmenü. Bei Klick auf ein anderes, wird der andere Tag angezeigt (x = Variable für den Tag).
function menuToDay(x) {
    var days = new Array(day1, day2, day3, day4, day5);
    var headers = new Array("Suppe ", "Die Traditionellen ", "Wok, Grill, Pasta ", "Die Vegetarischen ", "Gem&uuml;se & Co ", "Beilagen ", "Salateria ", "Genie&szlig;er-Cup ");

    var inhalt = 'inhalt';
    var head = 'head';
    var content = 'content';
    var price = 'price';
    var t = 'T';
    var a = 2;
    var b = a + 1;
    var aktDay = days[x];
    var res = salat[1];
    var tres = res.split(" 100", 1);
    var pres = "100gr für je " + res.split(" EUR").pop() + "€";
    document.getElementById('showDay').innerHTML = aktDay[0];
    for (var j = 0; j < 8; j++) {

        var getHead = document.getElementById(head + 'M' + j);
        var getContent = document.getElementById(content + 'M' + j);
        var getPrice = document.getElementById(price + 'M' + j);
        getHead.innerHTML = headers[j];
        if (getHead.innerHTML == "Salateria ") {

            getContent.innerHTML = tres;
            getPrice.innerHTML = pres;

        } else {
            getContent.innerHTML = aktDay[a];
            getPrice.innerHTML = aktDay[b];
            a = b + 1;
            b = a + 1;
        }
    }
}

function showMensa(x) {
    var dat = x.substring(1, 2);
    for (var i = 0; i < 5; i++) {
        var menu = document.getElementById('T' + i);
        menu.setAttribute("class", "btn sample btn-lg btn-sample");
    }
    var menu = document.getElementById(x);
    menu.setAttribute("class", "btn sample btn-lg btn-sample active ");
    menuToDay(dat);
}