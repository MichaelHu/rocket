(function($){

rocket.model.todo = rocket.model.extend({

    // Default attributes for the todo item.
    defaults: function() {
        return {
            title: "empty todo...",
            // order: Todos.nextOrder(),
            order: this.collection.nextOrder(),
            done: false
        };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
        this.save({done: !this.get("done")});
    }

});


})(Zepto);



