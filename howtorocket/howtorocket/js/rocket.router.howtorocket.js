/**
 * vs产品的Router类
 */
(function($) {

rocket.router.howtorocket = rocket.router.extend({

    // 路由配置
    routes: {
        '': 'howtoindex'
        ,'howto/:title': 'howto'
        ,'howtoindex': 'howtoindex'
        // '*defaultUrl': 'defaultRoute'
    }

    // 页面切换顺序配置
    ,pageOrder: [
        'howtoindex'
        , 'howto'
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

        'howtoindex-howto': 'fade'
    }

    ,howtoindex: function(){
        this.doAction('howtoindex', {});
    }

    ,howto: function(title){
        this.doAction('howto', {
            title: decodeURIComponent(title)
        });
    }

    ,defaultRoute: function(defaultUrl) {
        Backbone.history.navigate('index', {trigger: true, replace: true});
    }

    /**
     * action处理逻辑
     * @{param} action {string} action名称
     * @{param} params {object} action参数
     * @{param} statOptions {object} 统计选项{disable:是否屏蔽统计,默认开启;param:{key: value,key: value}}]统计参数}
     */
    ,doAction: function(action, params, statOptions){
        // 必须延时，否则动画性能大打折扣
        // $.later(function(){
        //     var opts = statOptions ? statOptions : {}
        //     if(!opts.disable){
        //         var statObj = _.extend({
        //             'wa_type': action,
        //             'act' : 'switch'
        //         }, opts.params ? opts.params : {});
        //         rocket.v(statObj);
        //     }
        // });

        rocket.router.prototype.doAction.apply(this, arguments);
    }

}); 

})(Zepto);




