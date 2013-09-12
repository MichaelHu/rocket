// rocket.subpageview.js
/**
 * subpageview类，子页面视图控制器
 */
(function($) {

rocket.subpageview = rocket.baseview.extend({

    // 初始化函数
    initialize: function(options, parentView){
        if(parentView instanceof rocket.baseview){
            rocket.baseview.prototype.initialize.call(this, options, parentView);
        }
        else{
            throw Error('rocket.subpageview creation: must supply parentView, which is an instance of rocket.baseview');
        }
    }

    ,isActiveSubpage: function(){
        var me = this;
        return me.$el.css('display') == 'block';
    }

});

})(Zepto);




