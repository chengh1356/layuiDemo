layui.extend({
    conf: 'config',
    api: 'lay/modules/api',
    view: 'lay/modules/view'
}).define(['conf', 'view', 'api', 'jquery', 'table'], function(exports) {
    POPUP_DATA = {};
    var conf = layui.conf;
    var layuiTable = layui.table;
    var view = layui.view;
    var element = layui.element;
    var $ = layui.jquery;
    var $bread = $('#chen-layout .chen-breadcrumb');

    layui.extend(conf.extend);
    var self = {};
    var windowWidth = $(window).width();

    conf.viewTabs = currentUser.isTab === '1';
    self.route = layui.router();
    self.view = view;
    self.api = layui.api;
    self.closeOnceHashChange = false;
    self.ie8 = view.ie8;
    self.get = view.request;
    self.appBody = null;
    self.shrinkCls = 'chen-sidebar-shrink';
    self.isInit = false;
    self.routeLeaveFunc = null;
    self.routeLeave = function(callback) {
        this.routeLeaveFunc = callback;
    }
    self.render = function(elem) {
        if (typeof elem == 'string') elem = $('#' + elem);
        var action = elem.get(0).tagName === 'SCRIPT' ? 'next' : 'find';
        elem[action]('[is-template]').remove();
        view.parse(elem);
    };
    //初始化整个页面
    self.initPage = function(initCallback) {
        //加载样式文件
        layui.each(layui.conf.style, function(index, url) {
            layui.link(url + '?v=' + conf.v);
        });
        self.initView(self.route);
    };
    //post传值方法
    self.post = function(params) {
            view.request($.extend({ type: 'post' }, params));
        }
        //初始化视图区域
    self.initView = function(route) {
        if (!self.route.href || self.route.href === '/') {
            self.route = layui.router('#' + conf.entry);
            route = self.route;
        }
        route.fileurl = '/' + route.path.join('/');
        if ($.inArray(route.fileurl, conf.indPage) === -1) {
            var loadRenderPage = function(params) {
                if (conf.viewTabs === true) {
                    view.renderTabs(route);
                } else {
                    view.render(route.fileurl);
                }
            };
            if (view.containerBody == null) {
                //加载layout文件
                view.renderLayout(function() {
                    //重新渲染导航
                    element.render('nav', 'chen-sidebar');
                    //加载视图文件
                    loadRenderPage();
                })
            } else {
                //layout文件已加载，加载视图文件
                loadRenderPage();
            }
        } else {
            //加载单页面
            view.renderIndPage(route.fileurl, function() {
                if (conf.viewTabs === true) view.tab.clear();
            });
        }
    }
    //根据当前加载的URl高亮左侧导航
    self.sidebarFocus = function(url){
        url = url || self.route.href;
        var elem = $('#app-sidebar')
                    .find('[lay-href="'+url+'"]')
                    .eq(0);
        if(elem.length > 0){
            //生成面包屑
            elem.parents('.layui-nav-item').addClass('layui-nav-itemed')
                .siblings().removeClass('layui-nav-itemed');
            elem.click();    
        }            
    };
    

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