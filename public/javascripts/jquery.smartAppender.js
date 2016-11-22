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
            isFromTop: false
        }, options);
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
    initialize: function(){
        var _this = this;
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
        this.addDataIndexInTemplate();
        this.$ele.bind("dataUpdated."+this.opt.datakey, function(){
            _this.extendData();
        }).html(this.getInnerHTML(this.getDataFrame()));
    },
    isDataNotEnough: function(){
        return this.$ele.data(this.opt.datakey).length 
                <= this.opt.size * (this.opt.pages + 1);
    }
});
$.fn.setData = setData;
$.fn.smartAppender = function(template, options){
    if(this.data("smartAppenderInstance")){
        return;
    }
    this.data("smartAppenderInstance", new Appender(this, template, options));
    return this;
};
$.fn.insertNext = function(){
    var appender = this.data("smartAppenderInstance");
    this.append(appender.next());
    appender.doChildrenClean();
    return this;
};
$.fn.insertPrevious = function(){
    var appender = this.data("smartAppenderInstance");
    this.prepend(appender.previous());
    appender.doChildrenClean();
    return this;
};
})(jQuery);
