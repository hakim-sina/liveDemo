/*JQUERY PLUGINS*/

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


/*COMMON FUNCTIONS*/

//toolbar toggle
function toolbarToggle (){//if there's no toolbar, insert it
	if($('#liveDemo-toolbar').length == 0){ 
		$(document.body)
			.prepend(toolbar)
			.prepend(highlighter)
	//otherwise remove it
	}else{ 
		$('#liveDemo-toolbar').children().not('#liveDemoLogo').toggle('slow');
		//$('#liveDemo-highlighter').remove();
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
	
	$("#liveDemo-show").append(element); // add the element to show box
	element.hide().css(style).fadeIn('slow');//fade in !
	
	return element;//return cloned element for further use
}

//call next function
//gets the trigger for next slide, and triggers it
//could be mouse click, or timer
function callNext(){
	var trig =arguments[0];
	i++;
	if(trig=="mouse"){
		$("#liveDemo-show").one("click",function(){showNext()})
	}else{
		setTimeout("showNext()",trig*1000)
	}
}

//show next function
//shows the next slide in demo array, 
//triggered by defined trigger in demo, mouse click or timer
function showNext(){
	$("#liveDemo-show").html("");//empty the box, to show the next slide
	$("#liveDemo-message").hide();//hide the message box
	
	if(i<liveDemo.length){//make sure that we don't go further than number of slides
		if( typeof liveDemo[i][1] == 'number') liveDemo[i][1]= $('*').eq(liveDemo[i][1]);
		
		switch(liveDemo[i][0]){//get the type of slide
			/***** COMMENT *****/
			case "comment":
				$("#liveDemo-message")//add the message to message box
					.show()
					.html(liveDemo[i][1]);
				callNext(liveDemo[i][2]);
				break;
				
			/***** TAGGING *****/
			case "tag":
				var original = $(liveDemo[i][1]);
				var element = clone(original,true);//copy the element
				var offset = element.offset();//get original element's offset
				var midPage= $(document).width()/2; ///get centre of page
				//place the message box according to position of
				//element relative to middle of page
				if(offset.left>midPage){
					$("#liveDemo-message").css({'left':offset.left-165,
											   'top':offset.top,
											   'width':150
											   })
				}else{
					$("#liveDemo-message").css({'left':offset.left+original.innerWidth()+10,
											   'top':offset.top,
											   'width':150
											   })
				}
				//add the tag
				$("#liveDemo-message")
					.fadeIn('slow')
					.html(liveDemo[i][2]);
				callNext(liveDemo[i][3]);
				break;
				
			/***** CLICK *****/
			case "click":
				var original = $(liveDemo[i][1]);
				var href = original.attr('href');
				var element = clone(original);//copy the element
				var offset = original.offset();//get original element's offset
				var height = element.innerHeight();
				var width = element.innerWidth();
				//position of the mouse
				var cx = offset.left+width/2;
				var cy = offset.top + height/2;
				//add the mouse
				$("#liveDemo-show")
					.append('<img style="position:absolute; left:'+cx+'px; top:'+cy+'px"'+
							'src="'+host+'icons/cursor.png" />');
				setTimeout("window.location = '"+href+"'",1000)
				callNext("mouse");
				break;
				
			/***** TYPE *****/
			case "type":
				var original = $(liveDemo[i][1])
				var element = clone(original);//copy the element
				element.val('');//empty it
				var offset = original.offset();//get original element's offset
				var textArray = liveDemo[i][2].split('');//make an array from input text
				var text = '';
				var j =0;//j is number of characters from text showed on the box
				$("#liveDemo-show").append(element);
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
				var original = $(liveDemo[i][1]);
				if(original.get(0).tagName==undefined){
					//if tagName is undefined, it means we've scrolled on the actual page
					//and not it's elements, so we set element as body
					element = $('html, body');
					$("#liveDemo-blind").hide();//so we show the whole page, to show scrolling
					setTimeout("$('#liveDemo-blind').show();",2001);//and show the blind again after scrolling is finished
				}else{
					element = clone(original);
				}
				var top = liveDemo[i][2];//get the new position for scrolling to
				element.animate({scrollTop: top}, 2000);//animate scrolling for 2 seconds
				callNext("mouse");
				break;
				
			/***** USER CLICK *****/
			case "userClick":/***** EXPERIMENTAL *****/
				var element = clone(liveDemo[i][1]);
				var offset = liveDemo[i][1].offset();
				var midPage= $(document).width()/2;
				if(offset.left>midPage){
					$("#liveDemo-message").css({'left':offset.left-165,
											   'top':offset.top,
											   'width':150
											   })
				}else{
					$("#liveDemo-message").css({'left':offset.left+$(liveDemo[i][1]).innerWidth()+10,
											   'top':offset.top,
											   'width':150
											   })
				}
				$("#liveDemo-message")
					.fadeIn('slow')
					.html('please click here');
				callNext(element);
				break;
				
			/***** USER TYPE *****/
			case "userType":/***** EXPERIMENTAL *****/
				var element = clone(liveDemo[i][1]);
				var offset = liveDemo[i][1].offset();
				var midPage= $(document).width()/2;
				if(offset.left>midPage){
					$("#liveDemo-message").css({'left':offset.left-165,
											   'top':offset.top,
											   'width':150
											   })
				}else{
					$("#liveDemo-message").css({'left':offset.left+$(liveDemo[i][1]).innerWidth()+10,
											   'top':offset.top,
											   'width':150
											   })
				}
				$("#liveDemo-message")
					.fadeIn('slow')
					.html('please type here');
				callNext('mouse');
				break;
		}
	}else{
		//if there's no slide left, remove all boxs and reset iterator
		$("#liveDemo-show,#liveDemo-blind,#liveDemo-message").remove();
		$("#liveDemo-toolbar").show();
		i = 0;
	}
}

//demo variables
var apiKey = $.cookie('apiKey'),
	ver= 0.3,
	i =0,
	host = "http://localhost/livedemo/",
	path = window.location['pathname']+window.location['search']+window.location['hash'];
	
//disable default click events
$("a,input[type=submit],input[type=button],button").not('[href^=#]')
	/*.click(function() {
		return false;
	})*/
	//.attr("href",function(){return '#link-'+$(this).attr("href")})

//list handlers, needs more working --> only works for jquery now
//$('*').listHandlers('onclick', console.info)


//get demo
$.getJSON(host+"WS/getDemo.ws.php?key="+apiKey+"&format=json&jsoncallback=?",
		  function(data){
			 demo=data;
			 if(demo[path] == undefined) {demo[path]=[]};
			 liveDemo = demo[path];
		  }
)

//css
var cssLoc = host+"css/editor.css";
$('<link rel="stylesheet" type="text/css" href="'+cssLoc+'" >').appendTo("head");
 
//toolbar's html
var toolbar = 
'<div class="liveDemo" id="liveDemo-toolbar">'+
	'<img id="liveDemoLogo" class="liveDemo" src="'+host+'icons/icon.png"/>'+
	'<img class="liveDemo" src="'+host+'icons/separator.gif"/>'+
	'<img title="tag elements" class="liveDemo liveDemo-button" id="liveDemo-tag" src="'+host+'icons/tag.png"/>'+
	'<img title="comment" class="liveDemo liveDemo-button" id="liveDemo-comment" src="'+host+'icons/comment.png"/>'+
	'<img title="define an action" class="liveDemo liveDemo-button" id="liveDemo-action" src="'+host+'icons/action.png"/>'+
	'<img title="user reaction" class="liveDemo liveDemo-button" id="liveDemo-user" src="'+host+'icons/user.png"/>'+
	'<img class="liveDemo" src="'+host+'icons/separator.gif"/>'+
	'<img title="Story line" class="liveDemo liveDemo-button" id="liveDemo-edit" src="'+host+'icons/edit.png"/>'+
	'<img title="play" class="liveDemo liveDemo-button" id="liveDemo-play" src="'+host+'icons/play.png"/>'+
	'<img title="save" class="liveDemo liveDemo-button" id="liveDemo-save" src="'+host+'icons/save.png"/>'+
	'<img class="liveDemo" src="'+host+'icons/separator.gif"/>'+
	'<span class="liveDemo" id="liveDemo-selected"> </span>'+
'</div>';

//highlighter
var highlighter ='<div class="liveDemo transparent_class" id="liveDemo-highlighter"> </div>';

toolbarToggle();//load toolbar on page load
$("#liveDemoLogo").live('click',function(){toolbarToggle()})//toggle toolbar


//define selectable elements
var elements = $(document.body).find("*").not("body,.liveDemo");

//toolbar functions, 
//checks the clicked button, and performs their action
$(".liveDemo-button").toggle(
	function(){// on first click, do :
		var id = $(this).attr('id').substr(9); //find id of clicked button
		$(".liveDemo-button").data("selected",$(this).attr('id'))//set the selected button
		
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
								$("#liveDemo-highlighter")
									.css(position)
									.css({"height":height,"width":width})
									.show()
									.data("over",this);
								$("#liveDemo-selected").text(
															 '#'+$(this).attr('id')+
															 ' .'+$(this).attr('class') 
															 )
						},
						function () {
							setTimeout('$("#liveDemo-highlighter").hide();$("#liveDemo-selected").text("")',500)
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
							liveDemo[liveDemo.length]=["tag", index, tag, time];//add to demo
							$("#liveDemo-tag").trigger("click");
						}
				})
				//because user might click on the highlighter box, 
				//we set it's "over" data which tells us what it is on top of
				$("#liveDemo-highlighter")
					.live("click",
						  function(){
							  $($("#liveDemo-highlighter").data("over"))
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
					liveDemo[liveDemo.length]=["comment", comment, time];
					$("#liveDemo-comment").trigger("click");
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
							liveDemo[liveDemo.length]= [//and add it to demo
												'type',
												index,
												$(this).val()
												];
							$(this).data("changed",false);
							$("#liveDemo-action").trigger("click");
					})
					
				//record clicks
				elements.filter('a,input[type=submit],input[type=button],button')//only accept clickable elements
					.click(function(){
						var index = $(this).getPath();//element's global index
						liveDemo[liveDemo.length]= ['click',index];
						$("#liveDemo-action").trigger("click");
					})
					
				//record scrolling
				elements.add(document,"body")
					.one("scrollstop",function(){
						$(this).unbind("scrollstop");
						var index = $(this).getPath();//element's global index
						liveDemo[liveDemo.length]= ['scroll',index,$(this).scrollTop()];
						$("#liveDemo-action").trigger("click");
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
						liveDemo[liveDemo.length]= [
											'userType',
											this,
											$(this).val()
											];
						$(this).data("changed",false);
						$("#liveDemo-user").trigger("click");
					})
				//require clicking by user
				elements.filter('a,input[type=submit],input[type=button]')
					.click(function(){
						liveDemo[liveDemo.length]= ['userClick',this];
						$("#liveDemo-user").trigger("click");
					})
				break;
				
			/*****EDIT DEMO*****/
			case "edit"://edits demo array,--> remove, move up &down
				$("#liveDemo-edit").trigger("click");
				//setup demo editor layout
				$('body').append('<div class="transparent_class liveDemo" id="liveDemo-blind"> </div>'+
								 '<div class="liveDemo liveDemo-show" id="liveDemo-show">'+
									 '<table border="1" id="liveDemo-story" >'+
										 '<tr>'+
											 '<td>type</td>'+
											 '<td>element</td>'+
											 '<td>message</td>'+
											 '<td>trigger</td>'+
											 '<td class="liveDemo-button" id="liveDemo-closeStory"> [X] </td>'+
										 '</tr>'+
									 '</table>'+
								 '</div>'
								 );
				$("#liveDemo-blind, #liveDemo-show")
					.css({
						 'height':$(document).height(),
						 'width':$(document).width()
						 })
				$.each(liveDemo,//for each slide in demo :
						function(i,slide){
							element = $('*').eq(slide[1]);
							$('#liveDemo-story').append(//add a row to table
													   '<tr>'+
													   '<td>'+slide[0]+'</td>'+
													   '<td>.'+element.attr('class')+'#'+element.attr('id')+'</td>'+
													   '<td> </td>'+
													   '<td> </td>'+
													   '<td>'+
														   '<img class="liveDemo-button liveDemo-up" '+
														   'src="'+host+'icons/up.gif"/> <br/>'+
														   '<img class="liveDemo-button liveDemo-down"'+
														   'src="'+host+'icons/down.gif"/> <br/>'+
														   '<img class="liveDemo-button liveDemo-delete"'+
														   'src="'+host+'icons/delete.gif"/> <br/>'+
													   '</td>'+
													   '</tr>'
													   ) 
							//check to see if there's anything to add to 2nd and 3rd column
							if(slide[2]!=undefined)$('#liveDemo-story tr:last')
								.children('td:eq(2)').append(slide[2]);
							if(slide[3]!=undefined)$('#liveDemo-story tr:last')
								.children('td:eq(3)').append(slide[3]);
						}
				)
				
				$('#liveDemo-story tr:odd').css({'color':'black','background-color':'white'})//zebra color the table
				$("#liveDemo-story").center();//centre the table
				$('#liveDemo-story tr').hover(//on hover., highlight
					function(){$(this).css({'color':'black','background-color':'yellow'})},
					function(){
						$('#liveDemo-story tr:odd').css({'color':'black','background-color':'white'})
						$('#liveDemo-story tr:even').css({'color':'white','background-color':'black'})
					}
				)
				//demo editor buttons
				$("#liveDemo-closeStory")
					.one('click',function(event){
						event.stopPropagation();
						$("#liveDemo-show,#liveDemo-blind").remove();
					})
				$(".liveDemo-up")
					.click(function(){
						var row = $(this).parents('tr');
						var index = row.index()-1;
						row.prev('tr').before(row);
						var slide = liveDemo.splice(index,1);
						liveDemo.splice(index-1,0,slide[0]);
					})
				$(".liveDemo-down")
					.click(function(){
						var row = $(this).parents('tr');
						var index = row.index()-1;
						row.prev('tr').before(row);
						var slide = liveDemo.splice(index,1);
						liveDemo.splice(index+1,0,slide[0]);
					})
				$(".liveDemo-delete")
					.click(function(){
						var row = $(this).parents('tr');
						var index = row.index()-1;
						row.remove();
						var slide = liveDemo.splice(index,1);
					})
				break;
				
			/*****PREVIEW DEMO*****/
			case "play":
				$("#liveDemo-play").trigger("click");
				$("#liveDemo-toolbar").hide();
				//setup layout
				$('body').append('<div class="transparent_class liveDemo" id="liveDemo-blind"> </div>'+
								 '<div class="liveDemo" id="liveDemo-message"> </div>'+
								 '<div class="liveDemo" id="liveDemo-show"> </div>'
								 );
				$("#liveDemo-blind, #liveDemo-show")
					.css({
						 'height':$(document).height(),
						 'width':$(document).width()
						 })
				showNext();
				break;
				
			/*****SAVE DEMO*****/
			case "save" :
				$("#liveDemo-save").trigger("click");
				$.getJSON(host+"WS/setDemo.ws.php?key="+apiKey+"&demo="+JSON.stringify(demo)+"&format=json&jsoncallback=?",
						  function(data){
							  alert(data)
						  }
				)
				break
		}
	},
	function(){// if clicked again (or done with the button) :
		$(".liveDemo-button").data("selected",undefined)
		$(this).css({'border-color':'','border-style':''})
		elements.unbind();
		$(document,"body").unbind("scrollstop");
		$("a[href^=#link-],input[type=submit],input[type=button],button")
		.click(function() {return false; })
	}
)