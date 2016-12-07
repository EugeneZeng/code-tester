//smart appender
(function($){
var setData = function(){
    if(arguments.length === 1 
        && arguments[0].constructor === Object){
        $.each(arguments[0], function(key, value){
            setData(key, value);
        });
    } else if(arguments.length === 2){
        var key = arguments[0];
        var o = this.data(arguments[0]);
        if(o && $.param(o) === $.param(arguments[1])){
            return;
        }
        this.data(arguments[0], arguments[1]).trigger("dataUpdated."+key);
    }
    return this;
};
var Appender = function($ele, template, options){
    if(!options){
        options = {};
    }
    this.opt = $.extend({
            size: 5,
            pages: 3,
            datakey: "scrollingData",
            isFromTop: false,
            helperHeight: 30,
            appendHelper: "<div></div>"
        }, options);
    this.inRefreshing = false;    
    this.$ele = $ele;
    this.scrollData = {};
    this.template = template;
    this.extendData();
    this.initialize();
};

$.extend(Appender.prototype, {
    addDataIndexInTemplate: function(){
        var strArray = [];
        var index = this.template.indexOf(">"); 
        strArray.push(this.template.slice(0, index));
        strArray.push(" dataindex='{scrollingDataIndex}'");
        strArray.push(this.template.slice(index));
        this.template = strArray.join("");
    },
    next: function(){
        var range = this.getCurrentRange();
        var nextRange = {};
        var maxIndex = this.$ele.data(this.opt.datakey).length - 1;
        nextRange.start = range.start + this.opt.size;
        nextRange.end = range.end + this.opt.size;
        
        nextRange.start = nextRange.end > maxIndex ? (nextRange.start - (nextRange.end - maxIndex)) : nextRange.start;
        nextRange.end = nextRange.end > maxIndex ? maxIndex : nextRange.end;
        this.$ele.data("currentIndexRange", nextRange.start + "," + nextRange.end);
        
        return this.getInnerHTML(this.getNeededDataFrame());
    },
    previous: function(){
        var range = this.getCurrentRange();
        var nextRange = {};
        nextRange.start = range.start - this.opt.size;
        nextRange.end = range.end - this.opt.size;
        
        nextRange.start = nextRange.start < 0 ? 0 : nextRange.start;
        nextRange.end = nextRange.start < 0 ? (nextRange.end - nextRange.start) : nextRange.end;
        this.$ele.data("currentIndexRange", nextRange.start + "," + nextRange.end);
        
        return this.getInnerHTML(this.getNeededDataFrame());
    },
    extendData: function(){
        var data = this.$ele.data(this.opt.datakey);
        var exData = [];
        data.forEach(function(data, index){
            exData.push($.extend({scrollingDataIndex: index}, data));
        });
        this.scrollData.extendedData = exData;
    },
    getInnerHTML: function(dataArray){
        var html = "";
        var _this = this;
        dataArray.forEach(function(ele, index){
            html += _this.template.formatStr(ele);
        });
        return html;
    },
    getDataFrame: function(){
        var range = this.getCurrentRange();
            
        var scrollingData = this.scrollData.extendedData;
        var dataFrame = [];
        for(var i = range.start; i <= range.end; i++){
            dataFrame.push(scrollingData[i]);
        }
        return dataFrame;
    },
    getNeededDataFrame: function(){
        var dataFrame = this.getDataFrame();
        var _this = this;
        var neededDataFrame = [];
        dataFrame.forEach(function(data, index){
            if(_this.$ele.find("[dataindex='"+ data.scrollingDataIndex +"']").length == 0)
                neededDataFrame.push(data);
        });
        return neededDataFrame;
    },
    getCurrentRange: function(){
        var currentRange = {start: 0, end: 0};
        var range = this.$ele.data("currentIndexRange");
        currentRange.start = range.split(",")[0] - 0;
        currentRange.end = range.split(",")[1] - 0;
        return currentRange;
    },
    doChildrenClean: function(){
        var range  = this.getCurrentRange();
        var $child;
        this.$ele.find("[dataindex]").each(function(i, child){
            $child = $(child);
            if($child.attr("dataindex") < range.start){
                $child.remove();
            } else if($child.attr("dataindex") > range.end){
                $child.remove();
            }
        });
    },
    addAppendHelper: function(to){
        var $helper = $(this.opt.appendHelper);
            $helper.addClass("append-helper").height(this.opt.helperHeight);
        if(to === "toBefore"){
            this.$ele.prepend($helper);
        } else if(to === "toAfter") {
            this.$ele.append($helper);
        }
        this.$ele.trigger("appendDone.helper", [to, this.isNeedHelper(to)]);
    },
    removeAppendHelper:function(){
        this.$ele.find("div.append-helper")
            .remove();
    },
    isNeedHelper: function(to){
        var range = this.getCurrentRange();
        var maxIndex = this.scrollData.extendedData.length - 1;
        
        if(to === "toBefore"){
            return range.start > 0;
        } else if(to === "toAfter") {
            return range.end < maxIndex;
        }
    },
    setIndexRangeForInitialize: function(){
        var maxDataIndex = this.$ele.data(this.opt.datakey).length - 1;
        var displayLength = this.opt.size * this.opt.pages;
        var start = 0, end = maxDataIndex;
        if(this.opt.isFromTop){
            end = displayLength - 1;
        } else {
            start = maxDataIndex - displayLength + 1;
            start = start < 0 ? 0 : start;
        }
        if(this.isDataNotEnough()){
            start = 0;
            end = maxDataIndex;
        }
        this.$ele.setData("currentIndexRange", start + "," + end);
    },
    initialize: function(){
        var _this = this;
        this.setIndexRangeForInitialize();
        this.addDataIndexInTemplate();
        this.$ele.bind("dataUpdated."+this.opt.datakey, function(){
            _this.extendData();
            _this.updateCurrentDisplaying();
        })
        .bind("appendDone.dataItems", function(e, to){
            if(_this.isDataNotEnough()){
                return;
            }
            _this.doChildrenClean();
            _this.removeAppendHelper();
            if(_this.isNeedHelper(to)){
                _this.addAppendHelper(to);
            }
        }).html(this.getInnerHTML(this.getDataFrame()));
    },
    isDataNotEnough: function(){
        return this.$ele.data(this.opt.datakey).length 
                <= this.opt.size * this.opt.pages;
    },
    refresh: function(template, options){
        if(template){
            this.addDataIndexInTemplate();
        }
        if(options){
            this.opt = $.extend(this.opt, options);
        }
        this.inRefreshing = true;
        this.setIndexRangeForInitialize();
        this.$ele.html(this.getInnerHTML(this.getDataFrame()));
        this.inRefreshing = false;
    },
    updateCurrentDisplaying: function(){
        var _this = this, $item, $current;
        if(this.inRefreshing){
            return;
        }
        var isDataEnough = !this.isDataNotEnough();
        if(this.isDataNotEnough()){
            this.setIndexRangeForInitialize();
        }
        var dataFrame = this.getDataFrame();
        if(_this.$ele.find("li").length > dataFrame.length){
            _this.$ele.find("li:gt("+ (dataFrame.length - 1) +")").remove();
        }
        dataFrame.forEach(function(item, index){   
            $item = $(_this.template.formatStr(item));
            $current = _this.$ele.find("li:eq("+ index +")");
            if($current.length === 0){
                _this.$ele.append($item);
                return;
            }
            $current.replaceWith($item);
        });
        if(isDataEnough){
            this.doChildrenClean();
        }
    }
});
$.fn.setData = setData;
$.fn.smartAppender = function(template, options){
    template = $.trim(template);
    if(this.data("smartAppenderInstance")){
        var appender = this.data("smartAppenderInstance");
        if(template === "toBefore") {
			var $dataItems = $(appender.previous());
            this.prepend($dataItems).trigger("appendDone.dataItems", ["toBefore", $dataItems]);
        }
        else if(template === "toAfter") {
			var $dataItems = $(appender.next());
            this.append($dataItems).trigger("appendDone.dataItems", ["toAfter", $dataItems]);
        } else {
            appender.refresh(template, options);
            this.trigger("appendDone.dataItems");
        }
    } else {
        this.data("smartAppenderInstance", new Appender(this, template, options));
    }
    
    return this;
};
})(jQuery);
