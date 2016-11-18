//index.js
//<li><a href="#">...</a></li>
$(function(){
    $.getJSON("/queryData?length=200").success(function(json){
        appendData(json.data);
    });
});
function appendData(dataArray){
    $("#testField").data("scrollingData", dataArray)
            .scrollAppend("<li><a href='javascript:void(0);'>{number} - {random}</a></li>", {isFromTop:false});
}