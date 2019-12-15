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
    self.sidebarFocus = function(url) {
        url = url || self.route.href;
        var elem = $('#app-sidebar')
            .find('[lay-href="' + url + '"]')
            .eq(0);
        if (elem.length > 0) {
            //生成面包屑
            elem.parents('.layui-nav-item').addClass('layui-nav-itemed')
                .siblings().removeClass('layui-nav-itemed');
            elem.click();
        }
    };

    self.flexible = function(open) {
        if (open === true) {
            view.container.removeClass(self.shrinkCls);
        } else {
            view.container.addClass(self.shrinkCls);
        }
    };
    //事件发生
    self.on = function(name, callback) {
        return layui.onevent(conf.eventName, 'system(' + name + ')', callback);
    };
    //事件
    self.event = function(name, params) {
        layui.event(conf.eventName, 'system(' + name + ')', params);
    };
    //css引用
    self.csshref = function(name) {
        name = name === undefined ? self.route.path.join('/') : name;
        return conf.css + 'views/' + name + '.css' + '?v=' + conf.v;
    };
    //回退历史页面
    self.prev = function(n) {
            if (n === undefined) n = -1;
            window.history.go(n);
        }
        //定位
    self.navigate = function(url) {
            if (url === conf.entry) url = '/';
            window.location.hash = url;
        }
        //数据处理
    self.data = function(settings, storage) {
            if (settings === undefined) return layui.data(conf.tableName);
            if ($.isArray(settings)) {
                layui.each(settings, function(i) {
                    layui.data(conf.tableName, settings[i], storage);
                });
            } else {
                layui.data(conf.tableName, settings, storage);
            }
        }
        //是否是url路径测试
    self.isUrl = function(str) {
        return /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/.test(
            str
        )
    };
    //弹出框
    self.popup = function(params) {
        var url = params.url || '';
        var success = params.success || function() {};
        params.skin = 'layui-layer-admin-page';
        POPUP_DATA = params.data || {};
        var defaultParams = {
            type: 1,
            area: $(window).width() <= 750 ? ['90%', '90%'] : ['60%', '90%'];
            shadeClose: true
        };

        if (self.isUrl(url)) {
            params.type = 2;
            params.content = url;
            layer.open($.extend(defaultParams, params));
            return;
        }

        view.tab.del(url);

        view.loadHtml(conf.views + url, function(res) {
            var htmlElem = $('<div>' + res.html + '</div>');

            if (params.title === undefined) {
                params.title = htmlElem.find('title').text() || '信息';
                if (params.title) htmlElem.find('title').remove();
            }
            params.content = htmlElem.html();
            params.success = function(layer, index) {
                success(layer, index);

                view.parse(layer);
            };

            params = $.extend(defaultParams, params);
            layer.open($.extend(defaultParams, params));
        });
    };

    var mobileWidth = 991;
    var isMobileAdapter = false;
    //调整成手机尺寸
    function mobileAdapter() {
        self.flexible(false);
        var device = layui.device();
        if (device.weixin || device.android || device.ios) {
            //点击空白处关闭侧边栏
            $(document).on('click', '#' + conf.containerBody, function() {
                if ($(window).width() < mobileWidth &&
                    !view.container.hasClass(self.shrinkCls)) {
                    self.flexible(false);
                }
            });
        }
        isMobileAdapter = true;
    }
    //重新调整尺寸
    $(window).on('resize', function(e) {
        if ($(window).width() < mobileWidth) {
            if (isMobileAdapter === true) return;
            mobileAdapter();
        } else {
            isMobileAdapter = false;
        }
    });

    $(window).on('hashchange', function(e) {
        //移动端跳转连接先把导航关闭
        if ($(window).width() < mobileWidth) {
            self.flexible(false);
        }
        self.route = layui.router();
        layer.closeAll();
        self.initView(self.route);
    });

    //点击lay-href时,触发事件
    $(document).on('click', '[lay-href]', function(e) {
        var href = $(this).attr('lay-href');
        var target = $(this).attr('target');

        if (href === '') return;
        if (self.isUrl(href)) {
            next();
        }

        function next() {
            target === '__blank' ? window.open(href) : self.navigate(href);
        }
        if ($.isFunction(self.routeLeaveFunc)) {
            self.routeLeaveFunc(self.route + "asdfasdf", href, next);
        } else {
            next();
        }
        return false;

    });
    //点击lay-popup弹出框响应事件
    $(document).on('click', '[lay-popup]', function(e) {
        var params = $(this).attr('lay-popup');
        self.popup(
            params.indexOf('{') === 0 ?
            new Function('return ' + $(this).attr('lay-popup'))() :
            { url: params }
        );
        return false;
    });
    //鼠标进入,类似于mouseover,不过不受子元素影响
    $(document).on('mouseenter', '[lay-tips]', function(e) {
        var title = $(this).attr('lay-tips');
        var dire = $(this).attr('lay-dire') || 3;
        if (title) {
            layer.tips(title, $(this), {
                tips: [dire, '#163147']
            });
        }
    });
    //鼠标离开,类似于mouseout,不过不受子元素影响
    $(document).on('mouseleave', '[lay-tips]', function(e) {
        layer.closeAll('tips');
    });

    $(document).on('click', '*[' + conf.eventName + ']', function(e) {
        self.event($(this).attr(conf.eventName), $(this))
    });

    var shrinkSidebarBtn = '.' + self.shrinkCls + ' #app-sidebar .layui-nav-item a';

    $(document).on('click', shrinkSidebarBtn, function(e) {
        if (isMobileAdapter === true) return;
        var chileLength = $(this).parent().find('.layui-nav-child').length;
        if (chileLength > 0) {
            self.flexible(true);
            layer.closeAll('tips');
        }
    });

    $(document).on('mouseenter', shrinkSidebarBtn, function(e) {
        var title = $(this).attr('title');
        if (title) {
            layer.tips(title, $(this).find('.layui-icon'), {
                tips: [2, '#263147']
            })
        }
    });
    $(document).on('mouseleave', shrinkSidebarBtn, function(e) {
        layer.closeAll('tips')
    });

    self.on('flexible', function(init) {
        var status = view.container.hasClass(self.shrinkCls);
        self.flexible(status);
        self.data({ key: 'flexible', value: status })
    });
    self.on('refresh', function(e) {
        var url = self.route.href;
        if (conf.viewTabs === true) {
            //view.tab.refresh(url);
        } else {
            view.render(location.hash)
        }
    });
    self.on('prev', function(e) {
        self.prev()
    });
    if ($(window).width() <= mobileWidth) {
        mobileAdapter()
    } else {
        var flexibleOpen = self.data().flexible;
        self.flexible(flexibleOpen === undefined ? true : flexibleOpen)
    }


    self.modal = {};

    self.model.base = function(msg, params) {
        params = params || {};
        params.titleIconColor = params.titleIconColor || '#5a8bff';
        params.titleIco = params.titleIco || 'exclaimination';
        params.title = params.title || [
            '<i class = "layui-icon layui-icon-' +
            params.titleIco +
            '" style="font-size:12px;background:' +
            params.titleIconColor +
            ';display:inline-block;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-redius:50%;margin-right:12px;"></i>' +
            params.titleValue,
            'background:#fff;border:none;font-weight:bold;font-size:16px;color:#08132b;padding-top:10px;height:36px;line-height:46px;padding-bottom:0;'
        ];
        params = $.extend({
                skin: 'layui-layer-admin-modal chen-alert',
                area: [windowWidth <= 750 ? '60%' : '400px'],
                closeBtn: 0,
                shadeClose: false
            },
            params
        );
        layer.alert(msg, params);
    }

    // -------------- 弹窗类 ---------------------------//
    self.alert = {};
    //配置弹窗参数
    function alertParams(msg, params) {
        params.time = 3000;
        params.shade = 0;
        params.btn = null;
        params.title = [
            '<i class="layui-icon layui-icon-' +
            params.titleIco +
            '" style="font-size:12px;background:' +
            params.titleIconColor +
            ';display:inline-block;font-weight:600;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-redius:50%;margin-right:12px;"></i>' +
            (msg || '请填写提示信息'),
            'background:#fff;border:none;font-weight:500;font-size:14px;color:#08132b;margin-bottom:-50px;padding:16px;height:45px;line-height:14px;padding-bottom:0;'
        ];
        params.offset = '40px';
        params.area = [windowWidth <= 750 ? '80%' : '400px'];
    }
    //返回成功弹窗
    self.alert.success = function(msg, params) {
        params = params || {};
        params.titleIco = 'ok';
        params.titleIconColor = '#30d180';
        alertParams(msg, params);
        self.model.base('', params);
    }

    //返回警告弹窗
    self.alert.warn = function(msg, params) {
            params = params || {};
            params.titleIco = 'exclaimination'; //感叹号
            params.titleIcoColor = '#ffc107';
            alertParams(msg, params);
            self.modal.base('', params);
        }
        //返回错误弹窗
    self.alert.error = function(msg, params) {
            params = params || {};
            params.titleIco = 'close';
            params.titleIcoColor = '#ff5652';
            alertParams(msg, params);
            self.modal.base('', params);
        }
        //返回信息弹窗
    self.alert.info = function(msg, params) {
        params = params || {};
        params.titleIco = 'infomation';
        params.titleIcoColor = '#2db7f5';
        alertParams(msg, params);
        self.modal.base('', params);
    };

    // ---------------------- 模态框类 --------------------------//

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