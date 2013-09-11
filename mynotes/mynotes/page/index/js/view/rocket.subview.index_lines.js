(function($){

rocket.subview.index_lines = rocket.subview.uibase_vimlikelist.extend({

    el: '#index_page_lines'

    ,lineTemplate: _.template($('#template_index_lines').text())

    ,init: function(options){
        var me = this;

        me.model = new rocket.model.article_list(
            {}
            ,$.extend({}, me.options)
        );

        me.isFirstLoad = true;
        me.contextNum = 49;

        me.$currentLine = null;

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);

        me.model.on('change', me.onmodelchange, me);

        ec.on('keydown', me.onkeydown, me);
    }

    ,render: function(model){
        var me = this,
            data = model.getData();

        switch(me.getRenderMode(model)){
            case 'APPEND':
                me.$el.append(
                    me.lineTemplate({
                        articles: data 
                    })
                );
                break;
            case 'PREPEND':
                me.$el.prepend(
                    me.lineTemplate({
                        articles: data 
                    })
                );
                break;
        }

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.hideLoading();
            me.highlightFirstLine();
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

        if(data[0].article_id - 0 < firstLineNo - 0){
            return 'PREPEND';
        }

        if(data[0].article_id - 0 > lastLineNo - 0){
            return 'APPEND';
        }
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        me.render(model);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            if(me.isFirstLoad){
                me.model.fetch({
                    reqdata: {
                        from_article_id: 1
                        ,context_num: me.contextNum
                    }
                });
            }
            me.show();
        }
    }

    ,onkeydown: function(params){
        var me = this,
            e = params.event,
            key = e.which,
            hit = false; 

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
            articleID = 0; // 1-based

        if($firstLine.length){
            articleID = $firstLine.find('.line-number').text();
        }

        me.model.fetch({
            reqdata: {
                from_article_id: articleID - me.contextNum - 1 
                ,context_num: me.contextNum
            }
        });
    }

    ,getMoreNext: function(){
        var me = this,
            $lastLine = me.$('.line').last(),
            articleID = 0; // 1-based

        if($lastLine.length){
            articleID = $lastLine.find('.line-number').text();
        }

        me.model.fetch({
            reqdata: {
                from_article_id: articleID - 0 + 1 
                ,context_num: me.contextNum
            }
        });
    }

    ,goArticle: function(){
        var me = this;
        if(me.$currentLine){
            setTimeout(function(){
                me.navigate([
                    '#article'
                    ,'/'
                    ,me.$currentLine.find('.line-number').text()
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
