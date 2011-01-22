var ver= 0.3;
if (typeof jQuery == 'undefined') {break};
function ReadCookie(cookieName) {
	 var theCookie=""+document.cookie;
	 var ind=theCookie.indexOf(cookieName);
	 if (ind==-1 || cookieName=="") return ""; 
	 var ind1=theCookie.indexOf(';',ind);
	 if (ind1==-1) ind1=theCookie.length; 
	 return unescape(theCookie.substring(ind+cookieName.length+1,ind1));
	}

//jquery scroll
(function(){
 
    var special = jQuery.event.special,
        uid1 = 'D' + (+new Date()),
        uid2 = 'D' + (+new Date() + 1);
 
    special.scrollstart = {
        setup: function() {
 
            var timer,
                handler =  function(evt) {
 
                    var _self = this,
                        _args = arguments;
 
                    if (timer) {
                        clearTimeout(timer);
                    } else {
                        evt.type = 'scrollstart';
                        jQuery.event.handle.apply(_self, _args);
                    }
 
                    timer = setTimeout( function(){
                        timer = null;
                    }, special.scrollstop.latency);
 
                };
 
            jQuery(this).bind('scroll', handler).data(uid1, handler);
 
        },
        teardown: function(){
            jQuery(this).unbind( 'scroll', jQuery(this).data(uid1) );
        }
    };
 
    special.scrollstop = {
        latency: 300,
        setup: function() {
 
            var timer,
                    handler = function(evt) {
 
                    var _self = this,
                        _args = arguments;
 
                    if (timer) {
                        clearTimeout(timer);
                    }
 
                    timer = setTimeout( function(){
 
                        timer = null;
                        evt.type = 'scrollstop';
                        jQuery.event.handle.apply(_self, _args);
 
                    }, special.scrollstop.latency);
 
                };
 
            jQuery(this).bind('scroll', handler).data(uid2, handler);
 
        },
        teardown: function() {
            jQuery(this).unbind( 'scroll', jQuery(this).data(uid2) );
        }
    };
 
})();

//jquery center
jQuery.fn.center = function(params) {

		var options = {

			vertical: true,
			horizontal: true

		}
		op = jQuery.extend(options, params);

   return this.each(function(){

		//initializing variables
		var $self = jQuery(this);
		//get the dimensions using dimensions plugin
		var width = $self.width();
		var height = $self.height();
		//get the paddings
		var paddingTop = parseInt($self.css("padding-top"));
		var paddingBottom = parseInt($self.css("padding-bottom"));
		//get the borders
		var borderTop = parseInt($self.css("border-top-width"));
		var borderBottom = parseInt($self.css("border-bottom-width"));
		//get the media of padding and borders
		var mediaBorder = (borderTop+borderBottom)/2;
		var mediaPadding = (paddingTop+paddingBottom)/2;
		//get the type of positioning
		var positionType = $self.parent().css("position");
		// get the half minus of width and height
		var halfWidth = (width/2)*(-1);
		var halfHeight = ((height/2)*(-1))-mediaPadding-mediaBorder;
		// initializing the css properties
		var cssProp = {
			position: 'absolute'
		};

		if(op.vertical) {
			cssProp.height = height;
			cssProp.top = '50%';
			cssProp.marginTop = halfHeight;
		}
		if(op.horizontal) {
			cssProp.width = width;
			cssProp.left = '50%';
			cssProp.marginLeft = halfWidth;
		}
		//check the current position
		if(positionType == 'static') {
			$self.parent().css("position","relative");
		}
		//aplying the css
		$self.css(cssProp);


   });

};

//jquery cookie
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

//jquery listHandlers
$.fn.listHandlers = function(events, outputFunction) {
    return this.each(function(i){
        var elem = this,
            dEvents = $(this).data('events');
        if (!dEvents) {return;}
        $.each(dEvents, function(name, handler){
            if((new RegExp('^(' + (events === '*' ? '.+' : events.replace(',','|').replace(/^on/i,'')) + ')$' ,'i')).test(name)) {
               $.each(handler, function(i,handler){
                   outputFunction(elem, '\n' + i + ': [' + name + '] : ' + handler );
               });
           }
        });
    });
};

