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


