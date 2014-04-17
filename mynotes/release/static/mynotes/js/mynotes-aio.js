(function($){

var mynotes = window.mynotes = window.mynotes || {},
    helper = mynotes.helper 
        = mynotes.helper || {};

function escapeRegExp(str){
    return str.replace(/\^|\$|\\|\(|\)|\[|\]|\+|\.|\*|\?/g, '\\$&');
}

function escapeHTML(str){
    if($('#_text_holder').length == 0){
        $('body').append($('<div id="_text_holder"></div>').hide());
    }
    return $('#_text_holder').text(str).html();
}

function highlight(keyWord, data){
    // 空白也作为查询对象
    // keyWord = keyWord.replace(/^\s+|\s+$/g, '');

    var pattern = null,
        keyWords = []; 
    
    if(typeof(keyWord) != 'undefined'
        && keyWord != null
        && keyWord != ''){

        // 如果是number就不能split了
        keyWords = (keyWord + '').split(/\s\+\s/);
        for(var i=0; i<keyWords.length; i++){
            keyWords[i] = escapeRegExp(keyWords[i]);
        }
        pattern = new RegExp(keyWords.join('|'), 'gi');

    }

    // console.log(pattern);

    for(var i=0; i<data.length; i++){

        if(null !== pattern){
            // 第一次正则替换，保护高亮样式
            data[i].text = data[i].text.replace(
                    pattern, '___@1___span class="key-word"___@2___$&___@1___/span___@2___');
        }

        // HTML转义
        data[i].text = escapeHTML(data[i].text); 

        if(null !== pattern){
            // 第二次正则替换，恢复高亮样式
            data[i].text = data[i].text.replace(
                /___@(\d)___/g, function($0, $1){
                    if($1 == 1){
                        return '<';
                    }
                    return '>';
                });
        }

        // 保持缩进
        data[i].text = data[i].text.replace(/\t+|\s{2,}/g, function($0){
            var str = '';
            for(var i=0; i<$0.length; i++){
                // 制表符用四个空格代替
                if($0[i] == '\t'){
                    str += '&nbsp;&nbsp;&nbsp;&nbsp;';
                }
                else{
                    str += '&nbsp;'; 
                }
            } 
            return str;
        });
    }
}


// interface
$.extend(helper, {
    escapeRegExp: escapeRegExp
    ,escapeHTML: escapeHTML
    ,highlight: highlight
})


})(Zepto);


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


(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        // 全局model
        // var modelvstuiguang = new rocket.model.vstuiguang();

        new rocket.router.mynotes();
        Backbone.history.start();

        function scroll(e){
            $(document.body).height(600);

            // http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
            setTimeout(function(){
                window.scrollTo(0, 0);
                setTimeout(function(){
                    $(document.body).height($(window).height());
                }, 0);
                rocket.isLoaded = true;
            }, 1000); 

        }

        $(function(e){
            scroll();
        });

        /*
        setTimeout(function(){
            modelvstuiguang.fetch({
                callback: 'vstuiguangCalllback'
            }); 
        }, 300);
        */
    }

});

})(Zepto);    


(function($) {

rocket.router.mynotes = rocket.router.extend({

    // 路由配置
    routes: {
        /**
         * 'index/:param1/:param2': '_ROUTEHANDLER_'
         */

        '': 'index'
        ,'index': 'index'
        ,'article/:articleid(/:line)': 'article'
        ,'search/:keywords': 'search'
        ,'notes/:line(/:keywords)': 'notes'
        ,'*default': 'index'

        /*
        '': 'index'
        ,'index': 'index'
        ,'sayhello': 'sayhello'
        */
    }

    // 页面切换顺序配置
    ,pageOrder: [
        'index'
        ,'search'
        ,'notes'
        ,'article'
    ]

    // 位置记忆，默认为false，不进行位置记忆
    ,enablePositionRestore: true

    // 默认页面切换动画
    ,defaultPageTransition: 'slide'

    // 页面切换动画配置
    ,pageTransition: {
        /**
         * @note: slide比较适用于固高切换，fade比较适用DOM树较小的两个页面切换，simple性能最好，但效果最一般，合理选择配置
         */
        // 'index-sayhello': 'slide' 

    }

    /**
     * route handlers
     */

    ,index: function() {
        this.doAction('index', {});
    }

    ,article: function(articleid, line/*optional*/) {
        this.doAction('article', {
            articleid: decodeURIComponent(articleid)
            ,line: undefined === line 
                ? ''
                    : decodeURIComponent(line)
        });
    }

    ,search: function(keywords) {
        this.doAction('search', {
            keywords: decodeURIComponent(keywords)
        });
    }

    ,notes: function(line, keywords/*optional*/) {
        this.doAction('notes', {
            line: decodeURIComponent(line)
            ,keywords: undefined === keywords 
                ? ''
                    : decodeURIComponent(keywords)
        });
    }

}); 

})(Zepto);





