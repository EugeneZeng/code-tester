/*! jQuery scrollAppend - v0.1 - 2016-11-16 Licensed MIT 
 * $(dom).data("scrollingData", dataArray).scrollAppend(template);
 * 
 */
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
            scrollHelper: "<div></div>",
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
        this.scrollToDataEdge();
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
        addDataIndexInTemplate: function(){
            var strArray = [];
            var index = this.template.indexOf(">"); 
            strArray.push(this.template.slice(0, index));
            strArray.push(" dataindex='{scrollingDataIndex}'");
            strArray.push(this.template.slice(index));
            this.template = strArray.join("");
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
            var $helper = $(this.opt.scrollHelper);
            $helper.addClass("scrollHelper").height(this.opt.helperHeight);
            this.removeScrollHelper();
            if(this.scrollData.isScrollingUp){
                this.$scrollWrapper.prepend($helper);
            } else {
                this.$scrollWrapper.append($helper);
            }
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
        extendScrollingData:function(){
            var scrollingData = this.$scrollWrapper.data("scrollingData");
            var exData = [];
            scrollingData.forEach(function(data, index){
                exData.push($.extend({scrollingDataIndex: index}, data));
            });
            this.scrollData.extendedScrollingData = exData;
        },
        forScrollingDown:function(){
            if(this.isNeedData()){
                var start,end;
                var range = this.$scrollWrapper.data("currentIndexRange");
                var totalDataLength = this.scrollData.extendedScrollingData.length - 1;
                start = range.split(",")[0] - 0;
                end = range.split(",")[1] - 0;
                
                var newStart = start + this.opt.size;
                var newEnd = end + this.opt.size;
                
                newStart = newEnd > totalDataLength ? (newStart - (newEnd - totalDataLength)) : newStart;
                newEnd = newEnd > totalDataLength ? totalDataLength : newEnd;
                this.$scrollWrapper.setData("currentIndexRange", newStart + "," + newEnd);
            }
        },
        forScrollingUp:function(){
            if(this.isNeedData()){
                var start,end;
                var range = this.$scrollWrapper.data("currentIndexRange");
                start = range.split(",")[0] - 0;
                end = range.split(",")[1] - 0;
                
                var newStart = start - this.opt.size;
                var newEnd = end - this.opt.size;
                
                newEnd = newStart < 0 ? (newEnd - newStart) : newEnd;
                newStart = newStart < 0 ? 0 : newStart;
                
                this.$scrollWrapper.setData("currentIndexRange", newStart + "," + newEnd);
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
        isDataNotEnough: function(){
            return this.$scrollWrapper.data("scrollingData").length 
                    <= this.opt.size * (this.opt.pages + 1);
        },
        isNeedData: function(){
            if(this.isDataNotEnough()){
                return false;
            }
            
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
            if(this.isDataNotEnough()){
                return false;
            }
            
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
        removeScrollHelper:function(){
            this.$scrollWrapper.children("div.scrollHelper")
                .remove();
        },
        scrollHandler: function(){
            this.addScrollHelper();
            if(this.scrollData.isScrollingUp){
                this.forScrollingUp();
            } else {
                this.forScrollingDown();
            }
        },
        scrollToDataEdge: function(){
            if(this.opt.isFromTop){
                this.$scrollWrapper.scrollTop(0);
                this.scrollData.scrollTop = 0;
            } else { 
                this.$scrollWrapper.scrollTop(this.$scrollWrapper[0].scrollHeight);
                this.scrollData.scrollTop = this.$scrollWrapper.scrollTop();
            }
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
            this.$scrollWrapper.setData("currentIndexRange", start + "," + end);
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
            $children = this.$scrollWrapper.children("li[dataindex]");
            if($children.length === 0){
                this.$scrollWrapper.html(htmlForDisplay);
            } else {
                if(this.scrollData.isScrollingUp){
                    $children.first().before(htmlForDisplay);
                } else {
                    $children.last().after(htmlForDisplay);
                }
            }
            
            if(this.isOnTop() || this.isOnBottom()){
                this.removeScrollHelper();
                this.scrollToDataEdge();
            } else {
                this.doAutoAdjustScroll();
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
        }
    });
    
    $.fn.setData = setData;
    $.fn.scrollAppend = function(template, options){
        var appender;
        if(this.data("myScrollAppender")){
           appender = this.data("myScrollAppender");
           appender.update(template, options);
        } else {
            appender = new scrollAppender(this, template, options);
            this.data("myScrollAppender", appender);
        }
        return this;
    };
})(jQuery);