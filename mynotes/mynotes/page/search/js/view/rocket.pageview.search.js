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