//jquery cross domain ajax
jQuery.ajax = (function(_ajax){
    
    var protocol = location.protocol,
        hostname = location.hostname,
        exRegex = RegExp(protocol + '//' + hostname),
        YQL = 'http' + (/^https/.test(protocol)?'s':'') + '://query.yahooapis.com/v1/public/yql?callback=?',
        query = 'select * from html where url="{URL}" and xpath="*"';
    
    function isExternal(url) {
        return !exRegex.test(url) && /:\/\//.test(url);
    }
    
    return function(o) {
        
        var url = o.url;
        
        if ( /get/i.test(o.type) && !/json/i.test(o.dataType) && isExternal(url) ) {
            
            // Manipulate options so that JSONP-x request is made to YQL
            
            o.url = YQL;
            o.dataType = 'json';
            
            o.data = {
                q: query.replace(
                    '{URL}',
                    url + (o.data ?
                        (/\?/.test(url) ? '&' : '?') + jQuery.param(o.data)
                    : '')
                ),
                format: 'xml'
            };
            
            // Since it's a JSONP request
            // complete === success
            if (!o.success && o.complete) {
                o.success = o.complete;
                delete o.complete;
            }
            
            o.success = (function(_success){
                return function(data) {
                    
                    if (_success) {
                        // Fake XHR callback.
                        _success.call(this, {
                            responseText: data.results[0]
                                // YQL screws with <script>s
                                // Get rid of them
                                .replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, '')
                        }, 'success');
                    }
                    
                };
            })(o.success);
            
        }
        
        return _ajax.apply(this, arguments);
        
    };
    
})(jQuery.ajax);

