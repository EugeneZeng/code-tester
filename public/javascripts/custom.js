//index.js
//<li><a href="#">...</a></li>

 String.prototype.formatStr=function() {
    if(arguments.length===0) return this;
    var s=this;
    var doReplace = function(key, value){
        s = s.replace(new RegExp("\\{"+key+"\\}","g"), (value == null || value == undefined) ? "" : value);
    };
    if(arguments.length === 1 && arguments[0].constructor === Object) {
        var params = arguments[0];
        for(var key in params){
            doReplace(key, params[key]);
        }
    }
    for(var i = 0; i < arguments.length; i++){
        doReplace(i, arguments[i]);
    }
    return s;
};

$(function(){
    $.getJSON("/queryData?length=200&renew=1").success(function(json){
        appendData(json.data);
    });
    window.setInterval(function(){
        $.getJSON("/queryData?length=10").success(function(json){
            var existData = $("#testField").data("scrollingData");
            existData = existData.concat(json.data);
            $("#testField").setData("scrollingData", existData);
        });
    }, 10000);
    $("#operations").click(function(e){
        if(e.target.name === "getNewest"){
            console.log("doSomething");
        }
    });
    
    var timeout = 0;
    
    $("#scrollBody").mCustomScrollbar({
        axis: "y",
        theme:"dark",
        scrollButtons:{ enable:true },
        callbacks:{
            onScrollStart:function(){ myCallback(this,"#onScrollStart") },
            onScroll:function(){ 
                myCallback(this,"#onScroll");
            },
            onTotalScroll:function(){ myCallback(this,"#onTotalScroll") },
            onTotalScrollOffset:60,
            onTotalScrollBack:function(){ myCallback(this,"#onTotalScrollBack") },
            onTotalScrollBackOffset:50,
            whileScrolling:function(){ 
                myCallback(this,"#whileScrolling"); 
                $("#mcs-top").text(this.mcs.top);
                $("#mcs-dragger-top").text(this.mcs.draggerTop);
                $("#mcs-top-pct").text(this.mcs.topPct+"%");
                $("#mcs-direction").text(this.mcs.direction);
                $("#mcs-total-scroll-offset").text("60");
                $("#mcs-total-scroll-back-offset").text("50");
                clearTimeout(timeout);
                if(this.mcs.top > -30){
                   timeout = setTimeout(function(){
                       insertEleBefore();
                       
                   }, 200);
                } 
                var contentHeight = this.mcs.content.height();
                if(this.mcs.top < -(contentHeight - 270 - 30)){
                   timeout = setTimeout(function(){
                       insertEleAfter();
                   }, 500);
                }
            },
            alwaysTriggerOffsets:false
        }
    });
});

function insertEleBefore(){
    $("#testField").smartAppender("toBefore");
    
}

function insertEleAfter(){
    $("#testField").smartAppender("toAfter");
    
}

function myCallback(el,id){
    if($(id).css("opacity")<1){return;}
    var span=$(id).find("span");
    clearTimeout(timeout);
    span.addClass("label-danger");
    var timeout=setTimeout(function(){span.removeClass("label-danger")},550);
}

var appendData = function(dataArray){
    var template = "<li><a href='javascript:void(0);'>{number} - {random}</a></li>";
    $("#testField").setData("scrollingData", dataArray)
                    .smartAppender(template, {isFromTop: false})
                    .bind("appendDone", function(e, where, isAppended){
                        if(!isAppended){
                            return;
                        }
                        if(where === "toBefore"){
                            $("#scrollBody").mCustomScrollbar('scrollTo', "-=35")
                        } else if(where === "toAfter"){
                            $("#scrollBody").mCustomScrollbar('scrollTo', "+=35");
                        }
                    });
    $("#scrollBody").mCustomScrollbar('scrollTo','bottom');
};