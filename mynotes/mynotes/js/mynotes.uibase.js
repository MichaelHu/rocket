(function($){

var mynotes = window.mynotes = window.mynotes || {},
    uibase = mynotes.uibase 
        = mynotes.uibase || {};


uibase.vimlikelist = {

    $currentLine: null

    ,highlightFirstLine: function(){
        var me = this,
            $lines = me.$('.line'),
            $firstLine = $lines.first();

        if($firstLine.length){
            me.$currentLine 
                && me.$currentLine.removeClass('current-line');
            $firstLine.addClass('current-line');
            me.$currentLine = $firstLine;
        }
    }

    ,highlightLastLine: function(){
        var me = this,
            $lines = me.$('.line'),
            $lastLine = $lines.last();

        if($lastLine.length){
            me.$currentLine 
                && me.$currentLine.removeClass('current-line');
            $lastLine.addClass('current-line');
            me.$currentLine = $lastLine;
        }
    }

    ,highlightNextLine: function(){
        var me = this;
        me.highlightNextXLine(1);
    }

    ,highlightNextXLine: function(x){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $nextLine = $currentLine,
            $lastValidLine = $currentLine,
            total = x;

        while(total > 0){
            $lastValidLine = $nextLine;
            $nextLine = $nextLine.next();
            if(!$nextLine.length){
                $nextLine = $lastValidLine;
                break;
            }
            total--;
        }

        if(total < x){
            $currentLine.removeClass('current-line');
            $nextLine.addClass('current-line');
            me.$currentLine = $nextLine;
        }
    }

    ,highlightPrevLine: function(){
        var me = this;
        me.highlightPrevXLine(1);
    }

    ,highlightPrevXLine: function(x){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $prevLine = $currentLine,
            $lastValidLine = $currentLine,
            total = x;

        while(total > 0){
            $lastValidLine = $prevLine;
            $prevLine = $prevLine.prev();
            if(!$prevLine.length){
                $prevLine = $lastValidLine;
                break;
            }
            total--;
        }

        if(total < x){
            $currentLine.removeClass('current-line');
            $prevLine.addClass('current-line');
            me.$currentLine = $prevLine;
        }
    }

    ,highlightLine: function(line){
        var me = this,
            $lines = me.$('.line'),
            len = $lines.length,
            $currentLine = me.$currentLine,
            $line,
            lineNo;

        for(var i=0; i<len; i++){
            $line = $($lines[i]); 
            lineNo = $line.find('.line-number').text();
            console.log(lineNo);
            if(lineNo == line){
                if($line != $currentLine){
                    $currentLine && $currentLine.removeClass('current-line');
                    $line.addClass('current-line');
                    me.$currentLine = $line;
                }
                break;
            }
        }

        if(i == len){
            me.highlightFirstLine();
        }

    }

    ,goFirst: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightFirstLine();
        me.scrollIntoView();
    }

    ,goLast: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightLastLine();
        me.scrollIntoView();
    }

    ,goDown: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightNextLine();
        me.scrollIntoView();

        if(me.isArrivingEnd('next')){
            // console.log('arriving tail...');
            me.getMoreNext();
        }
    }

    ,goUp: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightPrevLine();
        me.scrollIntoView();

        if(me.isArrivingEnd('prev')){
            // console.log('arriving head...');
            me.getMorePrev();
        }
    }

    ,goNextFrame: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightNextXLine(me.linesPerFrame || 10);
        me.scrollIntoView();

        if(me.isArrivingEnd('next')){
            // console.log('arriving tail...');
            me.getMoreNext();
        }
    }

    ,goPrevFrame: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightPrevXLine(me.linesPerFrame || 10);
        me.scrollIntoView();

        if(me.isArrivingEnd('prev')){
            // console.log('arriving head...');
            me.getMorePrev();
        }
    }

    ,scrollIntoView: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }
        
        var $line = me.$currentLine, 
            viewHeight = me.$el.height(),
            viewScrollTop = me.el.scrollTop,
            lineTop = $line[0].offsetTop,
            lineHeight = $line.height();

        // console.log([
        //     viewHeight
        //     ,viewScrollTop
        //     ,lineTop
        //     ,lineHeight
        // ].join('_'));

        // @note: 当前行向下跑出视口
        if(lineTop + lineHeight > viewHeight + viewScrollTop){
            me.el.scrollTop = lineTop + lineHeight - viewHeight;
        }
        // @note: 当前行向上跑出视口
        else if(lineTop < viewScrollTop){
            me.el.scrollTop = lineTop;
        }

    }

    // 是否接近两端
    ,isArrivingEnd: function(direction){
        var me = this,
            $currentLine = me.$currentLine, 
            i = 1;

        if(!$currentLine.length
            || direction != 'prev'
                && direction != 'next'){
            return false;
        }

        while(i > 0){
            $currentLine = $currentLine[direction]();   
            if($currentLine.length == 0){
                break;
            }
            i--;
        } 

        // 距两端3行时触发
        if(i == 1){
            return true;
        }
        return false;
    }

    ,getMorePrev: function(){}

    ,getMoreNext: function(){}

};


})(Zepto);

