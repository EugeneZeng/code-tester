/*! jQuery scrollAppend - v0.1 - 2016-11-16 Licensed MIT 
 * $(dom).data("scrollingData", dataArray).scrollAppend(template);
 * 
 */
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
    };
    
    var scrollAppender = function($scrollWrapper, template, options){
        var _this = this;
        this.opt = $.extend({
            size: 5,
            pages: 3,
            helperHeight: 30,
            sensitivity: 5,
            isFromTop: false
        }, options);
        this.scrollData = {};
        this.template = template;
        this.datakey = "scrollingData";
        this.$scrollWrapper = $scrollWrapper;
        this.update();
        this.extendScrollingData();
        this.addDataIndexInTemplate();
        
        this.$scrollWrapper.css("overflow", "auto")
            .bind("dataUpdated.scrollingData", function(){
                _this.extendScrollingData();
            })
            .bind("dataUpdated.currentIndexRange", function(){
                _this.updateDisplayingItems();
            })
            .trigger("dataUpdated.currentIndexRange");
        if(this.opt.isFromTop){
            this.$scrollWrapper.scrollTop(0);
            this.scrollData.scrollTop = 0;
        } else { 
            this.$scrollWrapper.scrollTop(_this.$scrollWrapper[0].scrollHeight);
            this.scrollData.scrollTop = this.$scrollWrapper.scrollTop();
        }
        window.setTimeout(function(){
            _this.$scrollWrapper.bind("scroll", function(e){
                var timer = _this.$scrollWrapper.data("scrollTimer");
                if(timer){
                    window.clearTimeout(timer);
                }
                timer = window.setTimeout(function(){
                    _this.updateScrollData(e);
                    _this.scrollHandler(e);
                }, 200);
                _this.$scrollWrapper.data("scrollTimer", timer);
            });
        }, 100);
        
    };
    $.extend(scrollAppender.prototype, {
        extendScrollingData:function(){
            var scrollingData = this.$scrollWrapper.data("scrollingData");
            var exData = [];
            scrollingData.forEach(function(data, index){
                exData.push($.extend({scrollingDataIndex: index}, data));
            });
            this.scrollData.extendedScrollingData = exData;
        },
        addDataIndexInTemplate: function(){
            var strArray = [];
            var index = this.template.indexOf(">"); 
            strArray.push(this.template.slice(0, index));
            strArray.push(" dataindex='{scrollingDataIndex}'");
            strArray.push(this.template.slice(index));
            this.template = strArray.join("");
        },
        update: function (template, options){
            if(template){
                this.template = template;
            }
            if(options){
               this.opt = $.extend(this.opt, options); 
            }
            var maxDataIndex = this.$scrollWrapper.data("scrollingData").length - 1;
            var displayLength = this.opt.size * this.opt.pages;
            if(this.opt.isFromTop){
                this.$scrollWrapper.setData("currentIndexRange", 0 + "," + (displayLength - 1));
            } else {
                this.$scrollWrapper.setData("currentIndexRange", (maxDataIndex - displayLength + 1) + "," + maxDataIndex);
            }
        },
        updateScrollData: function(e){
            var previousScrollTop = this.scrollData.scrollTop;
            var scrollTop = this.$scrollWrapper.scrollTop();
            if(previousScrollTop + this.opt.sensitivity < scrollTop){
                this.scrollData.isScrollingUp = false;
            } else if(previousScrollTop - this.opt.sensitivity > scrollTop){
                this.scrollData.isScrollingUp = true;
            } else {
                return;
            }
            this.scrollData.wrapperHeight = this.$scrollWrapper.height();
            this.scrollData.scrollHeight = this.$scrollWrapper[0].scrollHeight;
            this.scrollData.scrollTop = scrollTop;
        },
        scrollHandler: function(){
            this.addScrollHelper();
            if(this.scrollData.isScrollingUp){
                this.forScrollingUp();
            } else {
                this.forScrollingDown();
            }
        },
        
        forScrollingUp:function(){
            if(this.isNeedData()){
                var start,end;
                var range = this.$scrollWrapper.data("currentIndexRange");
                start = range.split(",")[0] - 0;
                end = range.split(",")[1] - 0;
                
                start -= this.opt.size;
                end -= this.opt.size;
                
                start = start < 0 ? 0 : start;
                this.$scrollWrapper.setData("currentIndexRange", start + "," + end);
            }
        },
        forScrollingDown:function(){
            if(this.isNeedData()){
                var start,end;
                var range = this.$scrollWrapper.data("currentIndexRange");
                var totalDataLength = this.scrollData.extendedScrollingData.length;
                start = range.split(",")[0] - 0;
                end = range.split(",")[1] - 0;
                
                start += this.opt.size;
                end += this.opt.size;
                
                end = end > totalDataLength ? totalDataLength : end;
                this.$scrollWrapper.setData("currentIndexRange", start + "," + end);
            }
        },
        isNeedData: function(){
            var wrapperHeight = this.scrollData.wrapperHeight;
            var scrollTop = this.scrollData.scrollTop;
            var scrollHeight = this.scrollData.scrollHeight;
            
            if(this.scrollData.isScrollingUp){
                return scrollTop < this.opt.helperHeight;
            } else {
                return (scrollHeight - wrapperHeight - scrollTop) < this.opt.helperHeight;
            }
        },
        isNeedHelper: function(){
            var wrapperHeight = this.scrollData.wrapperHeight;
            var scrollTop = this.scrollData.scrollTop;
            var scrollHeight = this.scrollData.scrollHeight;
            
            if(this.scrollData.isScrollingUp){
                return scrollTop < wrapperHeight;
            } else {
                return (scrollHeight - wrapperHeight - scrollTop) < wrapperHeight;
            }
        },
        isOnTop: function(){
            var start;
            var range = this.$scrollWrapper.data("currentIndexRange");
            start = range.split(",")[0];
            return start == 0;
        },
        isOnBottom: function(){
            var end;
            var range = this.$scrollWrapper.data("currentIndexRange");
            var maxDataIndex = this.$scrollWrapper.data("scrollingData").length - 1;
            end = range.split(",")[1];
            return end == maxDataIndex;
        },
        updateDisplayingItems: function(){
            var i, item;
            var dataFramForDisplay = [];
            var dataFrameByRange = this.getDataFrame();
            var $children = this.$scrollWrapper.children("li[dataindex]");
            
            dataFrameByRange.forEach(function(data, index){
                i = data.scrollingDataIndex;
                if($children.filter("[dataindex='"+ i +"']").length == 0){
                    dataFramForDisplay.push(data);
                };
            });
            
            $children.each(function(index, child){
                var $child = $(child);
                i = $child.attr("dataindex") - 0;
                item = dataFrameByRange.find(function(item){ return item.scrollingDataIndex == i });
                if(!item){
                    $child.remove();
                }
            });
            
            var htmlForDisplay = this.getInnerHTML(dataFramForDisplay);
            if($children.length === 0){
                this.$scrollWrapper.html(htmlForDisplay);
                return;
            }
            if(this.scrollData.isScrollingUp){
                $children.first().before(htmlForDisplay);
            } else {
                $children.last().after(htmlForDisplay);
            }
            
            
            if(this.isOnTop() || this.isOnBottom()){
                this.removeScrollHelper();
            } else {
                this.doAutoAdjustScroll();
            }
        },
        getDataFrame: function(){
            var start, end;
            var range = this.$scrollWrapper.data("currentIndexRange");
            start = range.split(",")[0] - 0;
            end = range.split(",")[1] - 0;
                
            var scrollingData = this.scrollData.extendedScrollingData;
            var dataFrame = [];
            for(var i = start; i <= end; i++){
                dataFrame.push(scrollingData[i]);
            }
            
            return dataFrame;
        },
        getInnerHTML: function(dataArray){
            var html = "";
            var _this = this;
            dataArray.forEach(function(ele, index){
                html += _this.template.formatStr(ele);
            });
            return html;
        },
        doAutoAdjustScroll:function(){
            var positionTop;
            if(this.scrollData.isScrollingUp){
                positionTop = this.opt.helperHeight;
            } else {
                positionTop = this.scrollData.scrollHeight - this.scrollData.wrapperHeight - this.opt.helperHeight;
            }
            this.$scrollWrapper.stop().animate({scrollTop: positionTop}, 500, "swing");
        },
        addScrollHelper:function(){
            if(this.scrollData.isScrollingUp){
                if(this.$scrollWrapper.children().first().is("div.scrollHelper"))
                    return;
            } else {
                if(this.$scrollWrapper.children().last().is("div.scrollHelper"))
                    return;
            }
            if(!this.isNeedHelper()){
                return;
            }
            var $helper = $("<div></div>");
            $helper.addClass("scrollHelper").height(this.opt.helperHeight);
            this.removeScrollHelper();
            if(this.scrollData.isScrollingUp){
                this.$scrollWrapper.prepend($helper);
            } else {
                this.$scrollWrapper.append($helper);
            }
        },
        removeScrollHelper:function(){
            this.$scrollWrapper.children("div.scrollHelper")
                .remove();
        }
    });
    
    $.fn.setData = setData;
    $.fn.scrollAppend = function(template, options){
        var appender;
        if(this.data("myScrollAppender")){
           appender = this.data("myScrollAppender");
           appender.update(template, options)
        } else {
            appender = new scrollAppender(this, template, options);
            this.data("myScrollAppender", appender);
        }
    };
})(jQuery);