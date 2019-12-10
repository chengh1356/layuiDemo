//视图路由
layui.extend({
    loadBar: 'lay/modules/loadBar',
    dropdown: 'lay/modules/dropdown'
}).define(['jquery', 'laytpl', 'element', 'form', 'loadBar', 'dropdown'],
    function(exports) {
        var $ = layui.jquery;
        var laytpl = layui.laytpl;
        var conf = layui.conf;
        conf.viewTabs = currentUser.isTab === '1';
        var loadBar = layui.loadBar;
        var self = {
            ie8: navigator.appName === 'Microsoft Internet Explorer' &&
                navigator.appVersion.split(';')[1].replace(/[]/g, '') === 'MSIE8.0',
            container: $('#' + conf.container),
            containerBody: null
        };
        self.loadBar = loadBar;
        /**
         * 字符串是否含有html标签的检测
         * @param htmlStr
         */
        self.checkHtml = function(htmlStr) {
            var reg = /<[^>]+>/g;
            return reg.test(htmlStr);
        };
        //找到模板，填充
        self.parse = function(container) {
            if (container === undefined) container = self.containerBody;
            var template = container.get(0).tagName === 'SCRIPT' ?
                container :
                container.find('[template]');
            //渲染template    
            var renderTemplate = function(template, data, callback) {
                laytpl(template.html()).render(data, function(html) {
                    try {
                        html = $(self.checkHtml(html) ? html : '<span>' + html + '</span>');
                    } catch (error) {
                        html = $('<span>' + html + '</span>');
                    }

                    html.attr('is-template', true);
                    template.after(html);
                    if ($.isFunction(callback)) callback(html);
                });
            };

            layui.each(template, function(index, t) {
                var tem = $(t);
                var url = tem.attr('lay-url') || '';
                var api = tem.attr('lay-api') || '';
                var type = tem.attr('lay-type') || 'get';
                var data = new Function('return ' + tem.attr('lay-data'))();
                var done = tem.attr('lay-done') || '';
                //如果有url或api根据ajax请求获取到的data，渲染template
                if (url || api) {
                    //进行AJAX请求
                    self.request({
                        url: url,
                        api: api,
                        type: type,
                        data: data,
                        success: function(res) {
                            templateData = data;
                            renderTemplate(tem, res.data);
                            if (done) new Function(done)();
                        }
                    })
                } else {
                    //否则根据link链接跳转
                    renderTemplate(tem, {}, self.ie8 ?

                        function(elem) {
                            if (elem[0] && elem[0].tagName !== 'LINK') return;
                            container.hide();
                            elem.load(function() {
                                container.show();
                            })
                        } :
                        null
                    );
                    if (done) new Function(done)()
                }
            })
        };
        //加载过程中，添加转圈圈的图标
        self.loading = function(elem) {
            elem.append(
                (this.elemLoad = $(
                    '<i class="layui-anim layui-anim-rotate layui-anim-loop layui-icon layui-icon-loading chen-loading"></i>'
                ))
            )
        };
        //加载结束，移除转圈圈的图标
        self.loadend = function() {
                this.elemLoad && this.elemLoad.remove()
            }
            //设置title
        self.setTitle = function(title) {
            $(document).attr({ title: title + ' - ' + conf.name })
        };
        //清除
        self.clear = function() {
                self.containerBody.html('');
            }
            //填充的对象
        self.modal = {};
        //基础弹出层
        self.modal.base = function(msg, params) {
            params = params || {};
            params.titleIcoColor = params.titleIcoColor || '#5a8bff';
            params.titleIco = params.titleIco || 'exclaimination';
            params.title = params.title || [
                '<i class="layui-icon layui-icon-' +
                parmas.titleIco +
                '" style="font-size:12px;background:' +
                parmas.titleIcoColor +
                ';display:inline-block;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-redius:50%;margin-right:12px;"></i>' +
                params.titleValue,
                'background:#fff;border:none;font-weight:bold;font-size:16px;color:#08132b;padding-top:20px;height:36px;line-height:46px;padding-bottom:0;'
            ];
            params = $.extend({
                skin: 'layui-layer-admin-modal chen-alert',
                area: [$(window).width() <= 750 ? '60%' : '400px'],
                closeBtn: 0,
                shadeClose: false
            }, params);
            //弹出层
            layer.alert(msg, params);
        };
        //通知弹出层
        self.notify = function(title, msg, yes, params) {
                params = params || {};
                params.titleIco = 'exclaimination';
                params.titleIcoColor = '#ffc107';
                params.titleValue = title;
                params.shadeClose = false;
                params = $.extend({
                    btn: ['确定'],
                    yes: function(index, layero) {
                        yes && (yes)();
                        layer.close(index);
                    }
                }, params);
                self.modal.base(msg, params);
            }
        //加载html
        self.loadHtml = function(url, callback) {
            url = url || conf.entry;
            loadBar.start();
            var queryIndex = url.indexOf('?');
            if (queryIndex !== -1) url = url.slice(0, queryIndex);
            $.ajax({
                url: (url.indexOf(conf.base) === 0 ? '' : conf.views) +
                    url + conf.engine + '?v=' + conf.v,
                type: 'get',
                data: {
                    'invalid_ie_cache': new Date().getTime()
                },
                dataType: 'html',
                success: function(r) {
                    var result;
                    try {
                        result = JSON.parse(r);
                    } catch (e) {
                        result = { 'code': 'err' };
                    }
                    if (result.code === 401) {
                        self.notify('登录失效', '登录已失效，请重新登录', function() {
                            window.location.reload();
                            window.location.hash = '';
                        });
                        loadBar.finish();
                        return;
                    }
                    if (result.code === 403) {
                        self.tab.change('/403');
                        loadBar.finish();
                        return;
                    }
                    if (result.code === 404) {
                        self.tab.change('/404');
                        loadBar.finish();
                        return;
                    }
                    if (result.code === 500) {
                        self.tab.change('/500');
                        loadBar.finish();
                        return;
                    }
                    callback({ html: r, url: url });
                    loadBar.finish();
                },
                error: function(res) {
                    if (res.status === 404) {
                        self.tab.change('/404');
                    }
                    if (res.status === 403) {
                        self.tab.change('/403');
                    }
                    if (res.status === 500) {
                        self.tab.change('/500');
                    }
                    self.log(
                        '请求视图文件异常\n文件路径：' + url + '\n状态：' + res.status
                    );
                    loadBar.error();
                }
            })
        };
        //主页面的菜单tab操作
        self.tab = {
            isInit: false,
            data: [],
            tabMenuIplId: 'TPL-app-tabsmenu',
            minLeft: null,
            maxLeft: null,
            wrap: '.chen-tabs-wrap',
            menu: '.chen-tabs-menu',
            next: '.chen-tabs-next',
            prev: '.chen-tabs-prev',
            step: 200,
            init: function() {
                var tab = this;
                var btnCls = tab.wrap + ' .chen-tabs-btn';
                layui.dropdown.render({
                    elem: '.chen-tabs-down',
                    click: function(name) {
                        if (name === 'all') {
                            tab.delAll();
                        }
                        if (name === 'other') {
                            tab.delOther();
                        }
                        if (name === 'current') {
                            tab.del(layui.chen.route.fileurl);
                        }
                        if (name === 'refresh') {
                            tab.refresh();
                        }
                    },
                    options: [{
                        name: 'current',
                        title: '关闭当前选项卡'
                    }, {
                        name: 'other',
                        title: '关闭其他选项卡'
                    }, {
                        name: 'all',
                        title: '关闭所有选项卡'
                    }, {
                        name: 'refresh',
                        title: '刷新当前选项卡'
                    }]
                });

                $(document).on('click', btnCls, function(e) {
                    var url = $(this).attr('lay-url');
                    if ($(e.target).hasClass('chen-tabs-close')) {
                        tab.del(url);
                    } else {
                        var type = $(this).attr('data-type');
                        if (type === 'page') {
                            tab.change(tab.has(url));
                        } else if (type === 'prev' || type === 'next') {
                            tab.menuElem = $(tab.menu);
                            var menu = tab.menuElem;
                            tab.minLeft = tab.minLeft || parseInt(menu.css('left'));
                            tab.maxLeft = tab.maxLeft || $(tab.next).offset().left;
                            var left = 0;
                            if(type === 'prev'){
                                left = parseInt(menu.css('left'))+tab.step;
                                if(left >= tab.minLeft)left = tab.minLeft;
                            }else{
                                left = parseInt(menu.css('left')) - tab.step;
                                var last = menu.find('li:last');
                                if(last.offset().left + last.width() < tab.maxLeft)return;
                            }
                            menu.css('left',left);
                        }
                    }
                });
                $('.chen-tabs-hidden').addClass('layui-show');
                this.isInit = true;
            },
            has:function(url){
                var exists = false;
                layui.each(this.data,function(i,data){
                    if(data.fileurl === url)return (exists = data);
                });
                return exists;
            },
            delAll:function(type){
                var tab = this;
                var menuBtnClas = tab.menu + ' .chen-tabs-btn';
                $(menuBtnClas).each(function(){
                    var url = $(this).attr('lay-url');
                    if(url === conf.entry)return true;
                    tab.del(url);
                })
            },
            delOther:function(){
                var tab = this;
                var menuBtnClas = tab.menu + ' .chen-tabs-btn';
                $(menuBtnClas + ' .chen-tabs-active')
                    .siblings()
                    .each(function(){
                        var url = $(this).attr('lay-url');
                        tab.del(url);
                    })
            },
            del:function(url,backgroundDel){
                var tab = this;
                if(tab.data.length<=1 && backgroundDel === undefined)return;
                layui.each(tab.data,function(i,data){
                    if(data.fileurl === url){
                        tab.data.splice(i,1);
                        return true;
                    }
                });
                var lay = '[lay-url="'+url+'"]';
                var thisBody = $('#'+conf.containerBody+'> .chen-tabs-item'+lay);
                var thisMenu  = $(this.menu).find(lay);
                thisMenu.remove();
                thisBody.remove();

                if(backgroundDel === undefined){
                    if(thisMenu.hasClass('chen-tabs-active')){
                        $(this.menu + ' li:last').click();
                    }
                }
            },
            refresh:function(url){
                
            }
        }
        self.start = function(config){
            this.config = $.extend(this.config,config || {});
            if(this.barTimer){
                clearInterval(this.barTimer);
                setBarWidth(0);
            }
            if(this.elem === null){
                this.elem = $('<div id="chen-loadbar"></div>');
                $('body').prepend(this.elem);
            }
            this.elem.css({
                'height':this.config.height,
                'backgroundColor':this.config.color,
                'position':'fixed',
                'top':0,
                'left':0,
                'width':0,
                'opacity':1,
                'zIndex':2000,
                'transition':'all .2s linear'
            });

            addBarWidth(randomNum(1,10));
            this.barTimer = setInterval(function(){
                addBarWidth(randomNum(1,10));
                if(self.barWidth >= 75)self.barWidth = 75
            },160);
        };

       
    });