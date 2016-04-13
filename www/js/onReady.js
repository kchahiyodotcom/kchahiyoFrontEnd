$(function() {
    var catagoryName;
    var subCatagoryName;

    window.onresize = function() {
        if ($('#leftPanel').css('width') != $("#page").css('width')) {
            
          
      		centerPanelWidth =  parseInt($('#mainPanel').css('width'))
             					- parseInt($('#leftPanel').css('width')) -
            					parseInt($('#rightAddDiv').css('width')) - 11 + 'px';

            console.log("this runs " + centerPanelWidth);
            $('#centerPanel').css('width', centerPanelWidth);
               


        } else {
        	console.log("ran");
            $('#centerPanel').css('width', parseInt($('#leftPanel').css('width')) - parseInt($('#rightAddDiv').css('width')) - 11 + 'px');
        }

        $(".event_banner")
                   .css("max-width", String($("#centerPanel").width()-30)+"px");
    };

    if (navigator.appVersion.indexOf("Mobile") > 0) {
        $("#headerPanel").prepend('<div id="headerMenu"> <img src="/img/Menu-Icon.jpg" id="sideBarMenuButton" width = "30px"/></div>');
        $("#sideBarMenuButton").sidr({
            side: "left",
            name: "sidr2"
        });
        $("#sideBarMenuButton").hide();
        $("#addPostButton").css('margin-top', 0);
        var button = $("#addPostButton")[0];
        $("#addPostButton").remove();
        $("#headerMenu").append(button);
        $("#leftPanel").css("display", "none");
        $("#filter_select").css("float", "left");
        $("#sidr2").html($("#leftPanel").html());
        $("#leftPanel").remove();
        jQuery.fx.off = true;
        $("#headerMenu img").width("40px");
    } else {
        window.onresize();
    }

     show_dialogBox_working = function (message) {
    	var closeButton = $("<span/>")
    									.css({	"position":"absolute", 
    											"top":"-3px", 
    											"right":"3px"})
    									.attr("class","Button b-close")
    									.append($("<span/>").html('X'))

    	var dialog = $("<div/>")
    						.attr("class","Panels content")
    						.css({	"width":"initial",
    								"padding-bottom":"5px",
    								"margin-left":"-11.7em",
    								"position":"absolute",
    								"top": String(window.screen.height/2) + "px",
    								"left": String(window.screen.width/2)  + "px",

    							})
    						
    						.append($("<div/>")
    										.css({"width":"20em", "height":"7em"})
    										.append($("<p/>")
    													.css({	"font-size": "1.2em", 
    															"color": "initial",
    														})
    													.html(message)))
    										
    						.append($("<div/>")
    										.css({ 
    												"height":"3em"
    											})
    										.append($("<div/>")
    													.css({	"margin-left":"auto", 
		    													"margin-right":"auto",
		    													"display":"table"
		    												})
    													.append(
		    												$("<input/>")
		    													.val("Ok")
		    													.attr({ "type":"submit", "class":"Button b-close"})
		    													.css({"width":"8em","height":"2em"})
    													)
    										)
    						)
    		$("body").append(dialog);
    		//dialog.bPopup();
    }

    show_dialogBox = function (message) {
    	var closeButton = $("<span/>")
    									.css({	"position":"absolute", 
    											"top":"-3px", 
    											"right":"3px"})
    									.attr("class","Button b-close")
    									.append($("<span/>").html('X'))

    	var dialog = $("<div/>")
    						.attr("class","Panels content")
    						.css({	"width":"20em",
    								"padding-bottom":"5px",
    								"margin-left":"-11.7em"})
    						
    						.append($("<div/>")
    										.css({"width":"20em", "height":"7em"})
    										.append($("<p/>")
    													.css({	"font-size": "1.2em", 
    															"color": "initial",
    														})
    													.html(message)))
    										
    						.append($("<div/>")
    										.css({ 
    												"height":"3em"
    											})
    										.append($("<div/>")
    													.css({	"margin-left":"auto", 
		    													"margin-right":"auto",
		    													"display":"table"
		    												})
    													.append(
		    												$("<input/>")
		    													.val("Ok")
		    													.attr({ "type":"submit", "class":"Button b-close"})
		    													.css({"width":"8em","height":"2em"})
    													)
    										)
    						)
    		dialog.bPopup();
    }


    $("#addPostButton").sidr({

        side: "right",
        name: "sidr1",
        source: "#sidr1"
    });


    function dataToFormattedPosts(data) {
        data = JSON.parse(data);
        if (data['title'] && data['posts']) {
            title = data["title"].toUpperCase();
            data = data['posts'];
            data = JSON.parse(data);
        }

        $("#panelGroup").empty();
        for (i = 0; i < data.length; i++) {
            $("#panelGroup").append(data[i]);
        }

        $("#postBoxheader")
            .empty()
            .append("<h2>" + title + " POSTINGS </h2>");
        $(".event_banner")
                   .css("max-width", String($("#centerPanel").width()-30)+"px");
         
        $(".item_pics") .css("cursor","pointer")
                        .click(function(){ 
                            var thumb = $(this).attr("src")
                            var fullsize = "/uploads/"+ thumb.substr(18);
                           var imgs =  $("<img/>") .attr("src", fullsize)
                                                    .css({  "max-width": $("#mainPanel").css("width"),
                                                            "max-height": "1024px"});
                                                    
                            var popup = $("<div/>") .attr("id", "wrapper")
                                                    .html($("<div/>")
                                                                .attr("class","content")
                                                                .html(imgs));
                            popup.bPopup({
                                content: 'image',
                                contentContainer: '.content',
                                loadUrl: fullsize
                            });
        });

        $(".postFooterButtons input").click(function() {
                postId = $(this).parents('.posts').attr('postid');

                $('#postComments' + postId).slideToggle('fast');

                $.ajax({
                    url: 'php/comment_operations.php',
                    type: 'POST',
                    data: {
                        'do': 'retrieve',
                        'postId': postId
                    },
                    context: this,
                    beforeSend: function() {
                        $("#commentsPost" + postId)
                            .empty()
                            .append('<img src ="img/ajax_loading.gif" style="display:block; margin-left:auto; margin-right:auto;" height="17px">');
                    }
                }).done(function(d) {
                        $('#postComments' + postId + ' .commentsWrapper').remove();
                        $('#commentsPost' + postId).empty()
                            .append(d)
                            .after(" <div class ='commentsWrapper' style='margin-right: 0.7em;'>" + "<h4>Any questions? Ask below :  </h4>" + "<textarea id='postComment" + postId + "'> </textarea>" + "<div class='commentBottons'>" + "<input type='submit' commentBoxId = " + postId + " id='postCommentButton' class='Button' value='Post'>" + " </div>" + "</div>");

                        $('#postCommentButton').click(function() {
							postId = $(this).attr('commentboxid');
		                    postComment = $("#postComment" + postId).val();
							$.post("/php/userOperations.php", {
								logged_in: ""
							}).done(function(data) {
								if (data.trim() == "true") {
									if($("#postComment"+postId).val().trim() != ""){
	                            
										$.ajax({
				                            url: 'php/comment_operations.php',
				                            type: 'POST',
				                            data: {
				                                'do': 'create',
				                                'comment': postComment,
				                                'postId': postId
				                            }
				                        }).done(function(d) {
				                            $('#commentsPost' + postId)
				                                .append(d);
				                            $('#postComment' + postId).val('');
											$('.commentMenu').click(function() {  
				                                $id = $(this)
				                                    .parent()
				                                    .parent()
				                                    .attr('commentId');
				                                $.ajax({
				                                    url: 'php/comment_operations.php',
				                                    type: 'POST',
				                                    data: {
				                                        'do': 'remove',
				                                        'commentId': $id
				                                    }
				                                }).done(function(d) {
														$('.commentPost[commentid='+$id+']').slideUp().remove();
				                                });
												return false;
				                            });
				                        });
									}
								}
								else{
									show_dialogBox('Please login to post comments!');
								}
							});                        
						});
                           

                            $('.commentMenu').click(function() {  
                                $id = $(this)
                                    .parent()
                                    .parent()
                                    .attr('commentId');
                                $.ajax({
                                    url: 'php/comment_operations.php',
                                    type: 'POST',
                                    data: {
                                        'do': 'remove',
                                        'commentId': $id
                                    }
                                }).done(function(d) {
                                   	$('.commentPost[commentid='+$id+']').slideUp().remove();
									show_dialogBox('Your comment has been removed!');
                                });
                                return false;
                            });

                        });
                    });
    return false;
}

function insert_post_diag(message) {

    var message = $("<p/>").text(message);
    var success_box = $("<div/>").attr("id", "success_diag")
        .addClass("Panels")
        .css({
            height: "50px",
            position: "fixed",
            top: document.height / 2 - 200 + "px",
            left: document.width + "px",
            overflow: "hidden",
            'z-index': "99999"})
        .html(message);

    success_box.appendTo("#headerPanel").animate({
        "left": "-=0px"
    }, "easeOutBounce");

    setTimeout(function() {
        $("#success_diag").animate({
            "left": "+=300px"
        }, 500, "easeInOutElastic", function() {
            $(this).remove();
        });
    }, 2000);
}

function states_viewer(firstTime) {
    $.post("php/city_viewer.php").done(function(data) {
        $("#city_select").empty();

        var states = JSON.parse(data);

        for (var i = 0; i < states.length; i++) {
            $("#city_select").append('<li class = "link_wrapper" style="width : 170px; height: 30px; display: inline-block;"><a class="states"  href="#" value="' + states[i] + '">' + states[i] + '</a></li>');
        }

        if ($("#choice_wrapper").length === 0) {
            var wrapper = $("<div/>").attr({
                    class: 'Panels',
                    id: 'choice_wrapper'
                })
                .css({
                    "display": "inline-block",
                    "margin-top": "20px"
                })
                .hide();
        }

        $("#city_select")
            .wrap(wrapper)
            .css({
                "margin-left": "auto",
                "margin-right": "auto",
                display: "inline-block",
                width: "95%",
                float: "right"
            })
            .prepend('<h3> Select Your State: </h3>');

        if (firstTime) {
            $("#choice_wrapper").show();
            $("#welcome_header").css("display","block");
           
        } else {
            $("#choice_wrapper").show("blind", {
                direction: "up"
            });
        }

        if ($(document).on("click", "#back_button", function() {
        $("#city_select").hide('slide', {
            direction: 'right'
        }, 'fast').empty().show('slide', {
            direction: 'left'
        }, 'fast');
        states_viewer();

    }));

        $(".states").on("click", function() {
            $("#welcome_header").slideUp();
            show_cities(this);
            $.cookie('state', $(this).text(), {
                expires: 2,
                path: '/'
            });
        });

        return true;
    });
    return true;
}

function show_cities(state) {
    $.post("php/city_viewer.php", {
        temp_state: $(state).text()
    }).done(function(data) {
        var cities = JSON.parse(data);
        $("#city_select")
                .hide(  'slide', 
                        {direction: 'left'}, 
                        "fast", 
                        function() {

                            $(this).empty();
                            for (var i = 0; i < cities.length; i++) {
                                        var city_names= $("<a/>")
                                                            .attr({"class":"cities",
                                                                    "href":"#",
                                                                    "value":cities[i]})
                                                            .html(cities[i])
                                                            .click(
                                                                    function() {
                                                                        $.cookie('city', $(this).text(), 
                                                                            {
                                                                                expires: 2,
                                                                                path: '/'
                                                                            }
                                                                        );

                                                                        $("#city_select")
                                                                                .unwrap()
                                                                                .empty()
                                                                                .append(
                                                                                        $("<a/>")
                                                                                            .attr({ 
                                                                                                    "id":"location_info",
                                                                                                    "cursor":"pointer"
                                                                                                })
                                                                                            .html($.cookie("state") + '->' + $.cookie("city"))
                                                                                        )
                                                                                .css("width", "100%");

                                                                        $("#addPostButton, #container, #sideBarMenuButton, #centerPanel")
                                                                                .show('fade', 'fast');
                                                                        $.cookie('catagoryOrSubCatagory', 'catagory');
                                                                        $.cookie('catagoryOrSubCatagoryName', 'home');
                                                                        $.cookie("catagoryName", 'home');
                                                                        $.cookie("page", "postingsPage");
                                                                        list_sub_catagories();
                                                                        $('.menu-bar')[0].click();
                                                                        
                                                                        
                                                                    }                                     
                                                            );

                                        var city =  $("<li/>")  
                                                        .attr("class","link_wrapper")
                                                        .css({  "width":"170px",
                                                                "height":"30px",
                                                                "display":"inline-block"})
                                                        .append(
                                                            city_names
                                                        );

                                    $(this).append(city);
                            }

                            $(this)
                                .prepend(   '<h3>Select Your Nearest City: '+
                                                '<span type="button" class="Button" id="back_button" style="float: right; margin-right:15px;">'+ 
                                                    'Back'+
                                                '</span>'+
                                            '</h3>')

                                .css("line-height", "25px");

                            $(this).show('slide', {
                                direction: 'right'
                            }, "fast");

                        });

        return false;
    });
    return false;
}
var postingsPage = function() {
    $.cookie('page', 'postingsPage');

    $("#addPostButton").show('fade', 'fast', function() {
        $('#sideBarMenuButton').show();
        $("#location_info").remove();
        $("#container,#mainPanel, #footerPanel, #nav, #sub-catagories-panel, #filter-panel, #city_select").show('slide', {
            direction: 'right',
            speed: 'fast'
        });
    });
    $("#city_select").append('<a href="#" id="location_info" style="margin-bottom : 4px; float: left;"  >' + $.cookie("state") + '->' + $.cookie("city") + ' </a>');
    list_sub_catagories($.cookie('catagoryName'));
    getPosts();

    $(".menu-bar").each(function() {

        if ($(this).text() == $.cookie('catagoryName'))

            $(this).css({
            "background": "#4873b1",
            "-webkit-border-radius": "3px"
        });
    });

    $("#pageNav").load("php/page_nav.php");
};

var profilePage = function() {
    if ($("#profilePageLink").text() == 'Back to all Postings') {
        $("#profilePageLink").text('Your Postings');
        postingsPage();

    } else {
        $.cookie('page', 'profilePage');
        $.ajax({
            url: "php/userPage.php",
            type: "post",
            data: {
                'request': 'view_posts'
            }
        }).done(function(data) {
            dataToFormattedPosts(data);
            $(" #sub-catagories-panel, #nav, #footerPanel, #addPostButton, #filter-panel, #city_select").slideUp('fast');

            $("#profilePageLink").text('Back to all Postings');
            $(".Delete-Button").click(function() {
                id = $(this).attr('postid')
                $.ajax({
                    url: 'php/postInfo.php',
                    data: {
                        postid: id,
                        delete: true
                    },
                    type: 'POST',
                    context: document.getElementById('post' + id)
                }).done(function(d) {
                    show_dialogBox(d);
                    $("#post" + id).slideUp();
                });
            });
        });
    }
};









function populatePosts(its_name) {
    $.post("php/allPosts.php", {
        catagory_or_sub_catagory: 'sub_catagory',
        value: its_name,
        beforeSend: function() {
            $("#navigationBar").empty()
                .append('<img src ="img/ajax_loading.gif" style="display:block; margin-left:auto; margin-right:auto;" height="17px">');
        }
    }).done(
        function(data) {
            dataToFormattedPosts(data);
            $("#navigationBar").empty();
        });
}

function getPosts(catagoryOrSubCatagory, callingElement) {
    


    var tabindex = $(callingElement).attr("tabindex");
    var its_name = $(callingElement).text();

    if (!callingElement) {
        catagoryOrSubCatagory = $.cookie('catagoryOrSubCatagory');
        its_name = $.cookie('catagoryOrSubCatagoryName');
    } else {
        //if calling element is known
        $.cookie('catagoryOrSubCatagory', catagoryOrSubCatagory);
        $.cookie('catagoryOrSubCatagoryName', its_name);
    }

    $.post("php/allPosts.php", {
        catagory_or_sub_catagory: catagoryOrSubCatagory,
        value: its_name,
        beforeSend: function() {
            $("#navigationBar").empty();
            $("#navigationBar").append('<img src ="img/ajax_loading.gif" style="display:block; margin-left:auto; margin-right:auto;" height="17px">');
        }
    }).done(
        function(data) {
            window.onresize();
            if (catagoryOrSubCatagory == "catagory") {
                if (!window.tabindex || tabindex > window.tabindex)
                    $("#mainPanel").hide('slide', {
                        direction: 'left'
                    }, 100, function() {
                        dataToFormattedPosts(data);
                        window.tabindex = tabindex;
                        $("#mainPanel").show('slide', {
                            direction: 'right'
                        }, 200);
                    });
                else {
                    $("#mainPanel").hide('slide', {
                        direction: 'right'
                    }, 100, function() {
                        dataToFormattedPosts(data);
                        window.tabindex = tabindex;
                        $("#mainPanel").show('slide', {
                            direction: 'left'
                        }, 200);
                    });
                }

                if (callingElement)
                    $(".menu-bar").css("background", "none");
                $(callingElement).css({
                    "background": "#4873b1",
                    "-webkit-border-radius": "3px"
                });
                
            } else {

                dataToFormattedPosts(data);
            }

            $("#pageNav").load("php/page_nav.php");
            $("#navigationBar").empty();
        }
    );

}


////////////////////
/*menu bar*/ ////////
///\/\////////////////
///\///\//////////////
////////////////////

$(".menu-bar").click(function() {
    var catagoryName = $(this).text();


    list_sub_catagories(catagoryName); // lists sub-catagories for the menu clicked 
    getPosts("catagory", this); // animate = true;
    $.cookie("catagoryName", catagoryName);
    $.cookie("subCatagoryName", "");
    return false;
});

/*left catagories */

function list_sub_catagories(catagory) {

    !catagory ? catagory = 'home' : catagory = catagory; /* if catagory  ='undefined' then catagory = 'home'*/
    $.post("php/sub_catagories.php", {
        catagory: catagory,
        beforeSend: function() {
            $("#navigationBar").empty();
            $("#navigationBar").append('<img src ="img/ajax_loading.gif" style="display:block; margin-left:auto; margin-right:auto;" height="17px">');
        }
    }).done(function(data) {
        var catagory = JSON.parse(data);
        $("#sub-catagories").empty();
        for (var i = 0; i < catagory.length; i++) {
            $("#sub-catagories").append("<li class=\"optionList\" ><a class=\"optionListLink\" enable=\"false\" href=\"#\">" + catagory[i] + "</a></li>");
        }
        $("#sub-catagories li").hide();
        var speed = 50;
        $("#sub-catagories li").first().show("drop", {
            direction: "up"
        }, speed, function showNext() {
            $(this).next("#sub-catagories li").show("fade", {
                direction: "up"
            }, speed, showNext);
        });

        $(".optionListLink").click(function() {
            $(".optionListLink").attr("enable", "false");
            $(".optionListLink").css({
                color: "#0864A7",
                "background-color": "transparent"
            });
            $(this).attr("enable", "true");
            $(this).css({
                color: 'white',
                'background-color': "#212B3B"
            });
            getPosts("sub_catagory", this);
            $.cookie("subCatagoryName", $(this).text());
            return false;
        });
        $(".optionListLink").each(function() {
            if ($(this).text() != null && $(this).text().toLowerCase() == $.cookie('subCatagoryName').toLowerCase())
                $(this).css({
                    color: 'white',
                    'background-color': "#212B3B"
                });
        });

        return false;
    });
}


$(document).on("mouseover", ".optionListLink", function(e) {
    $(this).css({
        color: 'white',
        'background-color': "#212B3B"
    });

    $(this).animate({
        "margin-left": "20px"
    }, 200);
    return false;
});

$(document).on("mouseleave", ".optionListLink", function(e) {

    if ($(this).attr("enable") == "false") {
        $(this).css({
            color: "#0864A7",
            "background-color": "transparent"
        });
    }
    $(this).animate({
        "margin-left": "0px"
    }, 200);
    return false;
});

//page navigation 
$(document).on("click", ".page-num", function() {
    //here 'to' is no of data from 'from'
    $(".page-num").css("color", "white");
    $(this).css("color", "red");
    clickedButton = $(this).text();

    var start = (clickedButton - 1) * 11;
    $.post("php/page_navigation.php", {
        from: start
    }).done(function(data) {

        dataToFormattedPosts(data, true);
    });
    return false;
});

/*left catagories finish*/

$(document).on("click", "#location_info", function() {
    states_viewer();
    $("#mainPanel").hide();
    $("#container").hide();
});



//submit function

/*
  Below we include the Login Button social plugin. This button uses the JavaScript SDK to
  present a graphical Login button that triggers the FB.login() function when clicked.

  Learn more about options for the login button plugin:
  /docs/reference/plugins/login/ 
*/
// Additional initialization code such as adding Event Listeners goes here
// Here we subscribe to the auth.authResponseChange JavaScript event. This event is fired
// for any authentication related change, such as login, logout or session refresh. This means that
// whenever someone who was previously logged out tries to log in again, the correct case below 
// will be handled. 

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=565185846853585&version=v2.0";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


window.fbAsyncInit = function() {
    FB.init({
        appId: 565185846853585,
        cookie: true, // enable cookies to allow the server to access 
        // the session
        xfbml: true, // parse social plugins on this page
        version: 'v2.0' // use version 2.0
    });
}




$("#facebook-login-button").click(function() {
    $("#facebook-login-button").append('<img src ="img/ajax_loading.gif" id="loading-gif" style="display:block; margin-left:auto; margin-right:auto; position: absolute; top:'+($(this).height())/2+'px; left: '+($(this).width())/2+'px;" height="17px">');
    FB.getLoginStatus(function(response) {
        // Here we specify what we do with the response anytime this event occurs.
         
        if (response.status === 'connected') {
            // The response object is returned with a status field that lets the app know the current
            // login status of the person. In this case, we're handling the situation where they 
            // have logged in to the app.

            facebookLogin();
        } else if (response.status === 'unknown' || response.status === 'not_authorized') {
            // In this case, the person is logged into Facebook, but not into the app, so we call
            // FB.login() to prompt them to do so. 
            // In real-life usage, you wouldn't want to immediately prompt someone to login 
            // like this, for two reasons:
            // (1) JavaScript created popup windows are blocked by most browsers unless they 
            // result from direct interaction from people using the app (such as a mouse click)
            // (2) it is a bad experience to be continually prompted to login upon page load.
            FB.login(function(response) {
                if (response.authResponse)
                    facebookLogin();
            });

        } else {
            // In this case, the person is not logged into Facebook, so we call the login() 
            // function to prompt them to do so. Note that at this stage there is no indication
            // of whether they are logged into the app. If they aren't then they'll see the Login
            // dialog right after they log in to Facebook. 
            // The same caveats as above apply to the FB.login() call here.
            fLogOff();
        }
        $("#loading-gif").remove();
    });
});

function facebookLogin() {

    FB.api('/me', function(response) {
        if (response) {
            var does = $("#loginButton").attr("does");
            login["facebook_login"] = response;
            $.ajax({
                url: "php/userOperations.php",
                type: "post",
                data: login,
                dataType: 'json'
            }).done(function(data) {
                setupLoginDiv(data, false);
            });
        }
    });

    return false;
}

function login() {
    var does = $("#loginButton").attr("does");
    $.ajax({
        url: "php/userOperations.php",
        data: $("#loginForm").serialize() + "&does=" + does,
        type: 'post',
        dataType: 'json'
    }).done(function(data) {
        setupLoginDiv(data, false);
    }); //done function
    return false;
}

$.ajax({
    url: "php/userOperations.php",
    type: "post",
    data: {
        "login_status": " "
    },
    dataType: 'json'
}).done(function(data) {
    setupLoginDiv(data, true);
});

function setupLoginDiv(data, firstTime) {

    if (data != null) {
        $("#loginFormDiv").show();

        if (data.userFound) {
            $("#facebook-div").hide();
            $("#sign_up_error").remove();
            $("#loginFormDiv").slideUp("fast");

            $("#loginButton").attr("does", "logOff")
                .attr("value", "Log Off");
            $("#userGreeter").empty()
                .append(" Welcome, " + data.userName + "!<br><a href='#' id ='profilePageLink'>Your Postings</a>")
                .show();
            $('#profilePageLink').click(profilePage);

            //error because it's post not ajax
        } else if (data.userLoggedOff) {
            $("#facebook-div").show();
            $("#userGreeter").hide();
            $("#username, #password").val("");

            $("#loginButton").attr({
                does: "login",
                value: "Login"
            });

            $("#loginFormDiv").show();

            if ($.cookie('page') == 'profilePage')
                postingsPage();

        } else if (data.userNotFound && !firstTime) {
            $("#sign_up_error").remove();
            $(".ui-effects-wrapper").remove();
            var sign_up_error = $("<p/>").text("username or password invalid!")
                .attr("id", "sign_up_error")
                .css("color", "red")
                .hide();

            sign_up_error.insertAfter("#loginFormDiv").show("drop", {
                direction: "up"
            });
        }
    }
    return false;
}

$("#loginForm").submit(login); //submit function	

$("#zipSubmit").click(function() {
    $("#locationInfo, #zip-error-message").remove();
    if ($(this).val() == "Ok") {
        $.post("php/city_state_finder.php",
            $("#zipCode").serialize()).done(
            function(data) {
                $("#zipSubmit").before(data);
            });

    } else {
        $("#zipCode").slideDown("fast");
        $(this).val("Ok");
    }
});



/*signup*/
$("#captcha-code").removeAttr("style");

$('img#captcha-refresh').click(function() {

    document.getElementById('captcha').src = "php/get_captcha.php?rnd=" + Math.random();
});


function post_to_the_facebook_wall(content){
    FB.api('/308493542648386/feed', 'post', {message : content + "\n view www.k-chahiyo.com for details"},function(){show_dialogBox("your post has been posted")});
}


$("#addPostButton").click(function() {
        $.post("/php/userOperations.php", {
        logged_in: ""
    }).done(function(data) {
        if (data.trim() !== "true") {
			
			$.sidr(	"close", "sidr1");
			show_dialogBox("please log in to post");

        } else {

            $("#catagoriesOption").change(function() {

                catagory = $(this).val();
              //  if(catagory == "Items Sale", ""){
                    $("#image_uploader_section").show();
               // }
              /*  else{
                    $("#image_uploader_section").hide();
                }*/

                $.post("php/sub_catagories.php", {
                    catagory: catagory
                }).done(function(data) {
                    var sub_catagory = JSON.parse(data);

                    $("#subCatagoriesOption, #sub-catagories-option").remove();
                    if (sub_catagory[0] != 'empty') {
                        postLabel =         $("<label/>")
                                                        .attr({ "class":"postLabel", 
                                                                "id":"sub-catagories-option"})
                                                        .css("display","block")
                                                        .html("Sub-Catagory");

                        subCatagoriesSelect = $("<select/>")
                                                        .attr({"id":"subCatagoriesOption", "class":"options", "name":"subCatagoriesOption"})
                                                        .css("display","block");
                        subCatagoryDiv = $("<div/>")
                                            .attr("id","subCatagorySection")
                                            .append(postLabel)
                                            .append(subCatagoriesSelect);


                        $("#catagoriesOption").after(subCatagoryDiv);

                        $("#subCatagoriesOption").append("<option value=\"\">Choose Sub-catagory</option>");

                        $("#subCatagoriesOption, #sub-catagories-option")
                                .hide()
                                .show("fade", "slow");


                        for (var i = 0; i < sub_catagory.length; i++) {
                            $('#subCatagoriesOption').append("<option value=\"" + sub_catagory[i] + "\">" + sub_catagory[i] + "</option>");
                        }
                    }
                    return false;



                });
            });

            $("#state").change(function() {
                state_name = $(this).val();
                $.post("php/city_viewer.php", {
                    temp_state: state_name
                }).done(function(data) {
                    var cities = JSON.parse(data);

                    $('#cities_options').remove();
                    var cities_option = $("<span/>")
                        .html('<label class="postLabel" id="cities_option_label" style="display:block;">Cities</label>' +
                            "<select name=\"cities_option\" id=\"cities_option\" class=\"options\"></select>")
                        .hide()
                        .attr("id", "cities_options");

                    cities_option.insertAfter("#state").show("fade", "slow");


                    $("#cities_option").append("<option value=\"\">Choose city:</option>");

                    for (var i = 0; i < cities.length; i++) {
                        $('#cities_option').append("<option value=\"" + cities[i] + "\">" + cities[i] + "</option>");
                    }
                });
            });


            //if logged in
            //add focusout to zipBox
            $("#zip-codeBox").focusout(function() {
                var zip = $(this).val();
                $.post("php/city_state_finder.php", {
                    "zip-city": zip
                }).done(function(data) {
                    $("#city_name_label").remove();
                    var city = $("<span/>").text(data)
                        .css("color", "#DDD")
                        .attr("id", "city_name_label")
                        .insertAfter("#zip-codeBox");
                });
            });
            // clear default textbox value when clicked
            $(".textBox, .inputBox").focus(function() {
                if ($(this).val() == $(this).attr("default"))
                    $(this).val("");
            });

            $(".textBox,.inputBox").focusout(function() {
                if ($(this).val().trim() == "") {
                    var value = $(this).attr("default");
                    $(this).val(value);
                }
            });

            $("#inputPostForm").submit(function(e) {
                //if($.cookie('id') && $.cookie('Username')){
                var valid = true;
                $("#inputPostForm p").empty();
                $("#sidr1 .inputBox, #sidr1 .textBox, #sidr1 .options").each(function() {
                    if ($(this).val() == "" || $(this).val() == $(this).attr("default")) {
                        if ($(this).is("input") || $(this).is("textarea")) {
                            $(this).after("<p class=\"form-validation-errors\" style=\"color: red; font-style: italic;\">This cannot be empty </p>");
                        } else
                            $(this).after("<p class=\"form-validation-errors\" style=\"color: red; font-style: italic;\">please select an option </p>");

                        valid = false;
                    }
                });

                if ($("#city_name_label").text().trim() === "invalid zip") {
                    valid = false;
                    $("#city_name_label").after("<p class=\"form-validation-errors\" style=\"color: red; font-style: italic;\">Please enter a valid Zip first </p>");
                }

                if (valid == true) {
                    var title = $("#inputBox").val();
                    var city = $("#cities_option").val();
                    var catagory = $("#catagoriesOption").val();
                    var subCatagory = $("#subCatagoriesOption").val();

                    city = city.charAt(0).toUpperCase() + city.slice(1);
                    var state = $("#state").val();
                    var content = title +"\n\n" +"Catagory : " +catagory +"\nSub-catagories : "+ subCatagory +"\n"+ city + ", " + state ;
                    allData = new FormData($("#inputPostForm")[0]);
                    allData.append('post_id', window.uniquePostIdForImage);
                    allData.append('post_city', $('#city_name_label').text().trim());
                    $.ajax({
                        url: "php/insert_post.php",
                        data: allData,
                        type: "post",
                        contentType: false,
                        cache: false,
                        processData: false,
                        beforeSend: function(){$(".postForm").prop("disabled", true);}
                    })
                    .done(
                        function(data) {
                            data = $.trim(data);

                            if (data == "true") {
                                
                                post_to_the_facebook_wall(content);
                                subCatagory = $("#subCatagoriesOption").val();
                                populatePosts(subCatagory);
                                $(".sidr-inner inputBox, .sidr-inner select, .sidr-inner textarea, .sidr-inner .textBox").val("");
                                $("#city_name_label").text("");
                                $(".uploaded_images").remove();
                                $.sidr("close", "sidr1");
                            } else {
                                show_dialogBox('an error occured');
                            }

                            return false;
                        });
                }

                return false;
            });
            
            $("#upfile").change(function() {
                        
                    var no_of_file = this.files.length;

                    for(var i = 0; i < no_of_file; i ++){
                        var frm = new FormData();
                        frm.append("post_id", window.uniquePostIdForImage);
                        frm.append("upfile[]", this.files[i]);
                        console.log( i + "files uploded " + "total no of files " + no_of_file);
                    
                    $.ajax({
                        url: "/php/image_uploader.php",
                        type: "POST",
                        data: frm,
                        contentType: false,
                        cache: false,
                        processData: false,
                        beforeSend: function(){ $("#image_upload_button").append('<img src ="img/ajax_loading.gif" id="loading-gif" style="display:block; margin-left:auto; margin-right:auto; position: absolute; top: 15px; left: 15px;" height="17px">')}
                    })
                    .fail(function(){
                        alert("error one image couldn't be upladed");
                    })
                    .always(function (){
                         $("#loading-gif").remove();
                    })
                    .done(function(e){
                        if(JSON.parse(e)["status"] == "success"){
                            var srcs = JSON.parse(e).files;
                                console.log(srcs);
                           // for(var i = 0; i < srcs.length; i ++){
                                var image = $("<img/>")
                                            .css({  "width": "50px", 
                                                    "height": "50px", 
                                                    "margin-left": "2px", 
                                                    "margin-right": "2px",
                                                    "image-orientation": "from-image"})
                                            .mouseover(function(){ $(this).css("opacity" ,"0.7")})
                                            .mouseout(function(){ $(this).css("opacity", "1")})
                                            .attr({"class": "uploaded_images","src":"uploads/thumbs/"+ ""+srcs});

                                var remove_button = $("<a/>")
                                                        .html("X")
                                                        .css({  "position":"absolute", 
                                                                "top":"0em",
                                                                "left":"1.7em",
                                                                "color" : "white",
                                                                "cursor": "pointer",
                                                                "opacity": ".7"})
                                                        .mouseover(function(){
                                                            $(this).css("opacity","1");
                                                        })
                                                        .mouseout(function(){
                                                            $(this).css("opacity",".7");
                                                        })
                                                        .data("parent",srcs)
                                                        .click(function(e){
                                                            filename = $(this).data('parent');
                                                            $.ajax({
                                                                url :"/php/image_operation.php",
                                                                type: "POST",
                                                                data :{"do": "remove", "filename":filename},
                                                                context: this
                                                            }).done(function(){
                                                                $($(this)[0].parentNode).slideUp().remove();
                                                                
                                                            })
                                                        });

                                var wrapper = $("<div/>").css({"display":"inline-block", "position": "relative"}).html(image).append(remove_button);

                                $("#image_gallery").append(wrapper);
                            //}
                        }     
                       
                    });
				}
            });
             $("#image_upload_button").click(function(){$("#upfile").click()});
        }
    window.uniquePostIdForImage = getRandomInt(1, 1000000000);
    return false;
    });
});

$(document).click(function(e) {
    var container = $("#sidr1");
    var container1 = $("#addPostButton");
    var container2 = $("#sideBarMenuButton");
    if (!container.is(e.target) &&
        container.has(e.target).length === 0 && 
        !container1.is(e.target)&&
        !container2.is(e.target)) {

            $.sidr("close", "sidr1");
            $.sidr("close", "sidr2");
    }

});



sfHover = function() {
    var sfEls = document.getElementById("nav").getElementsByTagName("LI");
    for (var i = 0; i < sfEls.length; i++) {
        sfEls[i].onmouseover = function() {
            this.className += " sfhover";
        };
        sfEls[i].onmouseout = function() {
            this.className = this.className.replace(new RegExp(" sfhover\\b"), "");
        };
    }
};
if (window.attachEvent) window.attachEvent("onload", sfHover);



//show nearest cities	


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$("#imageUploader").change(function() {

    window.uniquePostIdForImage = getRandomInt(1, 1000000);

    var rand = getRandomInt(1, 1000000);
    var filePath = $(this).val();
    index = filePath.lastIndexOf("\\");
    fileNameAndExtension = filePath.substring(index + 1);
    fileName = fileNameAndExtension.split(".")[0];
    extension = fileNameAndExtension.split(".")[1];

});




/*signUp validation starts*/
$("#signUpButton").click(function(e) {
    $.post("php/userOperations.php", {
        logged_in: ""
    }, function(data) {
        status = JSON.parse(data);
        if (status == 'true') {
            show_dialogBox("Logout before signing up for a new user account!");
        } else {
            //on success                
            $.sidr('sidr2', 'close');
            $('#SignUpFormDiv').bPopup();
            //starts
            $(".form-validation-errors").css("display", "none");
            var password_match = false;
            $(".required").blur(function() {
                var element_name = $(this).attr("id");
                var id = "#error-" + element_name;
                if ($(this).val() == "" && element_name != "dobPicker") {
                    $(id).css("display", "block");
                } else {
                    if (element_name == "email") {
                        var re = /\S+@\S+\.\S+/;
                        if (!re.test($(this).val())) {
                            $(id).css("display", "block");
                        } else {
                            $(id).css("display", "none");
                            //right here start email validation
                            var value = $(this).val();
                            $.ajax({
                                url: 'php/userOperations.php',
                                type: 'post',
                                data: {
                                    'email_valid': value
                                }
                            }).done(function(d) {
                                if (d > 0) {
                                    show_dialogBox('Please try another email address, \n this has been taken already');
                                    $('#' + element_name).val('');
                                }
                            });

                        }
                    } else if (element_name == "password_2") {
                        if ($("#password_1").val() != $("#password_2").val() && $("#password_1").val() != "") {
                            $(id).css("display", "block");
                        } else {
                            $(id).css("display", "none");
                            password_match = true;
                        }
                    } else {
                        $(id).css("display", "none");
                    }
                }
            });

            $("#sign-up-submit-button").click(function() {
                var valid = true;
                $(".required").each(function() {
                    var element_name = $(this).attr("id");
                    var id = "#error-" + element_name;
                    if ($(this).val() == "") {
                        valid = false;
                        $(id).css("display", "block");

                    }
                });
                if (valid && password_match) {
                    $.post("php/userOperations.php?does=create_user",
                        $("#SignUpForm").serialize()).done(function(data) {

                        data = jQuery.parseJSON(data);

                        if (data.success == "true") {
                            $(".required").val("");
                            show_dialogBox("A confirmation email has been sent to your email address. Please, click the link to activate your account.");
                            $('#SignUpFormDiv').bPopup().close();
                        } else {
                            show_dialogBox("fail");
                        }
                    });
                }
                return false;
            });
            //ends
        }
    });


    return false;
});


/*signUp validation ends*/

function filter_Option() {
    $("#filter-wrapper")
        .remove()
        .hide();
    $("#datePanel").hide();

    if ($(this).val() == "Zip-code") {
        $("#datePanel").hide("slide");
        var filterPanel = '<span id="filter-wrapper" style="display: inline-block;">' +
            '<form id="filter-form">' +

            '<label>Enter Zip </label>' +
            '<input id="zip-input-box" type="text" class="textBox"/>' +
            '<input id="zip-filter-button\" type=\"submit\" style="height:25px; margin-left: 10px;" type="submit" class="Button" value="Filter"/>' +
            '<div style="display:inline-block;margin-left: 5px;">' +
            '<select id="filter-type" >' +
            '<option value="exact_zip">Matching Exactly</option>' +
            '<option value="nearest_zip">Nearest From</option>' +
            '</select></div>' +

            '</form></span>';

        $("#filter-form").remove();


    } else if ($(this).val() == "Title") {
        var filterPanel = "<span id=\"filter-wrapper\" style=\"display: inline-block;\">" +
            "<form id=\"filter-form\">" +

            "<label>Title </label>" +
            "<input id=\"zip-input-box\" type=\"text\" class=\"textBox\"/>" +
            "<input id=\"zip-filter-button\" style=\"height:25px; margin-left: 10px;\" type=\"submit\" class=\"Button\" value=\"Filter\"/>" +
            "</form></span>";


    } else if ($(this).val() == "Date") {
        var filterPanel = $("<span/>")
                                .attr("id", "filter-wrapper")
                                .css("display","inline-block")
                                .append($("<form/>").attr("id","filter-form")
                                                .append( $("<label/>").html("Date")               
                                                .append( $("<input/>").attr({"id": "date-input-box", "type":"text", "class": "textBox"})
                                                                      .datepicker())
                                                .append( $("<input/>").attr({"id":"date-filter-button", "type":"submit", "class":"Button", "value":"Filter"})
                                                                      .css({"height":"25px","margin-left":"10px"})
                                                                      .click(function(){
                                                                            if($("#date-input-box").val().trim() != ""){
                                                                                $.get(
                                                                                "php/filter_posts.php", {
                                                                                    date: $("#date-input-box").val()
                                                                                }).done(function(data) {
                                                                                dataToFormattedPosts(data);
                                                                            });
                                                                            }else{
                                                                                $("#date-filter-box").click();
                                                                            }
                                                                        }))
                                ))
    }
    $("#pageNav").load("php/page_nav.php");
    $("#filter-select").prepend(filterPanel);
}
//Filtering options
$("#filter-by-options").change(filter_Option);

$(document).on("click", "#zip-filter-button", function() {
    var search_text = $("#zip-input-box").val();
    var type = $("#filter-by-options").val() + "_" + $("#filter-type").val();

    $.post("php/filter_posts.php?" + type + "=" + search_text).done(function(data) {
        dataToFormattedPosts(data);
        $("#pageNav").load("php/page_nav.php");
    });
    return false;
});



window.noOfImages = 1;

/*var html = $("#allForms").html(); 
$("#allForms").html(" ");
$("#allForms").append('<form id="fileUploaderForm1" style="margin:0px;" class="fileUploaderForm">' + html + '  </form>');
*/









(function() {
    if (!$.cookie('state') || !$.cookie('city')) {
        $("#container, #mainPanel, #addPostButton").hide();
        var firstime = true;
        states_viewer(firstime); // firstime == true
    } else {
        if ($.cookie('page') == 'postingsPage') {
            postingsPage();
        } else if ($.cookie('page') == 'profilePage') {
            profilePage();
        } else {
            postingsPage();
        }

    }
})();


$("#forgotPasswordLink").click(function() {
    var default_login_panel = $('#loginPanel').clone(true, true);
    var passwordRecovery = function() {
        var inputBox = $('<input/>').attr({
                'id': 'email_text_box',
                'type': 'textbox',
                'class': 'textBox'
            })
            .val('Email')
            .css({
                'background-color': '#EEE',
                'color': '#777',
                'font-weight': 'bold'
            })
            .data('default-value', 'Email')
            .focus(function() {
                this.value = this.value == $(this).data('default-value') ? '' : this.value;
            })
            .focusout(function() {
                if (this.value == '')
                    this.value = $(this).data('default-value');
            });
        var sendButton = $('<input/>').attr({
                'id': 'send_email_button',
                'type': 'submit',
                'class': 'Button'
            })
            .css('float', 'left')
            .val('Send')
            .click(function() {
                var email = $(inputBox).val();
                $.ajax({
                    url: 'php/userOperations.php',
                    type: 'post',
                    data: {
                        'email': email
                    }
                }).done(function(d) {
                    $(inputBox).val($(inputBox).data('default-value'));
                    show_dialogBox(d);
                });
            });
        var backButton = $('<input/>').attr({
                'id': 'back_button',
                'type': 'submit',
                'class': 'Button'
            })
            .css('float', 'right')
            .val('Back')
            .click(function() {
                $('#loginPanel').replaceWith(default_login_panel);
                return false;
            });

        var recoveryPanel = $(inputBox).add(sendButton).add(backButton);

        return recoveryPanel;

    };
    $("#loginPanel").html(passwordRecovery());
    return false;
});

return false;
}); //topmost function
