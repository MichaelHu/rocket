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


