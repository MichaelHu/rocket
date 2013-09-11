(function($){

rocket.subpageview.notes_lines 
    = rocket.subpageview.uibase_vimlikelist.extend({

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

            // "d" key down
            case 68:
                if(e.ctrlKey){
                    hit = true;
                    me.goNextFrame();
                }
                break;

            // "u" key down
            case 85:
                if(e.ctrlKey){
                    hit = true;
                    me.goPrevFrame();
                }
                break;

        }

        if(hit){
            e.preventDefault();
            e.stopPropagation();
        }
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
