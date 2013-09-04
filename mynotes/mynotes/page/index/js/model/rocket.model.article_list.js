(function($){

rocket.model.article_list = rocket.model.extend({

    initialize: function(attributes, options){
        var me = this;
    }

    ,url: function(){
        return '/?tn=notes&act=getArticleAbstracts&from_article_id=1&context_num=25'; 
    }

    ,parse: function(resp, xhr){
        return resp[0];
    }

});


})(Zepto);


