window.onload = function() {
	// DOM wird erst aufgerufen, wenn Aufbau der APP fertig
	document.addEventListener("deviceready", function() {  //wenn mobiles Gerät fertig initalisiert ->PhoneGap erlaubt deviceready
	 	//Callback -> wenn Gerät fertig
				
		var db = window.openDatabase("DHBWDB", "1.0", "DHBW2GO DB", 1000000); //Datenbank anlegen
		db.transaction(createDB,errorDB,successDB);
		db.transaction(queryDB, errorCB);
	}, false); //anonyme Funktion 
}


function createDB(ldb) {
    ldb.executeSql('DROP TABLE IF EXISTS USERS');
    ldb.executeSql('CREATE TABLE IF NOT EXISTS USERS (id unique, name, mail, class)');
    ldb.executeSql('INSERT INTO USERS (id, name, mail, class) VALUES (1, "TestName","TestMail","TestClass")');
}

function queryDB(ldb) {
    tx.executeSql('SELECT * FROM DEMO', [], querySuccess, errorCB);
}


function querySuccess(ldb, results) {
    // this will be empty since no rows were inserted.
    console.log("Insert ID = " + results.insertId);
    // this will be 0 since it is a select statement
    console.log("Rows Affected = " + results.rowAffected);
    // the number of rows returned by the select statement
    console.log("Insert ID = " + results.rows.length);
}


function errorDB(err) {
    alert("Error processing SQL: "+err);
}

function successDB() {
    alert("success!");
}