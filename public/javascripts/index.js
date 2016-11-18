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
    $.getJSON("/queryData?length=200").success(function(json){
        appendData(json.data);
    });
});
function appendData(dataArray){
    $testField = $("#testField");
    $testField.data("scrollingData", dataArray)
            .scrollAppend("<li><a href='javascript:void(0);'>{number} - {random}</a></li>", {isFromTop:false});
    
    window.setInterval(function(){
        $.getJSON("/queryData?length=10").success(function(json){
            data = $testField.data("scrollingData");
            data.join(json.data);
            $testField.setData("scrollingData", data);
        });
    }, 1000);
}