(function($){

rocket.subpageview.uibase_vimlikelist = rocket.subpageview.extend(
    mynotes.uibase.vimlikelist
);

})(Zepto);


(function($){


rocket.subview.ui_searchbox = rocket.subview.extend({


    className: 'ui-searchbox'

    ,events: {
    }

    ,template: _.template($('#template_ui_searchbox').text())

    ,init: function(options){
        var me = this;

        me.render();

        // @note: render以后才有
        me.$form = me.$('form');
        me.$keyword = me.$('.keyword');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;

        me.$form.on('submit', function(e){
            // @note: 阻止默认form行为
            e.preventDefault(); 
            // 阻止没必要的冒泡
            e.stopPropagation();

            // @todo: form check

            // @note: 让键盘关闭
            me.$keyword.blur();

            me.doSearch();
        });

        me.$keyword.on('focus', function(e){
            me.onfocus();
        });

        me.$keyword.on('blur', function(e){
            me.onblur();
        });

        ec.on('pagebeforechange', me.onpagebeforechange, me);

        ec.on('startsearch', me.onstartsearch, me);
    }

    ,unregisterEvents: function(){
        var me = this,
            ec = me.ec;

        me.$form.off('submit');
        ec.off('pagebeforechange', me.onpagebeforechange, me);
        ec.off('startsearch', me.onstartsearch, me);
    }

    ,render: function(){
        var me = this;

        me.$el.append(me.template({}));
        me.show();
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to = ec){
            if(param.keyword != undefined){
                me.$keyword.val(param.keyword); 
            }
        }
    }

    ,doSearch: function(){
        var me = this;

        setTimeout(function(){
            me.navigate(
                '#search/'
                + encodeURIComponent(me.$keyword.val())
            );
        }, 0);
    }

    ,onfocus: function(e){
        var me = this;
    }

    ,onblur: function(e){
        var me = this;

    }

    ,onstartsearch: function(){
        var me = this;
        me.$keyword.focus();
    }
});



})(Zepto);


(function($){

rocket.subview.uibase_vimlikelist = rocket.subview.extend(
    mynotes.uibase.vimlikelist
);

})(Zepto);


(function($){

rocket.model.article = rocket.model.extend({

    initialize: function(attributes, options){
        var me = this;

        me.requestData = {
            'article_id': options.articleid 
            // @note: request full text 
            ,'context_num': 0
        };

        me.data = [];
    }

    ,urlTemplate: _.template([
        '/?tn=notes&act=getNotesWithArticleID'
        ,'article_id=<%= article_id %>'
        ,'context_num=<%= context_num %>'
    ].join('&'))

    ,url: function(){
        var me = this;
        return me.urlTemplate(me.requestData); 
    }

    ,getData: function(){
        return this.data;
    }

    ,fetch: function(options){
        var me = this,
            req = me.requestData,
            reqOpt = options.reqdata
                ? options.reqdata 
                : {};
        
        // @note: modify request data, this will affect url() method
        for(var i in req){
            if('undefined' != typeof reqOpt[i]){
                req[i] = reqOpt[i];
            }
        }

        return Backbone.Model.prototype.fetch.apply(me, arguments); 
    }

    ,parse: function(resp, xhr){
        this.data = resp;
        return resp;
    }

});


})(Zepto);



