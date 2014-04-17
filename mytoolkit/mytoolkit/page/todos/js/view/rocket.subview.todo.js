(function($){

rocket.subview.todo = rocket.subview.extend({

    //... is a list tag.
    tagName:  "li"

    // Cache the template function for a single item.
    ,template: _.template($('#item-template').html())

    // The DOM events specific to an item.
    ,events: {
        'click .toggle'   : 'toggleDone'
        ,'dblclick .view'  : 'edit'
        ,'click a.destroy' : 'clear'
        ,'keypress .edit'  : 'updateOnEnter'

        // "blur", "focus"事件在rocket下不能通过这种方式注册
        // ,'blur .edit'      : 'close'
    }

    ,init: function(options){
        var me = this;
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        me.listenTo(me.model, 'change', me.render);
        me.listenTo(me.model, 'destroy', me.remove);

    }

    ,render: function(data){
        var me = this;

        me.$el.html(me.template(me.model.toJSON()));
        me.$el.toggleClass('done', me.model.get('done'));
        me.input = me.$('.edit');

        me.input.on('blur', function(e){
            me.close(e);
        });

        return me;
    }

    // Toggle the `"done"` state of the model.
    ,toggleDone: function() {
        this.model.toggle();
    }

    // Switch this view into `"editing"` mode, displaying the input field.
    ,edit: function() {
        this.$el.addClass("editing");
        this.input.focus();
    }

    // Close the `"editing"` mode, saving changes to the todo.
    ,close: function() {
        var value = this.input.val();
        if (!value) {
            this.clear();
        } else {
            this.model.save({title: value});
            this.$el.removeClass("editing");
        }
    }

    // If you hit `enter`, we're through editing the item.
    ,updateOnEnter: function(e) {
        if (e.keyCode == 13) this.close();
    }

    // Remove the item, destroy the model.
    ,clear: function() {
        this.model.destroy();
    }

});

})(Zepto);

