layui.define(function(exports) {
    exports('conf', {
        container: 'chen',
        containerBody: 'chen-body',
        v: '2.0',
        base: layui.cache.base,
        css: layui.cache.base + 'css/',
        views: layui.cache.base + 'views/',
        viewLoadBar: true,
        debug: layui.cache.debug,
        name: 'chen',
        entry: '/index',
        engine: '',
        eventName: 'chen-event',
        tableName: 'chen',
        requestUrl: './'
    })
});