(function($){

rocket.pageview.article = rocket.pageview.extend({

    el: '#article_page'

    ,init: function(options){
        var me = this,
            spm,
            subView;

        me.setup(new rocket.subview.article_header(
            $.extend({}, me.options)
            ,me
        ));

        spm = me.getSubpageManager({
            subpageClass: rocket.subpageview.article_lines
            ,maxSubpages: 2
        });

        subView = new rocket.subpageview.article_lines(
            $.extend({}, me.options)
            ,me
        );

        me.append(subView);
        spm.registerSubpage(me.featureString, subView);

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec,
            keydownLocking = false;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()
                && !keydownLocking){
                keydownLocking = true;

                ec.trigger('keydown', {
                    event: e
                    // @note: 用于定向派发和响应
                    ,targetSubpage: me.subpageManager._currentSubpage  
                });

                setTimeout(function(){
                    keydownLocking = false;
                }, 100);
            }
        });
    }

});

})(Zepto);

(function($){

rocket.subpageview.article_lines 
    = rocket.subpageview.uibase_vimlikelist.extend({

    className: 'article-page-lines'

    ,lineTemplate: _.template($('#template_article_lines').text())

    ,init: function(options){
        var me = this;

        me.articleID = options.articleid;
        me.initialLine = options.line;

        me.model = new rocket.model.article(
            {}
            ,$.extend({}, me.options)
        );

        me.isFirstLoad = true;
        // @note: request all lines of article
        me.contextNum = 0;

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
        
        // ec.on('pagebeforechange', me.onpagebeforechange, me);

        me.model.off('change', me.onmodelchange, me);

        ec.off('keydown', me.onkeydown, me);
    }

    ,render: function(model){
        var me = this,
            data = model.getData();

        switch(me.getRenderMode(model)){
            case 'APPEND':
                me.$el.append(
                    me.lineTemplate({
                        lines: data[1]
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
            me.ec.trigger('articleinfochange', {
                info: data[0]
            });
            me.isFirstLoad = false;
            me.hideLoading();

            if(me.initialLine){
                me.highlightLine(me.initialLine);
                me.scrollIntoView();
            }
            else{
                me.highlightFirstLine();
            }
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
                        from_article_id: 1
                        ,context_num: me.contextNum
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
                me.goBack();
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

    ,goBack: function(){
        var me = this;
        setTimeout(function(){
            history.back();
        }, 500);
    }

});

})(Zepto);

(function($){

rocket.subview.article_header = rocket.subview.extend({

    el: '#article_page_header'

    ,infoTemplate: _.template($('#template_article_header').text())

    ,init: function(options){
        var me = this;
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
        ec.on('articleinfochange', me.onarticleinfochange, me);
    }

    ,render: function(data){
        var me = this;

        me.$el.html(
            me.infoTemplate({
                info: data
            })
        );
    }

    ,onarticleinfochange: function(params){
        var me = this;
        if(params.info){
            me.render(params.info);
        }
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

});

})(Zepto);

(function($){

rocket.model.article_list = rocket.model.extend({

    initialize: function(attributes, options){
        var me = this;

        me.requestData = {
            'from_article_id': 1
            ,'context_num': 25
        };

        me.data = [];
    }

    ,urlTemplate: _.template([
        '/?tn=notes&act=getArticleAbstracts'
        ,'from_article_id=<%= from_article_id %>'
        ,'context_num=<%= context_num %>'
    ].join('&'))

    ,url: function(){
        var me = this;
        return me.urlTemplate(me.requestData); 
    }

    ,getData: function(){
        return this.data;
    }

    ,fetch: function(options){
        var me = this,
            req = me.requestData,
            reqOpt = options.reqdata
                ? options.reqdata 
                : {};
        
        // @note: modify request data, this will affect url() method
        for(var i in req){
            if('undefined' != typeof reqOpt[i]){
                req[i] = reqOpt[i];
            }
        }

        return Backbone.Model.prototype.fetch.apply(me, arguments); 
    }

    ,parse: function(resp, xhr){
        this.data = resp[0];
        return resp[0];
    }

});


})(Zepto);



(function($){

rocket.pageview.index = rocket.pageview.extend({

    el: '#index_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.index_header(
            $.extend({}, me.options)
            ,me
        ));

        me.setup(new rocket.subview.index_lines(
            $.extend({}, me.options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec,
            keydownLocking = false;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()
                // @note: omit form keydown
                && $(e.target).closest('form').length == 0
                && !keydownLocking){
                keydownLocking = true;

                ec.trigger('keydown', {
                    event: e
                });

                setTimeout(function(){
                    keydownLocking = false;
                }, 100);
            }
        });
    }

});

})(Zepto);

(function($){

rocket.subview.index_header = rocket.subview.extend({

    el: '#index_page_header'

    ,init: function(options){
        var me = this;

        me.appendTo(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            ,me
        ), '#index_page_header_searchbox');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
    }

    ,render: function(model){
        var me = this;
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

    ,onkeydown: function(e){
        var me = this,
            key = e.which; 

        switch(key){
            // "g" key down
            case 71:
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "0" key down
            case 79:
                me.goArticle();
                break;

            // "j" key down
            case 74:
                me.goDown();
                break;

            // "k" key down
            case 75:
                me.goUp();
                break;

        }
    }

});

})(Zepto);


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

(function($){

rocket.model.lines = rocket.model.extend({

    initialize: function(attributes, options){
        var me = this;

        me.requestData = {
            'line': 1
            ,'context_num': 25
            ,'direction': 1
        };

        me.data = [];
    }

    ,urlTemplate: _.template([
        '/?tn=notes&act=getNotesWithLineNo'
        ,'line=<%= line %>'
        ,'context_num=<%= context_num %>'
        ,'direction=<%= direction %>'
    ].join('&'))

    ,url: function(){
        var me = this;
        return me.urlTemplate(me.requestData); 
    }

    ,getData: function(){
        return this.data;
    }

    ,fetch: function(options){
        var me = this,
            req = me.requestData,
            reqOpt = options.reqdata
                ? options.reqdata 
                : {};
        
        // @note: modify request data, this will affect url() method
        for(var i in req){
            if('undefined' != typeof reqOpt[i]){
                req[i] = reqOpt[i];
            }
        }

        return Backbone.Model.prototype.fetch.apply(me, arguments); 
    }

    ,parse: function(resp, xhr){
        this.data = resp;
        return resp;
    }

});


})(Zepto);



(function($){

rocket.pageview.notes = rocket.pageview.extend({

    el: '#notes_page'

    ,init: function(options){
        var me = this,
            spm,
            subView;

        me.setup(new rocket.subview.notes_header(
            $.extend({}, me.options)
            ,me
        ));

        spm = me.getSubpageManager({
            subpageClass: rocket.subpageview.notes_lines
            ,maxSubpages: 2
        });

        subView = new rocket.subpageview.notes_lines(
            $.extend({}, me.options)
            ,me
        );

        me.append(subView);
        spm.registerSubpage(me.featureString, subView);

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec,
            keydownLocking = false;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()
                // @note: omit form keydown
                && $(e.target).closest('form').length == 0
                && !keydownLocking){
                keydownLocking = true;

                ec.trigger('keydown', {
                    event: e
                    // @note: 用于定向派发和响应
                    ,targetSubpage: me.subpageManager._currentSubpage  
                });

                setTimeout(function(){
                    keydownLocking = false;
                }, 100);
            }
        });
    }

});

})(Zepto);

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

