var F = "http://localhost/livedemo/";
function setCookie(c_name,value,expiredays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toUTCString());
}

function ReadCookie(cookieName) {
	 var theCookie=""+document.cookie;
	 var ind=theCookie.indexOf(cookieName);
	 if (ind==-1 || cookieName=="") return ""; 
	 var ind1=theCookie.indexOf(';',ind);
	 if (ind1==-1) ind1=theCookie.length; 
	 return unescape(theCookie.substring(ind+cookieName.length+1,ind1));
}

apiKey = ReadCookie('apiKey');
if(apiKey == 'null'||apiKey == undefined) {
	apiKey = prompt('please eneter your api key');
	setCookie('apiKey', apiKey, 365);
}
else {
	Sid.js(F + "jquery-1.4.4.min.js", function(){
		Sid.js(F + "editor.php?key=" + apiKey)
	});
}