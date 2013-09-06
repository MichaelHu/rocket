(function($){

rocket.subpageview.notes_lines = rocket.subpageview.extend({

    className: 'notes-page-lines'

    ,lineTemplate: _.template($('#template_notes_lines').text())

    ,init: function(options){
        var me = this;

        me.model = new rocket.model.lines(
            {}
            ,$.extend({}, me.options)
        );

        me.isFirstLoad = true;

        me.keywords = options.keywords;
        me.fromLineNo = options.line;
        me.contextNum = 9;

        me.$currentLine = null;

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        me.model.on('change', me.onmodelchange, me);

        ec.on('keydown', me.onkeydown, me);
    }

    ,unregisterEvents: function(){
        var me = this,
            ec = me.ec;
        
        me.model.off('change', me.onmodelchange, me);

        ec.off('keydown', me.onkeydown, me);
    }

    ,render: function(model){
        var me = this,
            data = model.getData();

        mynotes.helper.highlight(me.keywords, data);

        switch(me.getRenderMode(model)){
            case 'APPEND':
                me.$el.append(
                    me.lineTemplate({
                        lines: data 
                    })
                );
                break;
            case 'PREPEND':
                me.$el.prepend(
                    me.lineTemplate({
                        lines: data 
                    })
                );
                break;
        }

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.hideLoading();
            me.highlightFirstLine();
        }
        else{
            me.scrollIntoView();
        }
    }

    ,getRenderMode: function(model){
        var me = this,
            data = model.getData(),
            $lines = me.$('.line'),
            firstLineNo,
            lastLineNo;

        if(!$lines.length){
            return 'APPEND';
        } 

        firstLineNo = $lines.first().find('.line-number').text();
        lastLineNo = $lines.last().find('.line-number').text();

        if(data[0].line_num - 0 < firstLineNo - 0){
            return 'PREPEND';
        }

        if(data[0].line_num - 0 > lastLineNo - 0){
            return 'APPEND';
        }
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        me.render(model);
    }

    ,onsubpagebeforechange: function(params){          
        var me = this,                                 
            from = params.from,                        
            to = params.to,                            
            param = params.params,                     
            featureString = me.getFeatureString(param);

        if(to == me.ec                                 
            && featureString == me.featureString){     
                                                       
            if(me.isFirstLoad){                        
                me.model.fetch({
                    reqdata: {
                        line: me.fromLineNo 
                        ,context_num: me.contextNum
                        ,direction: 1
                    }
                });
            }
          
            // @note: 平滑子页面，显示不隐藏
            me.$el.show();                             
        }
  
    }

    ,onkeydown: function(params){
        var me = this,
            e = params.event,
            targetSubpage = params.targetSubpage,
            key = e.which,
            hit = false; 

        if(me != targetSubpage
            || !me.isActiveSubpage()){
            return;
        }

        switch(key){
            // "g" key down
            case 71:
                hit = true;
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "h" key down
            case 72:
                hit = true;
                me.goSearch();
                break;

            // "o" key down
            case 79:
                hit = true;
                me.goArticle();
                break;

            // "j" key down
            case 74:
                hit = true;
                me.goDown();
                break;

            // "k" key down
            case 75:
                hit = true;
                me.goUp();
                break;

            // "/" key down
            case 191:
                hit = true;
                me.startSearch();
                break;

        }

        if(hit){
            e.preventDefault();
            e.stopPropagation();
        }
    }

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
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $nextLine = $currentLine.next();

        if($nextLine.length){
            $currentLine.removeClass('current-line');
            $nextLine.addClass('current-line');
            me.$currentLine = $nextLine;
        }
    }

    ,highlightPrevLine: function(){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $prevLine = $currentLine.prev();

        if($prevLine.length){
            $currentLine.removeClass('current-line');
            $prevLine.addClass('current-line');
            me.$currentLine = $prevLine;
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
            console.log('arriving tail...');
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
            console.log('arriving head...');
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
            i = 3;

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







    ,getMorePrev: function(){
        var me = this,
            $firstLine = me.$('.line').first(),
            lineID = 1; // 1-based

        if($firstLine.length){
            lineID = $firstLine.find('.line-number').text();
        }

        me.model.fetch({
            reqdata: {
                line: lineID - me.contextNum - 1 
                ,context_num: me.contextNum
                ,direction: -1
            }
        });
    }

    ,getMoreNext: function(){
        var me = this,
            $lastLine = me.$('.line').last(),
            lineID = 1; // 1-based

        if($lastLine.length){
            lineID = $lastLine.find('.line-number').text();
        }

        me.model.fetch({
            reqdata: {
                line: lineID - 0 + 1 
                ,context_num: me.contextNum
                ,direction: 1
            }
        });
    }

    ,goArticle: function(){
        var me = this,
            $currentLine = me.$currentLine;

        if($currentLine){
            setTimeout(function(){
                me.navigate([
                    '#article'
                    ,'/'
                    ,$currentLine.data('articleid')
                    ,'/'
                    ,$currentLine.find('.line-number').text()
                ].join(''));
            }, 500);
        }
    }

    ,goSearch: function(){
        var me = this;
        if(me.keywords){
            setTimeout(function(){
                me.navigate([
                    '#search'
                    ,'/'
                    ,encodeURIComponent(me.keywords)
                ].join(''));
            }, 500);
        }
    }

    ,startSearch: function(){
        var me = this; 
        me.ec.trigger('startsearch');
    }

});

})(Zepto);