(function($){

rocket.subview.notes_header = rocket.subview.extend({

    el: '#notes_page_header'

    ,init: function(options){
        var me = this;

        me.appendTo(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            ,me
        ), '#notes_page_header_searchbox');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
    }

    ,render: function(model){
        var me = this;
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

    ,onkeydown: function(e){
        var me = this,
            key = e.which; 

        switch(key){
            // "g" key down
            case 71:
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "0" key down
            case 79:
                me.goArticle();
                break;

            // "j" key down
            case 74:
                me.goDown();
                break;

            // "k" key down
            case 75:
                me.goUp();
                break;

        }
    }

});

})(Zepto);


(function($){

rocket.model.search_notes = rocket.model.extend({

    initialize: function(attributes, options){
        var me = this;

        me.requestData = {
            'key_words': 'test'
            ,'context_num': 1
            ,'from': 1
            ,'count': 50
        };

        me.data = [];
    }

    ,urlTemplate: _.template([
        '/?tn=notes&act=searchNotes'
        ,'key_words=<%= encodeURIComponent(key_words) %>'
        ,'context_num=<%= context_num %>'
        ,'from=<%= from %>'
        ,'count=<%= count %>'
    ].join('&'))

    ,url: function(){
        var me = this;
        return me.urlTemplate(me.requestData); 
    }

    ,getLines: function(){
        return this.data[1];
    }

    ,getKeywords: function(){
        return this.data[2];
    }

    ,getTotal: function(){
        return this.data[0].count;
    }

    ,fetch: function(options){
        var me = this,
            req = me.requestData,
            reqOpt = options.reqdata
                ? options.reqdata 
                : {};
        
        // @note: modify request data, this will affect url() method
        for(var i in req){
            if('undefined' != typeof reqOpt[i]){
                req[i] = reqOpt[i];
            }
        }

        return Backbone.Model.prototype.fetch.apply(me, arguments); 
    }

    ,parse: function(resp, xhr){
        this.data = resp;
        return resp;
    }

});


})(Zepto);



