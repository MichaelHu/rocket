fis.config.merge({
    roadmap : {
        path : [
            {
                reg : /^\/.+-aio.*\.(css|js)$/i,
                release : "/release$&"
            }
        ]
    }
});

fis.config.del('modules.optimizer.html');