//jquery getpath
jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) { 
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

//isset function
function isset(variable_name){
	try{
	if (typeof(eval(variable_name)) != 'undefined')
		if (eval(variable_name) != null)
		return true;
	} catch(e) { }
	
	return false;
}

//disable default click events
$("a,input[type=submit],input[type=button],button").not('[href^=#]')
	.click(function() {
		return false;
	})
	//.attr("href",function(){return '#link-'+$(this).attr("href")})
	
//demo variables
apiKey = ReadCookie('apiKey');

//$.cookie('apiKey', apiKey);
var i =0;
var host = "http://localhost/livedemo/";
var path = window.location['pathname']+window.location['search']+window.location['hash'];

//set demo
$.getJSON(host+"WS/getDemo.ws.php?key="+apiKey+"&format=json&jsoncallback=?",
		  function(data){
			 demo=data;
			 if(demo[path] == undefined) {demo[path]=[]};
			 pageDemo = demo[path];
		  }
)

//css
var cssLoc = host+"css/editor.css";
$('<link rel="stylesheet" type="text/css" href="'+cssLoc+'" >').appendTo("head");
 
//toolbar's html
var toolbar = 
'<div class="siteDEMO" id="siteDEMO-toolbar">'+
	'<img class="siteDEMO" src="'+host+'icons/icon.png"/>'+
	'<img class="siteDEMO" src="'+host+'icons/separator.gif"/>'+
	'<img title="tag elements" class="siteDEMO siteDEMO-button" id="siteDEMO-tag" src="'+host+'icons/tag.png"/>'+
	'<img title="comment" class="siteDEMO siteDEMO-button" id="siteDEMO-comment" src="'+host+'icons/comment.png"/>'+
	'<img title="define an action" class="siteDEMO siteDEMO-button" id="siteDEMO-action" src="'+host+'icons/action.png"/>'+
	'<img title="user reaction" class="siteDEMO siteDEMO-button" id="siteDEMO-user" src="'+host+'icons/user.png"/>'+
	'<img class="siteDEMO" src="'+host+'icons/separator.gif"/>'+
	'<img title="Story line" class="siteDEMO siteDEMO-button" id="siteDEMO-edit" src="'+host+'icons/edit.png"/>'+
	'<img title="play" class="siteDEMO siteDEMO-button" id="siteDEMO-play" src="'+host+'icons/play.png"/>'+
	'<img title="save" class="siteDEMO siteDEMO-button" id="siteDEMO-save" src="'+host+'icons/save.png"/>'+
	'<img class="siteDEMO" src="'+host+'icons/separator.gif"/>'+
	'<span class="siteDEMO" id="siteDEMO-selected"> </span>'+
'</div>';

//highlighter
var highlighter ='<div class="siteDEMO transparent_class" id="siteDEMO-highlighter"> </div>';

//toolbar toggle
//remove loader
$('#editorLoading').remove();
//if there's no toolbar, insert it
if($('#siteDEMO-toolbar').length == 0){ 
	$(document.body)
		.prepend(toolbar)
		.prepend(highlighter)
//otherwise remove it
}else{ 
	$('#siteDEMO-toolbar').remove();
	$('#siteDEMO-highlighter').remove();
}

//define selectable elements
var elements = $(document.body).find("*").not("body,.siteDEMO");

//toolbar functions, 
//checks the clicked button, and performs their action
$(".siteDEMO-button").toggle(
	function(){// on first click, do :
		var id = $(this).attr('id').substr(9); //find id of clicked button
		$(".siteDEMO-button").data("selected",$(this).attr('id'))//set the selected button
		
		$(this).css({'border-color':'red','border-style':'groove'})// change the border to show that it's selected
		switch(id){
			
			/*****TAG ELEMENTS*****/
			case "tag":
				elements
					.hover(// highlighting
						function (event) {
								event.stopPropagation();
								var position = $(this).offset();
								var height = $(this).outerHeight();
								var width = $(this).outerWidth();
								$("#siteDEMO-highlighter")
									.css(position)
									.css({"height":height,"width":width})
									.show()
									.data("over",this);
								$("#siteDEMO-selected").text(
															 '#'+$(this).attr('id')+
															 ' .'+$(this).attr('class') 
															 )
						},
						function () {
							setTimeout('$("#siteDEMO-highlighter").hide();$("#siteDEMO-selected").text("")',500)
						}
					)
					.click(function(event){
						event.stopPropagation();
						//if clicked, ask for a description
						var tag = prompt("Please enter your description for "+
										 this.tagName+
										 '#'+$(this).attr('id')+
										 ' .'+$(this).attr('class'),
										 ''
										 );
						//description must be non-empty to proceed
						if (tag!=undefined && tag!=""){
							//if tag was defined, ask for trigger
							var time = prompt("Please enter time to show this tag,"+
											  "or leave it as mouse click" ,
											  'mouse');
							var index = $(this).getPath();//element's global index
							pageDemo[pageDemo.length]=["tag", index, tag, time];//add to demo
							$("#siteDEMO-tag").trigger("click");
						}
				})
				//because user might click on the highlighter box, 
				//we set it's "over" data which tells us what it is on top of
				$("#siteDEMO-highlighter")
					.live("click",
						  function(){
							  $($("#siteDEMO-highlighter").data("over"))
								  .trigger("click");
							  })
				break;
				
			/*****WRITE A MESSAGE*****/
			case "comment"://refer to tag documentation, very similar
				var comment = prompt("enter your comment",'');
				if (comment!=null && comment!=""){
					var time = prompt("Please enter time in second to show this tag,\n"+
									  "or leave it as mouse click.\n"+
									  "you can also use \"talk\"option to use text to speech",
									  'mouse');
					pageDemo[pageDemo.length]=["comment", comment, time];
					$("#siteDEMO-comment").trigger("click");
				}
				break;
				
			/*****RECORD ACTIONS*****/
			case "action":
				//record typing
				$("input,textbox")//only choose textbox and text areas
					.focus(function(){
						$(this).keydown(function(event){
							//if we clicked on textbox and wrote something,
							//set changed property to true, 
							$(this).data("changed",true);
						})
					})
					.blur(function(){
						if($(this).data("changed"))//if anything was changed, get the value
							var index = $(this).getPath(); //element's global index
							pageDemo[pageDemo.length]= [//and add it to demo
												'type',
												index,
												$(this).val()
												];
							$(this).data("changed",false);
							$("#siteDEMO-action").trigger("click");
					})
					
				//record clicks
				elements.filter('a,input[type=submit],input[type=button],button')//only accept clickable elements
					.click(function(){
						var index = $(this).getPath();//element's global index
						pageDemo[pageDemo.length]= ['click',index];
						$("#siteDEMO-action").trigger("click");
					})
					
				//record scrolling
				elements.add(document,"body")
					.one("scrollstop",function(){
						$(this).unbind("scrollstop");
						var index = $(this).getPath();//element's global index
						pageDemo[pageDemo.length]= ['scroll',index,$(this).scrollTop()];
						$("#siteDEMO-action").trigger("click");
					})
				break;
				
			/*****USER REACTION*****/
			case "user"://*** under development !
				//require typing by user
				$("input,textbox")
					.focus(function(){
						$(this).keydown(function(event){
							$(this).data("changed",true);
						})
					})
					.blur(function(){
						if($(this).data("changed"))
						pageDemo[pageDemo.length]= [
											'userType',
											this,
											$(this).val()
											];
						$(this).data("changed",false);
						$("#siteDEMO-user").trigger("click");
					})
				//require clicking by user
				elements.filter('a,input[type=submit],input[type=button]')
					.click(function(){
						pageDemo[pageDemo.length]= ['userClick',this];
						$("#siteDEMO-user").trigger("click");
					})
				break;
				
			/*****EDIT DEMO*****/
			case "edit"://edits demo array,--> remove, move up &down
				$("#siteDEMO-edit").trigger("click");
				//setup demo editor layout
				$('body').append('<div class="transparent_class siteDEMO" id="siteDEMO-blind"> </div>'+
								 '<div class="siteDEMO siteDEMO-show" id="siteDEMO-show">'+
									 '<table border="1" id="siteDEMO-story" >'+
										 '<tr>'+
											 '<td>type</td>'+
											 '<td>element</td>'+
											 '<td>message</td>'+
											 '<td>trigger</td>'+
											 '<td class="siteDEMO-button" id="siteDEMO-closeStory"> [X] </td>'+
										 '</tr>'+
									 '</table>'+
								 '</div>'
								 );
				$("#siteDEMO-blind, #siteDEMO-show")
					.css({
						 'height':$(document).height(),
						 'width':$(document).width()
						 })
				$.each(pageDemo,//for each slide in demo :
						function(i,slide){
							element = $('*').eq(slide[1]);
							$('#siteDEMO-story').append(//add a row to table
													   '<tr>'+
													   '<td>'+slide[0]+'</td>'+
													   '<td>.'+element.attr('class')+'#'+element.attr('id')+'</td>'+
													   '<td> </td>'+
													   '<td> </td>'+
													   '<td>'+
														   '<img class="siteDEMO-button siteDEMO-up" '+
														   'src="'+host+'icons/up.gif"/> <br/>'+
														   '<img class="siteDEMO-button siteDEMO-down"'+
														   'src="'+host+'icons/down.gif"/> <br/>'+
														   '<img class="siteDEMO-button siteDEMO-delete"'+
														   'src="'+host+'icons/delete.gif"/> <br/>'+
													   '</td>'+
													   '</tr>'
													   ) 
							//check to see if there's anything to add to 2nd and 3rd column
							if(slide[2]!=undefined)$('#siteDEMO-story tr:last')
								.children('td:eq(2)').append(slide[2]);
							if(slide[3]!=undefined)$('#siteDEMO-story tr:last')
								.children('td:eq(3)').append(slide[3]);
						}
				)
				
				$('#siteDEMO-story tr:odd').css({'color':'black','background-color':'white'})//zebra color the table
				$("#siteDEMO-story").center();//centre the table
				$('#siteDEMO-story tr').hover(//on hover., highlight
					function(){$(this).css({'color':'black','background-color':'yellow'})},
					function(){
						$('#siteDEMO-story tr:odd').css({'color':'black','background-color':'white'})
						$('#siteDEMO-story tr:even').css({'color':'white','background-color':'black'})
					}
				)
				//demo editor buttons
				$("#siteDEMO-closeStory")
					.one('click',function(event){
						event.stopPropagation();
						$("#siteDEMO-show,#siteDEMO-blind").remove();
					})
				$(".siteDEMO-up")
					.click(function(){
						var row = $(this).parents('tr');
						var index = row.index()-1;
						row.prev('tr').before(row);
						var slide = pageDemo.splice(index,1);
						pageDemo.splice(index-1,0,slide[0]);
					})
				$(".siteDEMO-down")
					.click(function(){
						var row = $(this).parents('tr');
						var index = row.index()-1;
						row.prev('tr').before(row);
						var slide = pageDemo.splice(index,1);
						pageDemo.splice(index+1,0,slide[0]);
					})
				$(".siteDEMO-delete")
					.click(function(){
						var row = $(this).parents('tr');
						var index = row.index()-1;
						row.remove();
						var slide = pageDemo.splice(index,1);
					})
				break;
				
			/*****PREVIEW DEMO*****/
			case "play":
				$("#siteDEMO-play").trigger("click");
				$("#siteDEMO-toolbar").hide();
				//setup layout
				$('body').append('<div class="transparent_class siteDEMO" id="siteDEMO-blind"> </div>'+
								 '<div class="siteDEMO" id="siteDEMO-message"> </div>'+
								 '<div class="siteDEMO" id="siteDEMO-show"> </div>'
								 );
				$("#siteDEMO-blind, #siteDEMO-show")
					.css({
						 'height':$(document).height(),
						 'width':$(document).width()
						 })
				showNext();
				break;
				
			/*****SAVE DEMO*****/
			case "save" :
				$("#siteDEMO-save").trigger("click");
				$.getJSON(host+"WS/setDemo.ws.php?key="+apiKey+"&demo="+JSON.stringify(demo)+"&format=json&jsoncallback=?",
						  function(data){
							  alert(data)
						  }
				)
				break
		}
	},
	function(){// if clicked again (or done with the button) :
		$(".siteDEMO-button").data("selected",undefined)
		$(this).css({'border-color':'','border-style':''})
		elements.unbind();
		$(document,"body").unbind("scrollstop");
		$("a[href^=#link-],input[type=submit],input[type=button],button")
		.click(function() {return false; })
	}
)

//show next function
//shows the next slide in demo array, 
//triggered by defined trigger in demo, mouse click or timer
function showNext(){
	$("#siteDEMO-show").html("");//empty the box, to show the next slide
	$("#siteDEMO-message").hide();//hide the message box
	
	if(i<pageDemo.length){//make sure that we don't go further than number of slides
		if( typeof pageDemo[i][1] == 'number') pageDemo[i][1]= $('*').eq(pageDemo[i][1]);
		
		switch(pageDemo[i][0]){//get the type of slide
			/***** COMMENT *****/
			case "comment":
				$("#siteDEMO-message")//add the message to message box
					.show()
					.html(pageDemo[i][1]);
				callNext(pageDemo[i][2]);
				break;
				
			/***** TAGGING *****/
			case "tag":
				var original = $(pageDemo[i][1]);
				var element = clone(original,true);//copy the element
				var offset = element.offset();//get original element's offset
				var midPage= $(document).width()/2; ///get centre of page
				//place the message box according to position of
				//element relative to middle of page
				if(offset.left>midPage){
					$("#siteDEMO-message").css({'left':offset.left-165,
											   'top':offset.top,
											   'width':150
											   })
				}else{
					$("#siteDEMO-message").css({'left':offset.left+original.innerWidth()+10,
											   'top':offset.top,
											   'width':150
											   })
				}
				//add the tag
				$("#siteDEMO-message")
					.fadeIn('slow')
					.html(pageDemo[i][2]);
				callNext(pageDemo[i][3]);
				break;
				
			/***** CLICK *****/
			case "click":
				var original = $(pageDemo[i][1]);
				var href = original.attr('href');
				var element = clone(original);//copy the element
				var offset = original.offset();//get original element's offset
				var height = element.innerHeight();
				var width = element.innerWidth();
				//position of the mouse
				var cx = offset.left+width/2;
				var cy = offset.top + height/2;
				//add the mouse
				$("#siteDEMO-show")
					.append('<img style="position:absolute; left:'+cx+'px; top:'+cy+'px"'+
							'src="'+host+'icons/cursor.png" />');
				setTimeout("window.location = '"+href+"'",1000)
				callNext("mouse");
				break;
				
			/***** TYPE *****/
			case "type":
				var original = $(pageDemo[i][1])
				var element = clone(original);//copy the element
				element.val('');//empty it
				var offset = original.offset();//get original element's offset
				var textArray = pageDemo[i][2].split('');//make an array from input text
				var text = '';
				var j =0;//j is number of characters from text showed on the box
				$("#siteDEMO-show").append(element);
				element
					.css(offset)
					.css({"position":"absolute","margin":0});
				//typeWord function
				function typeWord(){
					if(j!=textArray.length){//if there's any character left, add it to the box
						text+=textArray[j];
						element.val(text);
						j++;
						setTimeout(typeWord,150);//show next character in 150 ms
					}else{//if no character left go to next slide
						callNext("mouse");
					}
				}
				typeWord();//call the function
				break;
				
			/***** SCROLL *****/
			case "scroll":
				var original = $(pageDemo[i][1]);
				if(original.get(0).tagName==undefined){
					//if tagName is undefined, it means we've scrolled on the actual page
					//and not it's elements, so we set element as body
					element = $('html, body');
					$("#siteDEMO-blind").hide();//so we show the whole page, to show scrolling
					setTimeout("$('#siteDEMO-blind').show();",2001);//and show the blind again after scrolling is finished
				}else{
					element = clone(original);
				}
				var top = pageDemo[i][2];//get the new position for scrolling to
				element.animate({scrollTop: top}, 2000);//animate scrolling for 2 seconds
				callNext("mouse");
				break;
				
			/***** USER CLICK *****/
			case "userClick":/***** EXPERIMENTAL *****/
				var element = clone(pageDemo[i][1]);
				var offset = pageDemo[i][1].offset();
				var midPage= $(document).width()/2;
				if(offset.left>midPage){
					$("#siteDEMO-message").css({'left':offset.left-165,
											   'top':offset.top,
											   'width':150
											   })
				}else{
					$("#siteDEMO-message").css({'left':offset.left+$(pageDemo[i][1]).innerWidth()+10,
											   'top':offset.top,
											   'width':150
											   })
				}
				$("#siteDEMO-message")
					.fadeIn('slow')
					.html('please click here');
				callNext(element);
				break;
				
			/***** USER TYPE *****/
			case "userType":/***** EXPERIMENTAL *****/
				var element = clone(pageDemo[i][1]);
				var offset = pageDemo[i][1].offset();
				var midPage= $(document).width()/2;
				if(offset.left>midPage){
					$("#siteDEMO-message").css({'left':offset.left-165,
											   'top':offset.top,
											   'width':150
											   })
				}else{
					$("#siteDEMO-message").css({'left':offset.left+$(pageDemo[i][1]).innerWidth()+10,
											   'top':offset.top,
											   'width':150
											   })
				}
				$("#siteDEMO-message")
					.fadeIn('slow')
					.html('please type here');
				callNext('mouse');
				break;
		}
	}else{
		//if there's no slide left, remove all boxs and reset iterator
		$("#siteDEMO-show,#siteDEMO-blind,#siteDEMO-message").remove();
		$("#siteDEMO-toolbar").show();
		i = 0;
	}
}

//call next function
//gets the trigger for next slide, and triggers it
//could be mouse click, or timer
function callNext(){
	var trig =arguments[0];
	i++;
	if(trig=="mouse"){
		$("#siteDEMO-show").one("click",function(){showNext()})
	}else{
		setTimeout("showNext()",trig*1000)
	}
}

//clone function
//customised for our purpose
//clones an element and adds it to show box
function clone(original){
	var element = original.clone(true);//clone the object with it's data and events
	var offset = original.offset();//get its offset
	
	// because clone() method doesn't copy element's style
	//we define an array of styles we want to retrive ...
	var styleList = ['background', 'border', 'outline','font-family','font-size','font-stretch','font-style','font-variant','font-weight', 'list-style', 'padding-top','padding-left', 'padding-right','padding-bottom','display', 'float','overflow', 'visibility', 'width', 'height', 'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'table-layout', 'color', 'direction','letter-spacing', 'line-height', 'text-align', 'text-decoration', 'text-indent', 'text-transform', 'vertical-align', 'white-space', 'word-spacing']
	var style = {'position':'absolute',"margin":0}// ... define an object of arrays ...
	//and for each style in style list we get its value and add it to style object
	$.each( styleList, function(i, property){
		style[property]= original.css(property)
	});
	
	//we also check for font color, and if it's dark
	//it will be defficult to read against the blind
	//so we change it to a lighter color
	if(arguments[1] == true){
		var rgb = style['color'].match(/\d+/g)
		$.each( rgb, function(j, c){
			rgb[j]= c<128? (128-c)*2 :c
		});
		style['color']='rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
	}
	
	jQuery.extend(style, offset);//add offset to style
	
	//if element is invisible due to scrolling
	if($('html,body').scrollTop()<offset.top||$('html,body').scrollTop()>(offset.top+element.innerHeight())){
		$('html,body').animate({scrollTop: (offset.top-10)}, 500)//we scroll it to element
	};
	
	$("#siteDEMO-show").append(element); // add the element to show box
	element.hide().css(style).fadeIn('slow');//fade in !
	
	return element;//return cloned element for further use
}