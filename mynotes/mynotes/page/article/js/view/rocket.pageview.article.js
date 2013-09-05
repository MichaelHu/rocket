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
            ec = me.ec;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()){
                ec.trigger('keydown', {
                    event: e
                });
            }
        });
    }

});

})(Zepto);
