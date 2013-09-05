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

