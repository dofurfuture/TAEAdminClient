//table结构初始化
function TableInit(param) {
    if(param.tableType=="default"){
        $(param.table).dataTable({
            serverSide: true,   //启用服务器端分页
            searching: false,    //禁用原生搜索
            processing: false,
            autoWidth:true,
            columns: param.columns,
            sDom: CONSTANT.DATA_TABLES.DEFAULT_OPTION.sDom,
            oLanguage: CONSTANT.DATA_TABLES.DEFAULT_OPTION.oLanguage,
            ajax : function(data, callback, settings) {
                var orderName=data.columns[(data.order[0].column)].data;
                RequestByAjax({
                    url:param.ajax.url,
                    type:param.ajax.type,
                    data:JSON.stringify({
                        "pageNumber":(data.start/data.length)+1,
                        "pageSize":data.length,
                        //排序字段名(必须与后台字段同名)
                        "orderName":orderName,
                        //asc desc 正序或者逆序
                        "orderType":data.order[0].dir,
                        //模糊查询字段，可为多个(字段名必须与后台同名)
                        "search":{}
                    }),
                    success:function (response) {
                        var returnData = {
                            draw : data.draw,
                            recordsTotal : response.Total,
                            recordsFiltered : response.Total,//后台不实现过滤功能，每次查询均视作全部结果
                            data : response.DataList
                        };
                        callback(returnData);
                        //执行回调函数
                        param.success();
                    } ,
                    error:param.ajax.error
                })
            },
            //初始化
            fnInitComplete: function(settings, json) {
                if ($.isFunction($.fn['select2'])) {
                    $('.dataTables_length select', settings.nTableWrapper).select2({
                        minimumResultsForSearch: -1
                    });
                }
                var options = $('table', settings.nTableWrapper).data('plugin-options') || {};
                var $search = $('.dataTables_filter input', settings.nTableWrapper);
                $search.attr({
                        placeholder: typeof options.searchPlaceholder !== 'undefined' ? options.searchPlaceholder : 'Search'
                    }).addClass('form-control');

                if ($.isFunction($.fn.placeholder)) {
                    $search.placeholder();
                }
            },
        });
    }
    else if(param.tableType=="details"){
        detailsTableInit(param.table)
    }
    else if(param.tableType=="tabletools"){
        tabletoolsTableInit(param.table)
    }
    else if(param.tableType=="all"){
        detailsTableInit(param.table);
        tabletoolsTableInit(param.table)
    }
    else {
        $(param.table).dataTable();
    }
};
function detailsTableInit(tableSelector){
    var $table = $(tableSelector);
    // format function for row details
    var fnFormatDetails = function( datatable, tr ) {
        var data = datatable.fnGetData( tr );

        return [
            '<table class="table mb-none">',
            '<tr class="b-top-none">',
            '<td><label class="mb-none">Rendering engine:</label></td>',
            '<td>' + data[1]+ ' ' + data[4] + '</td>',
            '</tr>',
            '<tr>',
            '<td><label class="mb-none">Link to source:</label></td>',
            '<td>Could provide a link here</td>',
            '</tr>',
            '<tr>',
            '<td><label class="mb-none">Extra info:</label></td>',
            '<td>And any further details here (images etc)</td>',
            '</tr>',
            '</div>'
        ].join('');
    };
    // insert the expand/collapse column
    var th = document.createElement( 'th' );
    var td = document.createElement( 'td' );
    td.innerHTML = '<i data-toggle class="fa fa-plus-square-o text-primary h5 m-none" style="cursor: pointer;"></i>';
    td.className = "text-center";

    $table
        .find( 'thead tr' ).each(function() {
        this.insertBefore( th, this.childNodes[0] );
    });

    $table
        .find( 'tbody tr' ).each(function() {
        this.insertBefore(  td.cloneNode( true ), this.childNodes[0] );
    });
    // initialize
    var datatable = $table.dataTable({
        aoColumnDefs: [{
            bSortable: false,
            aTargets: [ 0 ]
        }],
        aaSorting: [
            [1, 'asc']
        ]
    });
    // add a listener
    $table.on('click', 'i[data-toggle]', function() {
        var $this = $(this),
            tr = $(this).closest( 'tr' ).get(0);

        if ( datatable.fnIsOpen(tr) ) {
            $this.removeClass( 'fa-minus-square-o' ).addClass( 'fa-plus-square-o' );
            datatable.fnClose( tr );
        } else {
            $this.removeClass( 'fa-plus-square-o' ).addClass( 'fa-minus-square-o' );
            datatable.fnOpen( tr, fnFormatDetails( datatable, tr), 'details' );
        }
    });
};
function tabletoolsTableInit(tableSelector){
    var $table = $(tableSelector);
    $table.dataTable({
        sDom: "<'text-right mb-md'T>" + $.fn.dataTable.defaults.sDom,
        oTableTools: {
            sSwfPath: $table.data('swf-path'),
            aButtons: [
                {
                    sExtends: 'pdf',
                    sButtonText: 'PDF'
                },
                {
                    sExtends: 'csv',
                    sButtonText: 'CSV'
                },
                {
                    sExtends: 'xls',
                    sButtonText: 'Excel'
                },
                {
                    sExtends: 'print',
                    sButtonText: 'Print',
                    sInfo: 'Please press CTR+P to print or ESC to quit'
                }
            ]
        }
    });
}

