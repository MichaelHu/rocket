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


