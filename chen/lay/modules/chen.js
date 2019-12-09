layui.extend({
    conf: 'config'
}).define(['conf'], function(exports) {
    var conf = layui.conf;
    layui.extend(conf.extend);
    self.route = layui.router();
    //初始化整个页面
    self.initPage = function(initCallback) {
        console.log('初始化整个页面!');
    }
    self.modal = {};
    self.modal.open = function(title, url, params) {
        params = $.extend({
            url: url,
            maxmin: true,
            shadeClose: false,
            title: [
                (title || '请填写头部信息'),
                'font-size:16px;color:#08132b;line-height:46px;padding-bottom:0;border-bottom:1px solid #fcfcfc;background-color:#fcfcfc'
            ]
        }, params);
        self.popup(params);
    }
    exports('chen', self);
});