(function($){

rocket.pageview.search = rocket.pageview.extend({

    el: '#search_page'

    ,init: function(options){
        var me = this,
            spm,
            subView;

        me.setup(new rocket.subview.search_header(
            $.extend({}, me.options)
            ,me
        ));

        spm = me.getSubpageManager({
            subpageClass: rocket.subpageview.search_lines
            ,maxSubpages: 2
        });

        subView = new rocket.subpageview.search_lines(
            $.extend({}, me.options)
            ,me
        );

        me.append(subView);
        spm.registerSubpage(me.featureString, subView);

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec,
            keydownLocking = false;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()
                // @note: omit form keydown
                && $(e.target).closest('form').length == 0
                && !keydownLocking){
                keydownLocking = true;

                ec.trigger('keydown', {
                    event: e
                    // @note: 用于定向派发和响应
                    ,targetSubpage: me.subpageManager._currentSubpage  
                });

                setTimeout(function(){
                    keydownLocking = false;
                }, 100);
            }
        });
    }

});

})(Zepto);

(function($){

rocket.subpageview.search_lines
    = rocket.subpageview.uibase_vimlikelist.extend({

    className: 'search-page-lines'

    ,lineTemplate: _.template($('#template_search_lines').text())

    ,init: function(options){
        var me = this;

        me.keywords = options.keywords;

        me.model = new rocket.model.search_notes(
            {}
            ,$.extend({}, me.options)
        );

        me.isFirstLoad = true;
        me.contextNum = 1;
        me.countPerRequest = 20;

        me.$currentLine = null;
        me.linesPerFrame = 2;

        me.total = 0;

        // 适用于翻页模式
        me.currentFirst = 1;

        // 适用于无限下拉模式
        me.currentLast = 0;

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
            lines = model.getLines(),
            total = me.total,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount);

        mynotes.helper.highlight(me.keywords, lines);

        me.$el.html(
            me.lineTemplate({
                lines: lines 
            })
        );

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.ec.trigger('pageinfochange', {
                total: totalPages 
                ,current: 1
            });
        }

        me.hideLoading(500);
        me.highlightFirstLine();
        me.scrollIntoView();


        /** 无限下拉模式适用
        me.$el.append(
            me.lineTemplate({
                lines: lines 
            })
        );

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.hideLoading();
            me.highlightFirstLine();
        }
        */
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        var curLast = me.currentLast,
            reqCount = me.countPerRequest,
            retCount = model.getLines().length;

        me.total = model.getTotal();

        // @note: 无限下拉模式
        me.currentLast = retCount < reqCount 
            ? curLast + retCount 
            : curLast + reqCount;

        // console.log([
        //     me.total
        //     ,me.currentLast
        // ].join('_'));

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
                        key_words: me.keywords 
                        ,context_num: me.contextNum
                        ,from: 1 
                        ,count: me.countPerRequest 
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
                me.goArticleList();
                break;

            // "o" key down
            case 79:
                hit = true;
                me.goNotes();
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

            // ", | <" key down
            case 188:
                hit = true;
                me.goPrevPage();
                break;

            // ". | >" key down
            case 190:
                hit = true;
                me.goNextPage();
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


    /** 
     * 以下方法适用于翻页模式: goPage, goNextPage, goPrevPage
     */
    ,goPage: function(pageNo){
        var me = this,
            total = me.total,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount);

        // @todo: mutex

        if(pageNo > totalPages){
            // console.log('exceeds pages boundary');
            return;
        }

        me.showLoading(me.$el);
        me.model.fetch({
            reqdata: {
                key_words: me.keywords 
                ,context_num: me.contextNum
                ,from: (pageNo - 1) * reqCount + 1 
                ,count: reqCount 
            }
            ,success: function(){
                me.currentFirst = ( pageNo - 1 ) * reqCount + 1;

                me.ec.trigger('pageinfochange', {
                    total: totalPages 
                    ,current: pageNo
                });
            }
        });
    }

    ,goNextPage: function(){
        var me = this,
            total = me.total,
            curFirst = me.currentFirst,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount),
            pageNo = Math.floor(curFirst / reqCount) + 1;

        if(curFirst + reqCount > total){
            // console.log('no next page');
            return;
        }
        
        me.goPage(pageNo + 1);
    }

    ,goPrevPage: function(){
        var me = this,
            total = me.total,
            curFirst = me.currentFirst,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount),
            pageNo = Math.floor(curFirst / reqCount) + 1;

        if(curFirst - reqCount < 1){
            // console.log('no prev page');
            return;
        }
        
        me.goPage(pageNo - 1);
    }


    
    /** 
     * 以下方法适用于无限下拉模式: getMoreNext 
     * 暂时不用

    ,getMoreNext: function(){
        var me = this,
            curLast = me.currentLast;

        if(curLast >= me.total){
            console.log('no more lines');
            return;
        }

        me.model.fetch({
            reqdata: {
                key_words: me.keywords 
                ,context_num: me.contextNum
                ,from: curLast + 1 
                ,count: me.countPerRequest 
            }
        });
    }
    */

    ,goArticleList: function(){
        var me = this;
        setTimeout(function(){
            me.navigate(
                '#index'
            );
        }, 500);
    }

    ,goNotes: function(){
        var me = this,
            $currentLine = me.$currentLine,
            innerLineNo = 1;

        if(!$currentLine){
            return;
        }

        innerLineNo = $currentLine.find('.inner-line-number')
            .text() - 0 + 1;

        setTimeout(function(){
            me.navigate([
                '#notes'
                , '/' + innerLineNo
                , '/' + encodeURIComponent(me.keywords)
            ].join(''));
        }, 500);
    }

    ,startSearch: function(){
        var me = this; 
        me.ec.trigger('startsearch');
    }

});

})(Zepto);

(function($){

rocket.subview.search_header = rocket.subview.extend({

    el: '#search_page_header'

    ,init: function(options){
        var me = this;

        me.appendTo(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            ,me
        ), '#search_page_header_searchbox');

        me.append(new rocket.subview.search_header_pager(
            $.extend({}, options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

});

})(Zepto);

(function($){

rocket.subview.search_header_pager = rocket.subview.extend({

    el: '#search_page_header_pager'

    ,init: function(options){
        var me = this;

        me.$current = me.$('input');
        me.$total = me.$('span');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
        ec.on('pageinfochange', me.onpageinfochange, me);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

    ,onpageinfochange: function(params){
        var me = this,
            total = params.total,
            current = params.current;

        // console.log(params);
        me.$current.val(current);
        me.$total.html('/ ' + total);
    }

});

})(Zepto);

