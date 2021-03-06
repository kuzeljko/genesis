/**
 * jQuery FB list box
 * 
 */
(function($)
{
    /**
     * main gmailname function
     */
    $.fn.hfbList = function(options)
    {
        //create options
        $.fn.hfbList.options = $.extend({}, $.fn.hfbList.defaults, options);
        var opts = $.fn.hfbList.options;

        // return the object back to the chained call flow
        return this.each(function()
        {
            //set tpl
            if(!$(this).data('tpl')){
                if(typeof(opts.tpl) == 'object'){
                    $(this).data('tpl',opts.tpl);
                }
                else{
                    $(this).data('tpl',$.fn.hfbList.loadTpl(opts.tpl));
                }                
            }
            //set url
            if(opts.url){
                $(this).data('url',opts.url);
            }
            //process callback
            if(opts.process){
                $(this).data('process',opts.process);
            }
            //params
            if(opts.params){
                $(this).data('params',opts.params);
            }
            //pager
            if(opts.pager){
                $(this).data('pager',opts.pager);
            }
            //call ajax
            var self = $(this);
            if(self.data('url')){
                $.get(self.data('url'), self.data('params'), function(data){
                    self.html($.fn.hfbList.tmpl(self.data('tpl').html(), data));
                    var processFunction = self.data('process');
                    if(processFunction){
                        processFunction(self,data);
                    }
                    //render pager
                    if(self.data('pager')){
                        $.fn.hfbList.pager(self.data('pager'),self,data.page,data.perPage,data.total);
                    }
                    
                });
            }
        });
    };

    var cache = {};

    $.fn.hfbList.tmpl = function (str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            $.fn.hfbList.tmpl(document.getElementById(str).innerHTML) :

          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };

    $.fn.hfbList.loadTpl = function(url,callback){
        if($.fn.hfbList.tpls[url] == null){
            $.get(url, function(data){
                $.fn.hfbList.tpls[url] = data;
                if(callback){
                    callback(data);
                }
            }, 'html');            
        }
        else{
            if(callback){
                callback($.fn.hfbList.tpls[url]);
            }
        }


        return $.fn.hfbList.tpls[url];
    }

    $.fn.hfbList.pager = function(pagerObj,listObj,page,perPage,pages){
        var opts = $.fn.hfbList.options;

        page = parseInt(page);
        perPage = parseInt(perPage);
        pages = parseInt(pages);
        
        if(pages == 0 || pages == 1){
            //return '';
        }
        if(page > pages){
            page = 1;
        }
        var range = Math.floor(opts.pagerRange / 2);
        var pageRange = [];
        var rangeStart = Math.max(1, page - range) ;
        var rangeEnd = Math.min(rangeStart + opts.pagerRange - 1,pages);
        for(var i = rangeStart; i <= rangeEnd; i++){
            pageRange.push(i);
        }
        var pageData = {
            'page': page,
            'perPage': perPage,
            'pages': pages,
            'pageRange': pageRange,
            'prev': page - 1,
            'next': page + 1
        }
        $.fn.hfbList.loadTpl('/plugins/hfb/tpls/pager.tpl',function(tplString){
            pagerObj.html($.fn.hfbList.tmpl(tplString, pageData));
            //attach links
            pagerObj.find('a').click(function(){
                var params = listObj.data('params');
                params.page =$(this).data('page');
                $(listObj).hfbList({
                    'params':params
                });
                return false;
            });
        });
    }

    /**
     * default options
     */
    $.fn.hfbList.tpls =
    {};

    /**
     * default options
     */
    $.fn.hfbList.defaults =
    {
        'pagerRange': 7
    };

    /**
     * running options
     */
    $.fn.hfbList.options = {};
})(jQuery); // pass the jQuery object to this function