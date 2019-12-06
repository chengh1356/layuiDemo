layui.extend({
    conf: 'config'
}).define(['conf'], function(exports) {
    var conf = layui.conf;
    layui.extend(conf.extend);
    exports('chen', self)
});