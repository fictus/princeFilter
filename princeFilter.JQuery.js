/*
    princeFilter.JQuery.js
    ======================

    VERSION 2.2


    Created by Luis Valle (created date: 8/19/2014, updated v.2.2: 6/17/2016)
    www.evicore.net/princeFilter.aspx

    JQuery plugin for filtering table-data. 
    (this plugin can be used on multiple tables at the same time)



    BASIC MODE
    ----------
        Use the following operands to filter your table-data:
            • 'equals'
            • 'not-equals'
            • 'like'
            • 'starts with'
            • 'ends with'
            • 'less than'
            • 'greater than'
            • 'true' or 'false' (for cells that contain checkboxes).

            [HOW TO USE]
                Instantiate princeFilter this way:

                        $('#tbl_MytableID').princeFilter();


    SQL (STORED PROCEDURE) MODE
    ---------------------------
        SQL mode only offers two operands:
            • 'equals' (use the % wildcard to get LIKE matches)
            • 'between' (for filtering numeric cells within a low & high numeric range)

            [HOW TO USE]
                Instantiate princeFilter this way:

                        // Make sure you physically create a blank HTML table in your markup like <table id="tbl_MytableID"></table>

                        // Make sure you match-up your column names exactly as your SQL table names

                        var myColumns = [
                            'ItemNumber',
                            'ItemDescription',
                            'ShipmentDate'
                        ];
                        $('#tbl_MytableID').princeFilter({
                            mode: 'sql',
                            storedproc: 'spMyStoredProcedure',
                            constring: 'ConnectionStringNameFromWebConfigFile',
                            ajaxurl: 'urltoYourASHXorWebService',
                            columns: myColumns,
                            pagesize: '100',
                            cssClass: 'yourCustomCSSclass'
                        });





    Then just click the desired Column's "FUNNEL" button to filter that Column's data...

*/
var prncFltrAJAXurl = null;
$(document).ready(function () {
    checkForJSONstringify();
});
$(document).on('click', function (e) {
    try {
        if ((e.target || e.srcElement).tagName.toLowerCase() === 'td') {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }

            if ($.trim(text) == '') {
                $('#dv_prncFltr_FilterSettings').css('display', 'none');
            }
        } else {
            $('#dv_prncFltr_FilterSettings').css('display', 'none');
        }
    } catch (e) {
        $('#dv_prncFltr_FilterSettings').css('display', 'none');
    }    
});

(function ($) {
    $.fn.princeFilter = function (options) {
        var thisElement = this;

        if ($(thisElement)[0] != null) {            
            if (options == null) {
                options = {
                    'mode': 'basic'
                };
            } else {
                if ('mode' in options) {
                } else {
                    options.mode = 'basic';
                }
            }

            if (options.mode == 'basic') {
                if ($(thisElement)[0].rows.length > 0) {
                    if ($(thisElement).find('th').length == 0) {
                        var tmpTDD = "";
                        for (var i = 0; i < $(thisElement)[0].rows[0].cells.length; i++) {
                            tmpTDD = tmpTDD + "<th>Column" + (i + 1) + "</th>";
                        }

                        $(thisElement).prepend("<tr>" + tmpTDD + "</tr>");
                    }

                    $(thisElement).attr('filterMode', JSON.stringify(options));

                    $(thisElement).find('th').each(function (indx) {
                        $(this).contents().wrap('<div></div>');

                        var thisTH = this;
                        var parmIDbtn = 'dv_prncFltr_' + $(thisElement).attr('id') + '_' + indx;

                        var btnHTML = "<div style=\"outline:1px solid #CFD2D6;font-size:0pt;min-width:33px;background-color:#EEF3E2 !important;height:13px;margin-top:1px;\">";
                        btnHTML = btnHTML + "<div id=\"dv_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "\" fltrtxt=\"txt_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "\" style=\"display:inline-block;float:left;font-size:0pt;margin-left:2px;margin-right:2px;padding:0px !important;padding:0px !important;outline:1px solid #4C9ED9;background-color:orange;cursor:pointer;\" onclick=\"prncFltr_ShowFilterBox(event,'" + parmIDbtn + "','" + $(thisElement).attr("id") + "','txt_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "','" + indx + "')\" onmousedown=\"return false;\"><img src=\"data:image/png;base64," + prcn_img_filterFunnel64 + "\" alt=\"^\" /></div>";
                        btnHTML = btnHTML + "<input id=\"txt_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "\" class=\"clss_prncFltr_" + $(thisElement).attr("id") + "\" type=\"text\" value=\"\" style=\"display:none;\"></input>";
                        btnHTML = btnHTML + "<img id=\"img_prncFltr_col_" + indx + "_" + $(thisElement).attr("id") + "\" src=\"data:image/png;base64," + prncImgFiltrSortASC + "\" sortOrder=\"\" sortTable=\"" + $(thisElement).attr("id") + "\" class=\"img_prncFltr_SortClss_" + $(thisElement).attr("id") + "\" colIndex=\"" + indx + "\" alt=\"^\" onmousedown=\"return false;\" style=\"cursor:pointer;float:right;\" />";
                        btnHTML = btnHTML + "</div>";

                        $(thisTH).append(btnHTML);

                        $('#dv_prncFltr_' + $(thisElement).attr('id') + '_' + indx).css('opacity', '0.4');
                        $('#img_prncFltr_col_' + indx + '_' + $(thisElement).attr('id')).css('opacity', '0.3');

                        $('#img_prncFltr_col_' + indx + '_' + $(thisElement).attr('id')).on('click', function () {
                            var xThisElmmmm = this;
                            var sortOrderx = $(xThisElmmmm).attr('sortOrder');
                            var xThisClass = $(xThisElmmmm).attr('class');
                            var xThisColIndex = $(xThisElmmmm).attr('colIndex');
                            var xThisTable = $(xThisElmmmm).attr('sortTable');
                            var xASCorDESC = false;

                            if (sortOrderx == "") {
                                sortOrderx = "asc";
                                $(xThisElmmmm).attr('sortOrder', 'asc');
                                xASCorDESC = false;
                            } else if (sortOrderx == "asc") {
                                sortOrderx = "desc";
                                $(xThisElmmmm).attr('sortOrder', 'desc');
                                xASCorDESC = true;
                            } else if (sortOrderx == "desc") {
                                sortOrderx = "asc";
                                $(xThisElmmmm).attr('sortOrder', 'asc');
                                xASCorDESC = false;
                            }

                            $('.' + xThisClass).attr('src', 'data:image/png;base64,' + prncImgFiltrSortASC);
                            $('.' + xThisClass).css('opacity', '0.3');

                            if (sortOrderx == "asc") {
                                $(xThisElmmmm).attr('src', 'data:image/png;base64,' + prncImgFiltrSortASC);
                            } else if (sortOrderx == "desc") {
                                $(xThisElmmmm).attr('src', 'data:image/png;base64,' + prncImgFiltrSortDESC);
                            }

                            $(xThisElmmmm).css('opacity', '1');

                            prncFltrsortTable(xThisTable, parseInt(xThisColIndex), xASCorDESC)
                        });
                    });

                    if ($('#dv_prncFltr_FilterSettings')[0] == null) {
                        var highest = 0;

                        $("*").each(function () {
                            var current = parseInt($(this).css("z-index"), 10);
                            if (current && highest < current) highest = current;
                        });

                        highest++;

                        var fltDV = "<div id=\"dv_prncFltr_FilterSettings\" style=\"position:absolute;z-index:" + highest + ";border:1px solid orange;background-color:white;display:none;\"><div style=\"padding:5px;\"><div style=\"padding:1px;background-color:#EBEBEB;border:1px solid orange;text-align:center;\"><span style=\"font-family:Arial;font-size:small;\">filter:</span><select id=\"cmb_prncFltr_FilterSettings\" data-mode=\"" + options.mode + "\" style=\"background-color:#FFFFE1;\"></select><input id=\"txt_prncFltr_FilterSettings\" type=\"text\" style=\"width:100px;padding:1px;\"></input><input id=\"txt_prncFltr_FilterHigh\" placeholder=\"high\" type=\"text\" style=\"width:100px;padding:1px;\"></input></div></div>";
                        fltDV = fltDV + "<div style=\"padding:3px;text-align:center;background-color:gray;border-top:1px solid #777571;\"><input id=\"btn_prncFltr_FilterSettings_Apply\" ctrlSrc=\"\" type=\"submit\" value=\"Apply Filter\" style=\"border:1px solid #4C9ED9;background-color:#CBE2F3;cursor:pointer;\" /><input id=\"btn_prncFltr_FilterSettings_Reset\" type=\"submit\" value=\"Clear Filter\" style=\"margin-left:5px;border:1px solid red;background-color:#FFBBBB;margin-left:15px;cursor:pointer;\" /></div></div>";

                        $(fltDV).insertAfter($(thisElement));

                        $('#dv_prncFltr_FilterSettings').on('click', function (eva) {
                            eva.preventDefault ? eva.preventDefault() : eva.returnValue = false;
                            eva.stopPropagation ? eva.stopPropagation() : eva.cancelBubble = true;
                            return false;
                        });

                        var xOpss = "<option value=\"(none)\">(none)</option>";
                        xOpss = xOpss + "<option value=\"equals\">equals</option>";
                        xOpss = xOpss + "<option value=\"not equals\">not equals</option>";
                        xOpss = xOpss + "<option value=\"like\">like</option>";
                        xOpss = xOpss + "<option value=\"starts with\">starts with</option>";
                        xOpss = xOpss + "<option value=\"ends with\">ends with</option>";
                        xOpss = xOpss + "<option value=\"less than\">less than</option>";
                        xOpss = xOpss + "<option value=\"greater than\">greater than</option>";
                        xOpss = xOpss + "<option value=\"true\" title=\"for checkboxes only - ''true'' means it's checked\" style=\"color:red;\">true</option>";
                        xOpss = xOpss + "<option value=\"false\" title=\"for checkboxes only - ''false'' means it's unchecked\" style=\"color:red;\">false</option>";
                        $('#cmb_prncFltr_FilterSettings').append(xOpss);
                        
                        $('#cmb_prncFltr_FilterSettings').on('change', function (eva) {
                            var cOperand = $('#cmb_prncFltr_FilterSettings option:selected').val();
                            var cThisMode = $('#cmb_prncFltr_FilterSettings').attr('data-mode');
                            var cThisSnderMode = $('#cmb_prncFltr_FilterSettings').attr('data-sendermode');

                            if (cThisSnderMode == 'basic') {
                                if (cOperand == 'true' || cOperand == 'false' || cOperand == '(none)') {
                                    $('#txt_prncFltr_FilterSettings').css('display', 'none');
                                    $('#btn_prncFltr_FilterSettings_Apply')[0].focus();
                                } else {
                                    $('#txt_prncFltr_FilterSettings').css('display', '');
                                    $('#txt_prncFltr_FilterSettings')[0].focus();
                                }
                            } else {
                                if (cOperand == 'between') {
                                    $('#txt_prncFltr_FilterHigh').css('display', '');
                                    $('#btn_prncFltr_FilterSettings_Apply')[0].focus();
                                    $('#txt_prncFltr_FilterSettings')[0].hasAttribute('placeholder') ? '' : $('#txt_prncFltr_FilterSettings').attr('placeholder', 'low');
                                    $('#txt_prncFltr_FilterHigh')[0].hasAttribute('placeholder') ? '' : $('#txt_prncFltr_FilterHigh').attr('placeholder', 'high');
                                } else {
                                    $('#txt_prncFltr_FilterHigh').css('display', 'none');
                                    $('#txt_prncFltr_FilterSettings').removeAttr('placeholder');
                                }
                            }                            
                        });

                        $('#btn_prncFltr_FilterSettings_Apply').on('click', function () {
                            var incomingContrlTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');
                            var prncFlterObjctFrom = $.parseJSON($('#' + incomingContrlTbl).attr('filterMode'));

                            if (prncFlterObjctFrom.mode == 'basic') {
                                var xApplF_val = $('#cmb_prncFltr_FilterSettings option:selected').val();
                                $('#txt_prncFltr_FilterHigh').css('display', 'none');

                                if (xApplF_val == '(none)') {
                                    $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val('');
                                    $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '0.4');
                                } else {
                                    var currAtIndx = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceIndx');
                                    var tempJSONobjctxxx = {
                                        operand: $('#cmb_prncFltr_FilterSettings option:selected').val(),
                                        value: (currSelectedFilterx == 'between' ? ($('#txt_prncFltr_FilterSettings').val() + '{' + $('#txt_prncFltr_FilterHigh').val()) : $('#txt_prncFltr_FilterSettings').val()),
                                        index: currAtIndx
                                    };
                                    $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val(JSON.stringify(tempJSONobjctxxx));
                                    $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '1');

                                    var currClss = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss');
                                    var currTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');
                                    apply_prnc_filter(currTbl, currClss);
                                }
                            } else {
                                var currSelectedFilterx = $('#cmb_prncFltr_FilterSettings option:selected').val();

                                if (currSelectedFilterx == 'between') {
                                    if (isNaN($('#txt_prncFltr_FilterSettings').val()) || isNaN($('#txt_prncFltr_FilterHigh').val())) {
                                        alert('ERROR: low/high values must be numeric!');
                                        return false;
                                    }
                                }

                                var xApplF_val = $('#cmb_prncFltr_FilterSettings option:selected').val();
                                var currClss = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss');
                                var currAtIndx = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceIndx');
                                var tempJSONobjctxxx = {
                                    columnN: prncFlterObjctFrom.columns[currAtIndx],
                                    operand: xApplF_val,
                                    value: (currSelectedFilterx == 'between' ? ($('#txt_prncFltr_FilterSettings').val() + '{' + $('#txt_prncFltr_FilterHigh').val()) : $('#txt_prncFltr_FilterSettings').val()),
                                    index: currAtIndx,
                                    sortOrder: ($('#img_prncFltr_col_' + currAtIndx + '_' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl')).css('opacity') == '1' ? ($('#img_prncFltr_col_' + currAtIndx + '_' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl')).attr('alt') == '^' ? 'ASC' : 'DESC') : '')
                                };

                                if (tempJSONobjctxxx.sortOrder != '') {
                                    $('.' + currClss).each(function () {
                                        var currTxtClass = this;

                                        if ($(currTxtClass).val().match('{')) {
                                            var compareTmpObj = $.parseJSON($(currTxtClass).val());

                                            if ('sortOrder' in compareTmpObj) {
                                                compareTmpObj.sortOrder = '';
                                            }

                                            $(currTxtClass).val(JSON.stringify(compareTmpObj));
                                        }
                                    });
                                }

                                var currTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');

                                $('#txt_prncFltr_' + currTbl + '_' + currAtIndx).val(JSON.stringify(tempJSONobjctxxx));
                                $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val(JSON.stringify(tempJSONobjctxxx));
                                $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '1');                                
                                
                                apply_prnc_filter_SQL(currTbl, currClss, '1');
                            }

                            $('#dv_prncFltr_FilterSettings').css('display', 'none');
                        });

                        $('#btn_prncFltr_FilterSettings_Reset').on('click', function () {
                            $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val('');
                            $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '0.4');

                            var currClss = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss');
                            var currTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');
                            var prncFlterObjctFrom = $.parseJSON($('#' + currTbl).attr('filterMode'));

                            if (prncFlterObjctFrom.mode == 'basic') {
                                $('#txt_prncFltr_FilterHigh').css('display', 'none');
                                apply_prnc_filter(currTbl, currClss);
                            } else {
                                apply_prnc_filter_SQL(currTbl, currClss, '1');
                            }

                            $('#dv_prncFltr_FilterSettings').css('display', 'none');
                        });

                        $('#txt_prncFltr_FilterSettings').live('keypress', function (evv) {
                            if (evv.keyCode == 13) {
                                evv.preventDefault ? evv.preventDefault() : evv.returnValue = false;
                                evv.stopPropagation ? evv.stopPropagation() : evv.cancelBubble = true;

                                $('#btn_prncFltr_FilterSettings_Apply').trigger('click');
                            }
                        });
                    };

                    var prncFiltrTDClickElm = null;
                    $('#' + $(thisElement).attr('id') + ' td').mousedown(function (e) {
                        prncFiltrTDClickElm = this;
                    });

                    $('#' + $(thisElement).attr('id') + ' td').mouseup(function (e) {
                        if (prncFiltrTDClickElm != this) {
                            return false;
                        }

                        var xThisss = prncFiltrTDClickElm;
                        var text = "";
                        if (window.getSelection) {
                            text = window.getSelection().toString();
                        } else if (document.selection && document.selection.type != "Control") {
                            text = document.selection.createRange().text;
                        }

                        if ($.trim(text) != '') {
                            var prncFlterObjctFrom = $.parseJSON($('#' + $(xThisss).closest('table').attr('id')).attr('filterMode'));
                            var orgID = 'dv_prncFltr_' + $(xThisss).closest('table').attr('id') + '_' + $(xThisss).index();

                            prncFltr_ShowFilterBox_Selected(e, orgID, $(xThisss).closest('table').attr('id'), 'txt_prncFltr_' + $(xThisss).closest('table').attr('id') + '_' + $(xThisss).index(), $(xThisss).index(), xThisss);

                            var isOnlyTxtView = false;
                            if (prncFlterObjctFrom.mode == 'basic') {
                                $('#txt_prncFltr_FilterHigh').css('display', 'none');
                                $('#cmb_prncFltr_FilterSettings').css('display', '');
                                $('#cmb_prncFltr_FilterSettings')[0].selectedIndex = 3;
                                $('#cmb_prncFltr_FilterSettings').trigger('change');
                            } else {
                                $('#cmb_prncFltr_FilterSettings').css('display', 'none');
                                $('#txt_prncFltr_FilterSettings').css('display', '');
                                isOnlyTxtView = true;
                            }

                            $('#txt_prncFltr_FilterSettings').val(text);
                            $('#btn_prncFltr_FilterSettings_Apply').attr('ctrlSrc', $(xThisss).closest('table').attr('id'));

                            $('#dv_prncFltr_FilterSettings').css({ 'display': '', 'opacity': '0' });
                            $('#dv_prncFltr_FilterSettings').position({ my: 'left top', at: 'center center', of: $(xThisss) });

                            $('#dv_prncFltr_FilterSettings').animate({ opacity: 1 }, 'fast', function () {
                                if (isOnlyTxtView == true) {
                                    $('#txt_prncFltr_FilterSettings')[0].focus();
                                }
                            });

                        }
                    });
                }
            } else if (options.mode == 'sql') {
                if ('storedproc' in options && 'constring' in options && 'columns' in options && 'pagesize' in options && 'ajaxurl' in options) {
                    if ($.trim(options.storedproc) != '' && $.trim(options.constring) != '' && options.columns.length > 0 && $.trim(options.ajaxurl) != '') {
                        $(thisElement).empty();                        

                        if ('cssClass' in options) {
                            $(thisElement).addClass(options.cssClass);
                        } else {
                            var cssPrncFltrStyle = "<style type='text/css'> .prncFltrStyle{border-collapse: collapse;margin-left: auto;margin-right: auto;font-family:Arial;font-size:small;background-color:white;}"
                                + ".prncFltrStyle th{font-weight: bold;padding: 8px;background: black;color: white;border: 1px solid #525252;}"
                                + ".prncFltrStyle td{text-align: left;padding: 4px;color: black;border: 1px solid black;}"
                                + ".prncFltrStyle tr:hover td{background-color: #EAEAEA;color: #B77D00;}</style>";
                            $(cssPrncFltrStyle).appendTo("head");
                            $(thisElement).addClass("prncFltrStyle");
                            options.cssClass = 'prncFltrStyle';
                        }

                        $(thisElement).attr('filterMode', JSON.stringify(options));

                        if (prncFltrAJAXurl == null) {
                            prncFltrAJAXurl = options.ajaxurl;
                        }

                        var prfxTR = $('<tr class="prncFltrSQL_Head" />');
                        $(prfxTR).append('<th>RowNum</th>');

                        for (var i = 0; i < options.columns.length; i++) {
                            var prfxTHDIV = $('<div />').append(options.columns[i]);
                            var indx = i;

                            var parmIDbtn = 'dv_prncFltr_' + $(thisElement).attr('id') + '_' + indx;

                            var btnHTML = "<div style=\"outline:1px solid #CFD2D6;font-size:0pt;min-width:33px;background-color:#EEF3E2 !important;height:13px;margin-top:1px;\">";
                            btnHTML = btnHTML + "<div id=\"dv_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "\" fltrtxt=\"txt_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "\" style=\"display:inline-block;float:left;font-size:0pt;margin-left:2px;margin-right:2px;padding:0px !important;padding:0px !important;outline:1px solid #4C9ED9;background-color:orange;cursor:pointer;\" onclick=\"prncFltr_ShowFilterBox(event,'" + parmIDbtn + "','" + $(thisElement).attr("id") + "','txt_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "','" + indx + "')\" onmousedown=\"return false;\"><img src=\"data:image/png;base64," + prcn_img_filterFunnel64 + "\" alt=\"^\" /></div>";
                            btnHTML = btnHTML + "<input id=\"txt_prncFltr_" + $(thisElement).attr("id") + "_" + indx + "\" class=\"clss_prncFltr_" + $(thisElement).attr("id") + "\" type=\"text\" value=\"\" style=\"display:none;\"></input>";
                            btnHTML = btnHTML + "<img id=\"img_prncFltr_col_" + indx + "_" + $(thisElement).attr("id") + "\" src=\"data:image/png;base64," + prncImgFiltrSortASC + "\" sortOrder=\"\" sortTable=\"" + $(thisElement).attr("id") + "\" class=\"img_prncFltr_SortClss_" + $(thisElement).attr("id") + "\" colIndex=\"" + indx + "\" alt=\"^\" onmousedown=\"return false;\" style=\"cursor:pointer;float:right;\" />";
                            btnHTML = btnHTML + "</div>";

                            $(prfxTHDIV).append(btnHTML);
                            var prfxTHInn = $('<th />').append(prfxTHDIV);

                            $(prfxTR).append(prfxTHInn);
                        }

                        $(thisElement).append(prfxTR);
                        for (var i = 0; i < options.columns.length; i++) {
                            var indx = i;

                            $('#dv_prncFltr_' + $(thisElement).attr('id') + '_' + indx).css('opacity', '0.4');
                            $('#img_prncFltr_col_' + indx + '_' + $(thisElement).attr('id')).css('opacity', '0.3');

                            $('#img_prncFltr_col_' + indx + '_' + $(thisElement).attr('id')).on('click', function () {
                                var xThisElmmmm = this;
                                var sortOrderx = $(xThisElmmmm).attr('sortOrder');
                                var xThisClass = $(xThisElmmmm).attr('class');
                                var xThisColIndex = $(xThisElmmmm).attr('colIndex');
                                var xThisTable = $(xThisElmmmm).attr('sortTable');
                                var xASCorDESC = false;

                                if (sortOrderx == "") {
                                    sortOrderx = "asc";
                                    $(xThisElmmmm).attr('sortOrder', 'asc');
                                    xASCorDESC = false;
                                } else if (sortOrderx == "asc") {
                                    sortOrderx = "desc";
                                    $(xThisElmmmm).attr('sortOrder', 'desc');
                                    xASCorDESC = true;
                                } else if (sortOrderx == "desc") {
                                    sortOrderx = "asc";
                                    $(xThisElmmmm).attr('sortOrder', 'asc');
                                    xASCorDESC = false;
                                }

                                $('.' + xThisClass).attr('src', 'data:image/png;base64,' + prncImgFiltrSortASC);
                                $('.' + xThisClass).css('opacity', '0.3');

                                if (sortOrderx == "asc") {
                                    $(xThisElmmmm).attr('src', 'data:image/png;base64,' + prncImgFiltrSortASC);
                                } else if (sortOrderx == "desc") {
                                    $(xThisElmmmm).attr('src', 'data:image/png;base64,' + prncImgFiltrSortDESC);
                                }

                                $(xThisElmmmm).css('opacity', '1');

                                prncFltrsortTable(xThisTable, parseInt(xThisColIndex), xASCorDESC)
                            });
                        }

                        var prfxTRFoot = $('<tr class="prncFltrSQL_UPFoot" />');
                        $(prfxTRFoot).append('<th colspan="' + (options.columns.length + 1) + '" style="position:relative;text-align:left;"><span class="lblTotalPages_' + $(thisElement).attr('id') + '" style="color:#F5D488;font-style:italic;margin-right:4px;margin-left:100px;"></span><span class="dvPagginationFootClass_' + $(thisElement).attr('id') + '"></span></th>');
                        $(thisElement).append(prfxTRFoot);

                        var imgWaittt = '<img id="img_prncFltr_wait" src="data:image/gif;base64,' + prnc_img_Wait + '" style="border:6px solid white;outline:4px solid orange;position:absolute;display:none;" />';
                        var prfxTRFootD = $('<tr class="prncFltrSQL_Foot" />');
                        $(prfxTRFootD).append('<th colspan="' + (options.columns.length + 1) + '" style="position:relative;text-align:left;"><span class="lblTotalPages_' + $(thisElement).attr('id') + '" style="color:#F5D488;font-style:italic;margin-right:4px;margin-left:100px;"></span><span class="dvPagginationFootClass_' + $(thisElement).attr('id') + '"></span>' + imgWaittt + '</th>');
                        $(thisElement).append(prfxTRFootD);

                        var imgXls = $('<img>');
                        imgXls.attr('src', prnImgforExcel);
                        imgXls.attr('onclick', "prncGrdExportReport('" + $(thisElement).attr('id') + "','xls')");
                        imgXls.attr('onmouseover', "$(this).css({'opacity':'1'});");
                        imgXls.attr('onmouseout', "$(this).css('opacity','0.5');");
                        imgXls.attr('title', 'Export Table to .xls file');
                        imgXls.css({ 'position': 'absolute', 'left': '0px', 'margin-top': '0px', 'margin-left': '8px', 'opacity': '0.5', 'cursor': 'pointer' });

                        var imgWord = $('<img>');
                        imgWord.attr('src', prnImgforWord);
                        imgWord.attr('onclick', "prncGrdExportReport('" + $(thisElement).attr('id') + "','doc')");
                        imgWord.attr('onmouseover', "$(this).css({'opacity':'1'});");
                        imgWord.attr('onmouseout', "$(this).css('opacity','0.5');");
                        imgWord.attr('title', 'Export Table to .doc file');
                        imgWord.css({ 'position': 'absolute', 'left': '0px', 'margin-top': '0px', 'margin-left': '38px', 'opacity': '0.5', 'cursor': 'pointer' });

                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).parent().append(imgXls);
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).parent().append(imgWord);

                        var paginationControls = "<span class=\"btn_prncFltr_" + $(thisElement).attr('id') + "_First\" title=\"Goto First\" style=\"margin-left:10px;padding:3px;background-color:#EEEEEE;border:1px solid #F5D488;color:#1086A4;font-weight:bold;cursor:pointer;\">«</span>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);
                        paginationControls ="<span class=\"btn_prncFltr_" + $(thisElement).attr('id') + "_Previous\" title=\"Goto Previous\" style=\"margin-left:4px;padding:3px;background-color:#EEEEEE;border:1px solid #F5D488;color:#1086A4;font-weight:bold;cursor:pointer;\">‹</span>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);
                        paginationControls = "<span style=\"margin-left:26px;\">Go To Page:</span>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);
                        paginationControls = "<input class=\"txt_prncFltr_" + $(thisElement).attr('id') + "_PageNumber\" type=\"text\" value=\"1\" style=\"margin-left:4px;width:35px;\"></input>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);
                        paginationControls = "<span class=\"btn_prncFltr_" + $(thisElement).attr('id') + "_GotoPage\" style=\"margin-left:4px;padding:3px;background-color:#F5D488;border:1px solid orange;color:#1086A4;font-weight:bold;cursor:pointer;\">GO</span>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);
                        paginationControls = "<span class=\"btn_prncFltr_" + $(thisElement).attr('id') + "_Next\" title=\"Goto Next\" style=\"margin-left:26px;padding:3px;background-color:#EEEEEE;border:1px solid #F5D488;color:#1086A4;font-weight:bold;cursor:pointer;\">›</span>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);
                        paginationControls = "<span class=\"btn_prncFltr_" + $(thisElement).attr('id') + "_Last\" title=\"Goto Last\" style=\"margin-left:4px;padding:3px;background-color:#EEEEEE;border:1px solid #F5D488;color:#1086A4;font-weight:bold;cursor:pointer;\">»</span>";
                        $('.dvPagginationFootClass_' + $(thisElement).attr('id')).append(paginationControls);

                        $('.btn_prncFltr_' + $(thisElement).attr('id') + '_First').on('click', function () {
                            $('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val('1');
                            apply_prnc_filter_SQL($(thisElement).attr('id'), 'clss_prncFltr_' + $(thisElement).attr('id'), '1');
                        });
                        $('.btn_prncFltr_' + $(thisElement).attr('id') + '_Previous').on('click', function () {
                            var btnxxThiss = this;
                            var orgNumberPage = $.trim($(btnxxThiss).parent().find('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val());
                            if (!isNaN(orgNumberPage)) {
                                var finPageNumberx = parseInt(orgNumberPage) - 1;
                                finPageNumberx = (finPageNumberx < 1 ? 1 : finPageNumberx);
                                $('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val(finPageNumberx);
                                apply_prnc_filter_SQL($(thisElement).attr('id'), 'clss_prncFltr_' + $(thisElement).attr('id'), finPageNumberx);
                            }
                        });
                        $('.btn_prncFltr_' + $(thisElement).attr('id') + '_GotoPage').on('click', function () {
                            var btnxxThiss = this;
                            var maxPageNumber = parseInt($('.lblTotalPages_' + $(thisElement).attr('id')).html().split(' ')[0]);
                            
                            var orgNumberPage = $.trim($(btnxxThiss).parent().find('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val());
                            if (!isNaN(orgNumberPage) && !isNaN(maxPageNumber)) {
                                var finPageNumberx = parseInt(orgNumberPage);
                                finPageNumberx = (finPageNumberx > maxPageNumber ? maxPageNumber : (finPageNumberx < 1 ? 1 : finPageNumberx));
                                $('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val(finPageNumberx);
                                apply_prnc_filter_SQL($(thisElement).attr('id'), 'clss_prncFltr_' + $(thisElement).attr('id'), finPageNumberx);
                            }
                        });
                        $('.btn_prncFltr_' + $(thisElement).attr('id') + '_Next').on('click', function () {
                            var btnxxThiss = this;
                            var orgNumberPage = $.trim($(btnxxThiss).parent().find('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val());
                            var maxPageNumber = parseInt($('.lblTotalPages_' + $(thisElement).attr('id')).html().split(' ')[0]);
                            if (!isNaN(orgNumberPage) && !isNaN(maxPageNumber)) {
                                var finPageNumberx = parseInt(orgNumberPage) + 1;
                                finPageNumberx = (finPageNumberx > maxPageNumber ? maxPageNumber : finPageNumberx);
                                $('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val(finPageNumberx);
                                apply_prnc_filter_SQL($(thisElement).attr('id'), 'clss_prncFltr_' + $(thisElement).attr('id'), finPageNumberx);
                            }
                        });
                        $('.btn_prncFltr_' + $(thisElement).attr('id') + '_Last').on('click', function () {
                            var maxPageNumber = parseInt($('.lblTotalPages_' + $(thisElement).attr('id')).html().split(' ')[0]);
                            if (!isNaN(maxPageNumber)) {
                                $('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').val(maxPageNumber);
                                apply_prnc_filter_SQL($(thisElement).attr('id'), 'clss_prncFltr_' + $(thisElement).attr('id'), maxPageNumber);
                            }
                        });
                        $('.txt_prncFltr_' + $(thisElement).attr('id') + '_PageNumber').on('keypress', function (e) {
                            if (e.keyCode == 13) {
                                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                                $('.btn_prncFltr_' + $(thisElement).attr('id') + '_GotoPage').trigger('click');
                            }
                        });
                        
                        if ($('#dv_prncFltr_FilterSettings')[0] == null) {
                            var highest = 0;

                            $("*").each(function () {
                                var current = parseInt($(this).css("z-index"), 10);
                                if (current && highest < current) highest = current;
                            });

                            highest++;

                            var fltDV = "<div id=\"dv_prncFltr_FilterSettings\" style=\"position:absolute;z-index:" + highest + ";border:1px solid orange;background-color:white;display:none;\"><div style=\"padding:5px;\"><div style=\"padding:1px;background-color:#EBEBEB;border:1px solid orange;text-align:center;\"><span style=\"font-family:Arial;font-size:small;\">filter:</span><select id=\"cmb_prncFltr_FilterSettings\" data-mode=\"" + options.mode + "\" style=\"background-color:#FFFFE1;\"></select><input id=\"txt_prncFltr_FilterSettings\" type=\"text\" style=\"width:100px;padding:1px;\"></input><input id=\"txt_prncFltr_FilterHigh\" placeholder=\"high\" type=\"text\" style=\"width:100px;padding:1px;display:none;\"></input></div></div>";
                            fltDV = fltDV + "<div style=\"padding:3px;text-align:center;background-color:gray;border-top:1px solid #777571;\"><input id=\"btn_prncFltr_FilterSettings_Apply\" ctrlSrc=\"\" type=\"submit\" value=\"Apply Filter\" style=\"border:1px solid #4C9ED9;background-color:#CBE2F3;cursor:pointer;\" /><input id=\"btn_prncFltr_FilterSettings_Reset\" type=\"submit\" value=\"Clear Filter\" style=\"margin-left:5px;border:1px solid red;background-color:#FFBBBB;margin-left:15px;cursor:pointer;\" /></div></div>";

                            $(fltDV).insertAfter($(thisElement));

                            $('#txt_prncFltr_FilterSettings').on('keypress', function (e) {
                                if (e.keyCode == 13) {
                                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                                    e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
                                    $('#btn_prncFltr_FilterSettings_Apply').trigger('click');
                                }
                            });

                            $('#dv_prncFltr_FilterSettings').on('click', function (eva) {
                                eva.preventDefault ? eva.preventDefault() : eva.returnValue = false;
                                eva.stopPropagation ? eva.stopPropagation() : eva.cancelBubble = true;
                                return false;
                            });

                            var xOpss = "<option value=\"equals\">equals</option>";
                            xOpss = xOpss + "<option value=\"between\">between</option>";
                            $('#cmb_prncFltr_FilterSettings').append(xOpss);

                            $('#cmb_prncFltr_FilterSettings').on('change', function (eva) {
                                var cOperand = $('#cmb_prncFltr_FilterSettings option:selected').val();
                                var cThisMode = $('#cmb_prncFltr_FilterSettings').attr('data-mode');
                                var cThisSnderMode = $('#cmb_prncFltr_FilterSettings').attr('data-sendermode');

                                if (cThisSnderMode == 'basic') {
                                    if (cOperand == 'true' || cOperand == 'false' || cOperand == '(none)') {
                                        $('#txt_prncFltr_FilterSettings').css('display', 'none');
                                        $('#btn_prncFltr_FilterSettings_Apply')[0].focus();
                                    } else {
                                        $('#txt_prncFltr_FilterSettings').css('display', '');
                                        $('#txt_prncFltr_FilterSettings')[0].focus();
                                    }
                                } else {
                                    if (cOperand == 'between') {
                                        $('#txt_prncFltr_FilterHigh').css('display', '');
                                        $('#btn_prncFltr_FilterSettings_Apply')[0].focus();
                                        $('#txt_prncFltr_FilterSettings')[0].hasAttribute('placeholder') ? '' : $('#txt_prncFltr_FilterSettings').attr('placeholder', 'low');
                                        $('#txt_prncFltr_FilterHigh')[0].hasAttribute('placeholder') ? '' : $('#txt_prncFltr_FilterHigh').attr('placeholder', 'high');
                                    } else {
                                        $('#txt_prncFltr_FilterHigh').css('display', 'none');
                                        $('#txt_prncFltr_FilterSettings').removeAttr('placeholder');
                                    }
                                }
                                
                                $('#txt_prncFltr_FilterSettings').css('display', '');
                                $('#txt_prncFltr_FilterSettings')[0].focus();
                            });

                            $('#btn_prncFltr_FilterSettings_Apply').on('click', function () {
                                var currSelectedFilterx = $('#cmb_prncFltr_FilterSettings option:selected').val();

                                if (currSelectedFilterx == 'between') {
                                    if (isNaN($('#txt_prncFltr_FilterSettings').val()) || isNaN($('#txt_prncFltr_FilterHigh').val())) {
                                        alert('ERROR: low/high values must be numeric!');
                                        return false;
                                    }
                                }

                                var incomingContrlTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');
                                var prncFlterObjctFrom = $.parseJSON($('#' + incomingContrlTbl).attr('filterMode')); //$(thisElement).attr('id')

                                if (prncFlterObjctFrom.mode == 'basic') {
                                    var xApplF_val = $('#cmb_prncFltr_FilterSettings option:selected').val();
                                    $('#txt_prncFltr_FilterHigh').css('display', 'none');

                                    if (xApplF_val == '(none)') {
                                        $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val('');
                                        $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '0.4');
                                    } else {
                                        var currAtIndx = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceIndx');
                                        var tempJSONobjctxxx = {
                                            operand: $('#cmb_prncFltr_FilterSettings option:selected').val(),
                                            value: $('#txt_prncFltr_FilterSettings').val(),
                                            index: currAtIndx
                                        };
                                        $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val(JSON.stringify(tempJSONobjctxxx));
                                        $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '1');

                                        var currClss = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss');
                                        var currTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');
                                        apply_prnc_filter(currTbl, currClss);
                                    }
                                } else {
                                    var xApplF_val = $('#cmb_prncFltr_FilterSettings option:selected').val();
                                    var currClss = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss');
                                    var currAtIndx = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceIndx');
                                    var tempJSONobjctxxx = {
                                        columnN: prncFlterObjctFrom.columns[currAtIndx],
                                        operand: xApplF_val,
                                        value: (currSelectedFilterx == 'between' ? ($('#txt_prncFltr_FilterSettings').val() + '{' + $('#txt_prncFltr_FilterHigh').val()) : $('#txt_prncFltr_FilterSettings').val()),
                                        index: currAtIndx,
                                        sortOrder: ($('#img_prncFltr_col_' + currAtIndx + '_' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl')).css('opacity') == '1' ? ($('#img_prncFltr_col_' + currAtIndx + '_' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl')).attr('alt') == '^' ? 'ASC' : 'DESC') : '')
                                    };

                                    if (tempJSONobjctxxx.sortOrder != '') {
                                        $('.' + currClss).each(function () {
                                            var currTxtClass = this;

                                            if ($(currTxtClass).val().match('{')) {
                                                var compareTmpObj = $.parseJSON($(currTxtClass).val());

                                                if ('sortOrder' in compareTmpObj) {
                                                    compareTmpObj.sortOrder = '';
                                                }

                                                $(currTxtClass).val(JSON.stringify(compareTmpObj));
                                            }
                                        });
                                    }

                                    var currTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');

                                    $('#txt_prncFltr_' + currTbl + '_' + currAtIndx).val(JSON.stringify(tempJSONobjctxxx));
                                    $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val(JSON.stringify(tempJSONobjctxxx));
                                    $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '1');
                                    
                                    apply_prnc_filter_SQL(currTbl, currClss, '1');
                                }

                                $('#dv_prncFltr_FilterSettings').css('display', 'none');
                            });

                            $('#btn_prncFltr_FilterSettings_Reset').on('click', function () {
                                $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt')).val('');
                                $('#' + $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn')).css('opacity', '0.4');

                                var currClss = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss');
                                var currTbl = $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl');
                                var prncFlterObjctFrom = $.parseJSON($('#' + currTbl).attr('filterMode'));

                                if (prncFlterObjctFrom.mode == 'basic') {
                                    $('#txt_prncFltr_FilterHigh').css('display', 'none');
                                    apply_prnc_filter(currTbl, currClss);
                                } else {
                                    apply_prnc_filter_SQL(currTbl, currClss, '1');
                                }

                                $('#dv_prncFltr_FilterSettings').css('display', 'none');
                            });

                            $('#txt_prncFltr_FilterSettings').live('keypress', function (evv) {
                                if (evv.keyCode == 13) {
                                    evv.preventDefault ? evv.preventDefault() : evv.returnValue = false;
                                    evv.stopPropagation ? evv.stopPropagation() : evv.cancelBubble = true;

                                    $('#btn_prncFltr_FilterSettings_Apply').trigger('click');
                                }
                            });

                            $('#img_prncFltr_col_0_' + $(thisElement).attr('id')).trigger('click');
                        } else {
                            $('#img_prncFltr_col_0_' + $(thisElement).attr('id')).trigger('click');
                        };
                    }
                }
            }
        } else {
            //alert('This element doesnt exist!');
        };
    };
}(jQuery));

function prncFltr_ShowFilterBox(evv, mybtnPressed, thisElement, thisFiltOptionsss, atIndx) {
    evv.preventDefault ? evv.preventDefault() : evv.returnValue = false;
    evv.stopPropagation ? evv.stopPropagation() : evv.cancelBubble = true;

    var prncFlterObjctFrom = $.parseJSON($('#' + thisElement).attr('filterMode'));
    
    var clkTHIS = mybtnPressed;
    var clkID = $('#' + clkTHIS).attr('id');
    var clkClss = 'clss_prncFltr_' + thisElement;
    var txtFiltrThisColumn = thisFiltOptionsss;

    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt', txtFiltrThisColumn);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn', clkTHIS);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss', clkClss);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceIndx', atIndx);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl', thisElement);

    $('#txt_prncFltr_FilterHigh').val('');
        
    if ($.trim($('#' + txtFiltrThisColumn).val()) != '') {
        var jxObjct = $.parseJSON($.trim($('#' + txtFiltrThisColumn).val()));
        
        if (prncFlterObjctFrom.mode == 'sql' && jxObjct.value.match('{')) {
            $('#txt_prncFltr_FilterSettings').val(jxObjct.value.split('{')[0]);
            $('#txt_prncFltr_FilterHigh').val(jxObjct.value.split('{')[1]);
            $('#txt_prncFltr_FilterHigh').css('display', '');

            $('#cmb_prncFltr_FilterSettings').attr('data-sendermode', 'sql');

            $('#cmb_prncFltr_FilterSettings option').remove();
            var xOpss = "<option value=\"equals\">equals</option>";
            xOpss = xOpss + "<option value=\"between\">between</option>";
            $('#cmb_prncFltr_FilterSettings').append(xOpss);

            $('#cmb_prncFltr_FilterSettings').css('display', '');
            $('#txt_prncFltr_FilterSettings').css('display', '');            
        } else {
            $('#txt_prncFltr_FilterSettings').val(jxObjct.value);
        }

        $('#cmb_prncFltr_FilterSettings').val(jxObjct.operand);
        $('#cmb_prncFltr_FilterSettings').trigger('change');
    } else {
        $('#cmb_prncFltr_FilterSettings').val('(none)');
        $('#txt_prncFltr_FilterSettings').val('');
    }

    var isOnlyTxtView = false;
    if (prncFlterObjctFrom.mode == 'basic') {
        $('#cmb_prncFltr_FilterSettings').attr('data-sendermode', 'basic');

        $('#cmb_prncFltr_FilterSettings option').remove();
        var xOpss = "<option value=\"(none)\">(none)</option>";
        xOpss = xOpss + "<option value=\"equals\">equals</option>";
        xOpss = xOpss + "<option value=\"not equals\">not equals</option>";
        xOpss = xOpss + "<option value=\"like\">like</option>";
        xOpss = xOpss + "<option value=\"starts with\">starts with</option>";
        xOpss = xOpss + "<option value=\"ends with\">ends with</option>";
        xOpss = xOpss + "<option value=\"less than\">less than</option>";
        xOpss = xOpss + "<option value=\"greater than\">greater than</option>";
        xOpss = xOpss + "<option value=\"true\" title=\"for checkboxes only - ''true'' means it's checked\" style=\"color:red;\">true</option>";
        xOpss = xOpss + "<option value=\"false\" title=\"for checkboxes only - ''false'' means it's unchecked\" style=\"color:red;\">false</option>";
        $('#cmb_prncFltr_FilterSettings').append(xOpss);

        $('#txt_prncFltr_FilterHigh').css('display', 'none');
        $('#cmb_prncFltr_FilterSettings').css('display', '');
        $('#cmb_prncFltr_FilterSettings').trigger('change');
    } else {
        $('#cmb_prncFltr_FilterSettings').attr('data-sendermode', 'sql');

        //$('#cmb_prncFltr_FilterSettings option').remove();
        //var xOpss = "<option value=\"equals\">equals</option>";
        //xOpss = xOpss + "<option value=\"between\">between</option>";
        //$('#cmb_prncFltr_FilterSettings').append(xOpss);

        //$('#cmb_prncFltr_FilterSettings').css('display', '');
        //$('#txt_prncFltr_FilterSettings').css('display', '');
        //$('#cmb_prncFltr_FilterSettings').trigger('change');
        isOnlyTxtView = true;
    }

    $('#btn_prncFltr_FilterSettings_Apply').attr('ctrlSrc', $('#' + thisElement).attr('id'));

    $('#dv_prncFltr_FilterSettings').css({ 'display': '', 'opacity': '0' });
    $('#dv_prncFltr_FilterSettings').position({ my: 'left top', at: 'center center', of: $('#' + clkTHIS) });

    $('#dv_prncFltr_FilterSettings').animate({ opacity: 1 }, 'fast', function () {
        if (isOnlyTxtView == true) {
            $('#txt_prncFltr_FilterSettings')[0].focus();
        }
    });
};

function processPrncFltrAJAX(aFunction, spParams) {
    var d = $.Deferred();

    $.ajax({
        url: prncFltrAJAXurl,
        data: JSON.stringify({ "tFunction": aFunction, "params": spParams }),
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json'
    })
    .done(function (response) {
        d.resolve(response);//tblRes = response;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {                
        errorThrown = 'Ajax communication failed!\n\n(Error Thrown: "' + errorThrown + '")';
        d.resolve({ error: '1', errorCode: errorThrown });
    });

    return d.promise();
}

function prncFltr_ShowFilterBox_Selected(evv, mybtnPressed, thisElement, thisFiltOptionsss, atIndx, thisCLikTD) {
    var prncFlterObjctFrom = $.parseJSON($('#' + thisElement).attr('filterMode'));
    var clkTHIS = mybtnPressed;
    var clkID = $('#' + clkTHIS).attr('id');
    var clkClss = 'clss_prncFltr_' + thisElement;
    var txtFiltrThisColumn = thisFiltOptionsss;

    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTxt', txtFiltrThisColumn);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceBtn', clkTHIS);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceClss', clkClss);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceIndx', atIndx);
    $('#btn_prncFltr_FilterSettings_Apply').attr('sourceTbl', thisElement);
    
    if ($.trim($('#' + txtFiltrThisColumn).val()) != '') {
        var jxObjct = $.parseJSON($.trim($('#' + txtFiltrThisColumn).val()));

        $('#cmb_prncFltr_FilterSettings').val(jxObjct.operand)
        $('#txt_prncFltr_FilterSettings').val(jxObjct.value)
    } else {
        $('#cmb_prncFltr_FilterSettings').val('(none)')
        $('#txt_prncFltr_FilterSettings').val('')
    }

    if (prncFlterObjctFrom.mode == 'basic') {
        $('#cmb_prncFltr_FilterSettings').attr('data-sendermode', 'basic');

        $('#cmb_prncFltr_FilterSettings option').remove();
        var xOpss = "<option value=\"(none)\">(none)</option>";
        xOpss = xOpss + "<option value=\"equals\">equals</option>";
        xOpss = xOpss + "<option value=\"not equals\">not equals</option>";
        xOpss = xOpss + "<option value=\"like\">like</option>";
        xOpss = xOpss + "<option value=\"starts with\">starts with</option>";
        xOpss = xOpss + "<option value=\"ends with\">ends with</option>";
        xOpss = xOpss + "<option value=\"less than\">less than</option>";
        xOpss = xOpss + "<option value=\"greater than\">greater than</option>";
        xOpss = xOpss + "<option value=\"true\" title=\"for checkboxes only - ''true'' means it's checked\" style=\"color:red;\">true</option>";
        xOpss = xOpss + "<option value=\"false\" title=\"for checkboxes only - ''false'' means it's unchecked\" style=\"color:red;\">false</option>";
        $('#cmb_prncFltr_FilterSettings').append(xOpss);

        $('#cmb_prncFltr_FilterSettings').css('display', '');
        $('#txt_prncFltr_FilterHigh').css('display', 'none');
        $('#cmb_prncFltr_FilterSettings').trigger('change');
    } else {
        $('#cmb_prncFltr_FilterSettings').attr('data-sendermode', 'sql');

        $('#cmb_prncFltr_FilterSettings option').remove();
        var xOpss = "<option value=\"equals\">equals</option>";
        xOpss = xOpss + "<option value=\"between\">between</option>";
        $('#cmb_prncFltr_FilterSettings').append(xOpss);

        $('#cmb_prncFltr_FilterSettings').css('display', '');
        $('#txt_prncFltr_FilterSettings').css('display', '');
        $('#cmb_prncFltr_FilterSettings').trigger('change');
    }
};

function apply_prnc_filter_SQL(tblID, currClsss, PageNum) {
    var prncFlterObjctFrom = $.parseJSON($('#' + tblID).attr('filterMode'));
    var myMasterObjct = {};
    var mySenderObjct = {};

    myMasterObjct.storeProc = prncFlterObjctFrom.storedproc;
    myMasterObjct.conn = prncFlterObjctFrom.constring;

    mySenderObjct.Page = (PageNum == null ? '1' : PageNum);
    mySenderObjct.Size = prncFlterObjctFrom.pagesize;
    mySenderObjct.SortColumn = '';
    mySenderObjct.SortDirection = '';
    
    $('.' + currClsss).each(function () {
        var currTxtClass = this;

        if ($(currTxtClass).val().match('{')) {
            var tmpObjcc = $.parseJSON($(currTxtClass).val());

            if (tmpObjcc.sortOrder != '') {
                mySenderObjct.SortColumn = tmpObjcc.columnN;
                mySenderObjct.SortDirection = tmpObjcc.sortOrder;

                return false;
            }
        }
    });

    for (var i = 0; i < prncFlterObjctFrom.columns.length; i++) {
        var colWasFound = false;

        $('.' + currClsss).each(function () {
            var currTxtClass = this;

            if ($(currTxtClass).val().match('{')) {
                var tmpObjcc = $.parseJSON($(currTxtClass).val());

                if (tmpObjcc.columnN == prncFlterObjctFrom.columns[i]) {
                    mySenderObjct['fl_' + prncFlterObjctFrom.columns[i]] = (tmpObjcc.value == '' ? '[0]' : tmpObjcc.value.replace(/˂/g, '<').replace(/˃/g, '>'));

                    colWasFound = true;
                    return false;
                }
            }
        });

        if (colWasFound == false) {
            mySenderObjct['fl_' + prncFlterObjctFrom.columns[i]] = '[0]';
        }
    }

    myMasterObjct.params = mySenderObjct;
    
    $('.txt_prncFltr_' + tblID + '_PageNumber').val(PageNum);
    $('#' + tblID + ' .prcFlt_nrmRowClass').remove();

    $('#img_prncFltr_wait').css({ 'opacity': '0', 'display': '' });
    $('#img_prncFltr_wait').position({ my: 'center center', at: 'left bottom', of: $('#' + tblID + ' .prncFltrSQL_UPFoot'), offset: '100 0' });
    $('#img_prncFltr_wait').css({ 'opacity': '1' });
    
    setTimeout(function () {
        processPrncFltrAJAX('princeFilter', myMasterObjct)
        .then(function (tblRess) {
            if (tblRess.error == '1') {
                alert(tblRess.errorCode);
                $('#img_prncFltr_wait').css({ 'display': 'none' });
            } else {
                for (var i = 0; i < tblRess.row.length; i++) {
                    var tmpTRtdx = $('<tr class="prcFlt_nrmRowClass" />');
                    for (var j = 0; j < parseInt(tblRess.columCount) ; j++) {
                        var tmpTDxxxx = $('<td title="' + (j > 0 ? prncFlterObjctFrom.columns[(j - 1)] : 'RowNum') + '" />');
                        tblRess.row[i][j] = (tblRess.row[i][j].toLowerCase().match(/^(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+) (am|pm)$/) ? (tblRess.row[i][j].split(' ')[0]) : tblRess.row[i][j]);
                        $(tmpTDxxxx).append($('<div />').html(tblRess.row[i][j].replace(/\</g, '˂').replace(/\>/g, '˃')).text().replace(/\\r\\n/g, '<br />'));
                        $(tmpTRtdx).append(tmpTDxxxx);
                    }
                    $(tmpTRtdx).insertBefore($('#' + tblID + ' .prncFltrSQL_Foot'));
                }

                $('.lblTotalPages_' + tblID).html(tblRess.pages + ' pages');

                var prncFiltrTDClickElm = null;
                $('#' + tblID + ' td').mousedown(function (e) {
                    prncFiltrTDClickElm = this;
                });

                $('#' + tblID + ' td').mouseup(function (e) {
                    if (prncFiltrTDClickElm != this) {
                        return false;
                    }

                    var xThisss = prncFiltrTDClickElm;

                    if ($(xThisss).index() == 0) {
                        $('#dv_prncFltr_FilterSettings').css({ 'display': 'none' });
                        return false;
                    }

                    $('#txt_prncFltr_FilterHigh').val('');
                    var text = "";
                    if (window.getSelection) {
                        text = window.getSelection().toString();
                    } else if (document.selection && document.selection.type != "Control") {
                        text = document.selection.createRange().text;
                    }

                    if ($.trim(text) != '') {
                        var prncFlterObjctFrom = $.parseJSON($('#' + $(xThisss).closest('table').attr('id')).attr('filterMode'));
                        var orgID = 'dv_prncFltr_' + $(xThisss).closest('table').attr('id') + '_' + ($(xThisss).index() - 1);

                        prncFltr_ShowFilterBox_Selected(e, orgID, $(xThisss).closest('table').attr('id'), 'txt_prncFltr_' + $(xThisss).closest('table').attr('id') + '_' + ($(xThisss).index() - 1), ($(xThisss).index() - 1), xThisss);

                        var isOnlyTxtView = false;
                        if (prncFlterObjctFrom.mode == 'basic') {
                            $('#txt_prncFltr_FilterHigh').css('display', 'none');
                            $('#cmb_prncFltr_FilterSettings').css('display', '');
                            $('#cmb_prncFltr_FilterSettings')[0].selectedIndex = 3;
                            $('#cmb_prncFltr_FilterSettings').trigger('change');
                        } else {
                            $('#cmb_prncFltr_FilterSettings').css('display', '');
                            $('#txt_prncFltr_FilterSettings').css('display', '');
                            $('#cmb_prncFltr_FilterSettings').trigger('change');
                            isOnlyTxtView = true;
                        }

                        $('#txt_prncFltr_FilterSettings').val(text);
                        $('#btn_prncFltr_FilterSettings_Apply').attr('ctrlSrc', $(xThisss).closest('table').attr('id'));

                        $('#dv_prncFltr_FilterSettings').css({ 'display': '', 'opacity': '0' });
                        $('#dv_prncFltr_FilterSettings').position({ my: 'left top', at: 'center center', of: $(xThisss) });

                        $('#dv_prncFltr_FilterSettings').animate({ opacity: 1 }, 'fast', function () {

                        });
                    }
                });

                $('#img_prncFltr_wait').css({ 'display': 'none' });
            }
        });
    }, 5);
};

function apply_prnc_filter(tblID, currClsss) {
    var allObjcts = [];
    $('.' + currClsss).each(function () {
        var currTxtClass = this;

        if ($(currTxtClass).val().match('{')) {
            allObjcts.push($.parseJSON($(currTxtClass).val()));
        }
    });

    $('#' + tblID + ' tr').css('display', '');

    for (var i = 1; i < $('#' + tblID)[0].rows.length; i++) {
        var showCell = true;

        for (var j = 0; j < allObjcts.length; j++) {
            var myAtIndx = parseInt(allObjcts[j].index);
            try {
                if (allObjcts[j].operand == 'equals') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase() == allObjcts[j].value.toLowerCase()) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'not equals') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase() != allObjcts[j].value.toLowerCase()) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'like') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().match(allObjcts[j].value.toLowerCase())) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'starts with') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().substring(0, allObjcts[j].value.length) == allObjcts[j].value.toLowerCase()) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'ends with') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().substring($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.length - allObjcts[j].value.length, $('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.length) == allObjcts[j].value.toLowerCase()) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'less than') {
                    if (parseFloat($.trim($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML)) < parseFloat($.trim(allObjcts[j].value))) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'greater than') {
                    if (parseFloat($.trim($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML)) > parseFloat($.trim(allObjcts[j].value))) {
                        //showCell = true;
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'true') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().match('type\="checkbox"')) {
                        if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().match('checked\="checked"')) {
                            //showCell = true;
                        } else {
                            showCell = false;
                        }
                    } else {
                        showCell = false;
                    }
                } else if (allObjcts[j].operand == 'false') {
                    if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().match('type\="checkbox"')) {
                        if ($('#' + tblID)[0].rows[i].cells[myAtIndx].innerHTML.toLowerCase().match('checked\="checked"')) {
                            showCell = false;
                        } else {
                            //showCell = true;
                        }
                    } else {
                        showCell = false;
                    }
                }
            } catch (e) {
                alert(e + ' -- ' + tblID + ' -- ' + myAtIndx);
            }
        }

        if (showCell == false) {
            $('#' + tblID)[0].rows[i].style.display = 'none';
        }
    }

    $('#dv_prncFltr_FilterSettings').css('display', 'none');

    while (allObjcts.length > 0) {
        allObjcts.pop();
    }
};

function prncFltrsortTable(table, col, ASCorDESC) {
    var prncFlterObjctFrom = $.parseJSON($('#' + table).attr('filterMode'));
    var reverse = ASCorDESC; // true - ASC; false - DESC

    if (prncFlterObjctFrom.mode == 'basic') {
        try {
            var arrRws = new Array();
            for (var j = 1; j < $('#' + table)[0].rows.length; j++) {
                arrRws.push($('#' + table)[0].rows[j]);
            }

            var tb = $('#' + table)[0].tBodies[0],
                tr = arrRws,
                i;
            reverse = -((+reverse) || -1);
            tr = tr.sort(function (a, b) {
                if ('textContent' in a.cells[col]) {
                    return reverse // `-1 *` if want opposite order
                    * (a.cells[col].textContent.trim()
                        .localeCompare(b.cells[col].textContent.trim())
                    );
                } else {
                    return reverse // `-1 *` if want opposite order
                    * (a.cells[col].innerText.trim()
                        .localeCompare(b.cells[col].innerText.trim())
                    );
                }
            });
            for (i = 0; i < tr.length; ++i) tb.appendChild(tr[i]);
        } catch (e) {
            alert(e.message);
        }
    } else {
        var currClss = 'clss_prncFltr_' + table;

        $('.' + currClss).each(function () {
            var currTxtClass = this;

            if ($(currTxtClass).val().match('{')) {
                var compareTmpObj = $.parseJSON($(currTxtClass).val());

                if ('sortOrder' in compareTmpObj) {
                    compareTmpObj.sortOrder = '';
                }

                $(currTxtClass).val(JSON.stringify(compareTmpObj));
            }
        });

        var currTxtClassx = 'txt_prncFltr_' + table + '_' + col;

        if ($('#' + currTxtClassx).val().match('{')) {
            var compareTmpObj = $.parseJSON($('#' + currTxtClassx).val());

            compareTmpObj.sortOrder = (ASCorDESC == true ? 'DESC' : 'ASC');

            $('#' + currTxtClassx).val(JSON.stringify(compareTmpObj));
        } else {
            var tempJSONobjctxxx = {
                columnN: prncFlterObjctFrom.columns[col],
                value: '',
                index: col,
                sortOrder: (ASCorDESC == true ? 'DESC' : 'ASC')
            };
            $('#' + currTxtClassx).val(JSON.stringify(tempJSONobjctxxx));
        }

        apply_prnc_filter_SQL(table, currClss, '1');
    }
};

function prncGrdExportReport(rElement, rType) {
    if ($('#' + rElement + ' .prcFlt_nrmRowClass').length > 0) {
        var tbl = $("<table></table>");

        $(tbl).append("<tr></tr>");
        $('th', $('#' + rElement + ' .prncFltrSQL_Head')).each(function () {
            currTH = this;

            var orgHTMLlll = $('<th>' + $('<div>' + $(currTH).html() + '</div>').text() + '</th>');
            $(tbl).find('tr:last').append("<th>" + $(orgHTMLlll).html() + "</th>");            
        });

        $('#' + rElement + ' .prcFlt_nrmRowClass').each(function () {
            $(tbl).append("<tr>" + $(this).html() + "</tr>");            
        });

        $("body").append('<form id="exportform" action="' + prncFltrAJAXurl + '?fileName=' + rElement + '&extension=' + rType + '" method="post" target="_blank"><input type="hidden" id="exportdata" name="exportdata" /></form>');
        $("#exportdata").val("<table class='prncFltrStyle'>" + $(tbl).html() + "</table>");
        $("#exportform").submit().remove();
        return true;
    }
};

var prncImgFiltrSortASC = "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBI"
    + "WXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gsMDS4BrT7zvwAAAM5JREFUKM+F0j1KBEEQBeBv1z8Q"
    + "RGE1E0RBzLyArJmRglcwEj2WiRcQjAxM1MRcENZcNjcRXQNfYzPMjA+Kouvn1evq5heHmGDTH5aw"
    + "pgXD+BF2sFzlzvGGhWbTfPx3/KzK3WGKr66mNrzECgaFdNjTdIbPFF7XKvomTfGQhby2FZyGabeS"
    + "0okueTMc4x6PeMpi9v+Tt4GDquYDKyW5jcuwH+XciwFucJL3mMNVNreHcWL1dd6LjOdMusViCi4S"
    + "a9qkMIxz6a3G3xs1bB2rPxZDKMj4Z7xMAAAAAElFTkSuQmCC";

var prncImgFiltrSortDESC = "iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBI"
    + "WXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gsMDS4duT+v8AAAAM1JREFUKM990r1OQkEQBeAPuEiJ"
    + "idCRGAoM70C0s7IgdpY2Fha+A4/CO5DQQmNofAAbQk1IbIyVxmvhENcL955kMpmfM3tmd/nFFdbo"
    + "+UMLZwXroL1vuEWOi4T0GLmirbNo+A6fJ6QFHtBIcnVsM+V4DTtAvYJ0j89E1gdGUHXSDs84QS1I"
    + "72nDOKYNIq5VDCuVl+MGS6wwSYtV8rqxQ4ZNsdhP3uQ64mP4J3kWhK/w08gPcVe2QhcvQZjHbcET"
    + "3tAs038ZS58X/t7pseYfnoMpRl4xWBoAAAAASUVORK5CYII=";

var prcn_img_filterFunnel64 = "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABmJLR0QA/wD/AP+gvaeTAAAACXBI"
    + "WXMAAArwAAAK8AFCrDSYAAAAB3RJTUUH3gsKDiYTsXPpegAAAa1JREFUKM99j8+rEgEUhb9xnIQG"
    + "XwuNIQMZaBFCuwpfIPJW5cqNG8EWbyf1H7TqXwhaSNDCnRtDI94iaBMiOCAuJNIkBcmZRh0Gyx+D"
    + "48yzTYZEdOAuLvc753CFxWJxRdO0u7ZtP3Zd94Esy3FJkiTf9xemaX4ZDofvDcN4U6lUJoAnKory"
    + "QtO0V7PZ7L4syzdisdhVVVVDiUTiWiqVupXJZB5Go9FzXde/jUajQWA+n5+1Wi2WyyWO4+C6Lp7n"
    + "/RmA09PTk+l0+gi4GQgGg08LhcJOEAQsy8JxHERRRJIkNpsN1WqVZDL5tdvtjoBLAQiVy+Vn+Xz+"
    + "+WAwwDRNbNum3+/T6/WYTCbDZrN5AbwDGiLg1+v1djgcvpPNZm97nofruui6jmVZ3xuNRtN13Q/A"
    + "R2DDkaKlUumzYRj7Wq22LxaL23g8fgE8Aa4fIPHIsPF9/5OiKOe6rtPpdKx2u10F3gL6AQoeV+Ry"
    + "ubGqqux2O7bb7QIYAZNjJnC8jMfjn6vVqiuKIuv1+gfgAJf8T6FQ6F46nX4diUReAmd/hwr/8AR/"
    + "P3kCzIAFsD8cfwER28tNpVXUwwAAAABJRU5ErkJggg==";

var prnc_img_Wait = "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";

var prnImgforExcel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAAD"
    + "EtGw7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gMVDBQ"
    + "Jmu+cFwAABEZJREFUOMullUtoVFccxn//c+9Mkkkmk6kuLIlgQEG6KDaLWrWtiNaNIkgptiooCkU"
    + "EcdF2pUgtIbvqRhA3xUetoEEIpoJEUmi1hFIfoUQJlNC6kOYxNXPndR/n0cXEsTGtRXrgz+Eezvn"
    + "Odz++73/EOecba9YB7wCW/zcSY8zZdCpdkKAavJdJZ66FSdgUmQgReXk4Bw5HtjmLMWasElbe9Yth"
    + "ca2xpunhHw9J+2kHyMJzbt63LNyCddb5yrfLOpatmJiYWO4HtSC21lJLaiQmEefmgyhRKKVwOATBO"
    + "YexZgGwUkq00YStoWSz2XY/qAWS9tOUwhJL2pcgIvPkiE3MbGUW3/NxOFJeilxzbsFf1JIalagiiU"
    + "04dvwYfjEsksvkmK3NsnHlRqbL03Qv7p536N6je4w9HiPfmmf9ivW0pFsWMJ6YnmDkzxG01ShPGb"
    + "9YLRK1R5TDMpPBJFPlKR7PPmbd8nVYVzfJqqWriE1Mz9IefM+v6+4cIoK2Gl/5jE+OE+mIWMdU46"
    + "pSxbBIpCOqcZWB0QEWty5GG82tX2+hRCHUpVndvZqUn0JEGqDGGipRhSP9Rzjz/Rn67/RTi2tYY0U"
    + "FYUCsY4IwwFjD5Z8v05HpINIRA/cHEBGstTjnGiUiGGPwlMeWL7fQd6OPgfsDXP/pOtWkinUWVaw"
    + "WiXVMKSwRhAGRiTg/cp7OXCfWWW4+uIlSqmGzpxfNhrOs+XwNtx/crsdqzqjaaCIdoYIwINIRpbB"
    + "ENa5SCktEScSFkQtsf2M7w+PD7Di9o87SGayzaKfpvdZLW2sbG3o2sOm1TXTlu+ail5CY5BnjclS"
    + "uV1imJd3C8W3Hsc7St72vPn/bh6c8BCGt0pz88CRDnw0x/OkwQ58MsefNPQ3g2MR1xrGJCWoBhXIB"
    + "QTi65ShKKZQojDVcOnCJu7/fZeeZnXUnON3Q2xiDsYbBXwbrUlhNrGNUsfaMcbY5y+ndp2lvbkeJw"
    + "jnXYNl/sB+LpXewF1/5DSt6nseBrw8wOj7a0FhbbVUSJtSSGpl0hhMfnGik7mm0nXMoUWijufjxRU"
    + "YfjbLvq314ysNRZ31q5yl2bdwFGrTVLjKRU4QwWZpk/9v7ybfm696di/Xfy/d8BOHKwSvEJubQN4c"
    + "w1qBtXZZz+8/R+WonYRxKnMSeb2oGheLG2A0iHfGk8gRR/946tdFs69lGV76LmfJMIzCZdIZ8Nk81"
    + "qaKNdr6ualJ+irM/nuXqvasUnxTBm/PlC/qvjw/q+S6f4G/wCZNQfGq4SlzBxtZ5rZ64JvffzV5Ao"
    + "xeul8BY4xKTODVTm0ltfX0ruZacKwQFi8a62FmXvKDif6iys3s37bVtTW1SNEUR3qd789rNg7vf2r"
    + "18qjjViO/LDkHItebk8KnDv5V+KH0ki75YJIXvCh0UWCmRvOLEWfFEY/Cff5YEqb8kInbOiqqxhuA"
    + "ipzJTmelqpXrnL9S7vbd8jpSNAAAAAElFTkSuQmCC";


var prnImgforWord = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEt"
    + "Gw7AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gMVDBQiNl"
    + "NlVwAAA/tJREFUOMullV2IVVUUx39rn3PvmW+tSKuXkkYJogQJwaKgoDAQesoIfKjnoB56Fwl66KE"
    + "eeokeRIWohJLAaDL7gCEHMkTNsZzMcfxAxeaOc++ce+7Z3z2ce+/MYBDYhs3hrMP57/9//ddaW2KM"
    + "qQ/hKaI8jRD4f8t6H/bXa0lDWu3y+aGsdrg0LtPOI8gd4EVihNGhDB/82XZRPpM22+WT3ofsj8vz1"
    + "NMkRu4ImRhjTJUKD60f3jg7e3E8beXahBAptSWEKPFffhIg/gewgOTOUJoBGR0dG0tbhZZ6PaHVsQ"
    + "z6StIqif0fVwiR2D1ptTjrrDgf2b1nD2mr0GT1lAfXr2Hzw+sJoQITgZkrDc5fbbBj2yZ6ORIRrtx"
    + "sUksT1t013FeTKOHw1AzGelRS86qZa4z1LC6VlMahlJCIUGhLo1mwZfx+EiUkSlDd7XxgoVVgva9i"
    + "Au3SUhqH9Z5OaZRabJeICFO/X+HXmWuICKKEydOXOHdpngfuHSV0i1BE+s+J4xdQIogIf15d4JXdB"
    + "9k/cZKOdvjgRbXaGm0dRWnxfrmMlwrDoxvWVQfJMijA2bmbzC/mZLUUgJ3vfME3P59j4vtpiqoIUM"
    + "12iXGepaJKSW9ltYQtm+6DGPugPWMLbdn53GOU2jJ55jLTJ+eQ4QFIqjRp6yvzjPUsdUwfOMbI9q3"
    + "jDNRr/fcKPALCi1s3MpilJEqx99AvyOggoavWOo91nrRn3lKh0c73mQ1mNWKXYozdQu0yHxvOCCFy"
    + "K+/w6Q/TxET1TMD6gHEB1SpKtHPkxTJjkYplj+lnP55BG4f3oR9XSnj7o+9wHbOqeZwPVck1c40xo"
    + "WK8IsfSdfx6I+eDz6eopaof8z4wd2ORA18eR0YGVjSO4FzAhRiUKaqqaBUG61y33yCEiu3r731FXU"
    + "lVWt18KyW8f3AK6ultfe28j9r6qEJbY5wn72hK43E+4F1AW8epCzeYPDZDNjKA6ZpSGW05dPQ3kix"
    + "dPUNixPggxtgkDXmJtp5WYbh44xbfHv+LCCgRPjlyik6qWGgWHD0xS4yQJorJ03Nca+SQpZUhvaUU"
    + "zgWM8zENRY+x4cCR03y49ydIK5djVoNEceb8dV56c19vLhHrKQyktw0hIrhKlaRoHQvt0K1OHBmsC"
    + "2uHllmErtA0gdF0leTb5mgErMXHGK3zUc23y9qObRtZMzYYGwt5CNqGUJoQShuicVVRahdCafs76m"
    + "585c6L8NrL28LIQCbNthJh8xsbXnj2ia93bX98/OZCjlLqji47AdaMDspb7+6bW5qeeFXu2fWxNI4"
    + "cW0tt9hGJ7bsjBFGpI/h05aBfeZOIqABCjF4JQiRW3zpWDeVX/y7c4ol/AHuonUG3wHIVAAAAAElF"
    + "TkSuQmCC";

function checkForJSONstringify() {
    /*
        I did not write this function!

        This function adds JSON.stringify support to browsers that don't support it (caugh! caugh! IE!)

        Credit goes out to 'chicagoworks' for this JSON code. https://gist.github.com/chicagoworks/754454
    */

    jQuery.extend({
        stringify: function stringify(obj) {
            if ("JSON" in window) {
                return JSON.stringify(obj);
            }

            var t = typeof (obj);
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") obj = '"' + obj + '"';
                return String(obj);
            } else {
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);

                for (n in obj) {
                    v = obj[n];
                    t = typeof (v);
                    if (obj.hasOwnProperty(n)) {
                        if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        }
    });

    /*
        I did not write this function!

        Credit goes out to 'Google' for this JSON code. https://code.google.com/p/jquery-ui/source/browse/trunk/ui/jquery.ui.position.js?r=3897
    */

    /*
     * jQuery UI Position @VERSION
     *
     * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
     * Dual licensed under the MIT (MIT-LICENSE.txt)
     * and GPL (GPL-LICENSE.txt) licenses.
     *
     * http://docs.jquery.com/UI/Position
     */
    (function ($) {

        $.ui = $.ui || {};

        var horizontalPositions = /left|center|right/,
                horizontalDefault = "center",
                verticalPositions = /top|center|bottom/,
                verticalDefault = "center",
                _position = $.fn.position,
                _offset = $.fn.offset;

        $.fn.position = function (options) {
            if (!options || !options.of) {
                return _position.apply(this, arguments);
            }

            // make a copy, we don't want to modify arguments
            options = $.extend({}, options);

            var target = $(options.of),
                    collision = (options.collision || "flip").split(" "),
                    offset = options.offset ? options.offset.split(" ") : [0, 0],
                    targetWidth,
                    targetHeight,
                    basePosition;

            if (options.of.nodeType === 9) {
                targetWidth = target.width();
                targetHeight = target.height();
                basePosition = { top: 0, left: 0 };
            } else if (options.of.scrollTo && options.of.document) {
                targetWidth = target.width();
                targetHeight = target.height();
                basePosition = { top: target.scrollTop(), left: target.scrollLeft() };
            } else if (options.of.preventDefault) {
                // force left top to allow flipping
                options.at = "left top";
                targetWidth = targetHeight = 0;
                basePosition = { top: options.of.pageY, left: options.of.pageX };
            } else {
                targetWidth = target.outerWidth();
                targetHeight = target.outerHeight();
                basePosition = target.offset();
            }

            // force my and at to have valid horizontal and veritcal positions
            // if a value is missing or invalid, it will be converted to center
            $.each(["my", "at"], function () {
                var pos = (options[this] || "").split(" ");
                if (pos.length === 1) {
                    pos = horizontalPositions.test(pos[0]) ?
                            pos.concat([verticalDefault]) :
                            verticalPositions.test(pos[0]) ?
                                    [horizontalDefault].concat(pos) :
                                    [horizontalDefault, verticalDefault];
                }
                pos[0] = horizontalPositions.test(pos[0]) ? pos[0] : horizontalDefault;
                pos[1] = verticalPositions.test(pos[1]) ? pos[1] : verticalDefault;
                options[this] = pos;
            });

            // normalize collision option
            if (collision.length === 1) {
                collision[1] = collision[0];
            }

            // normalize offset option
            offset[0] = parseInt(offset[0], 10) || 0;
            if (offset.length === 1) {
                offset[1] = offset[0];
            }
            offset[1] = parseInt(offset[1], 10) || 0;

            if (options.at[0] === "right") {
                basePosition.left += targetWidth;
            } else if (options.at[0] === horizontalDefault) {
                basePosition.left += targetWidth / 2;
            }

            if (options.at[1] === "bottom") {
                basePosition.top += targetHeight;
            } else if (options.at[1] === verticalDefault) {
                basePosition.top += targetHeight / 2;
            }

            basePosition.left += offset[0];
            basePosition.top += offset[1];

            return this.each(function () {
                var elem = $(this),
                        elemWidth = elem.outerWidth(),
                        elemHeight = elem.outerHeight(),
                        position = $.extend({}, basePosition);

                if (options.my[0] === "right") {
                    position.left -= elemWidth;
                } else if (options.my[0] === horizontalDefault) {
                    position.left -= elemWidth / 2;
                }

                if (options.my[1] === "bottom") {
                    position.top -= elemHeight;
                } else if (options.my[1] === verticalDefault) {
                    position.top -= elemHeight / 2;
                }

                $.each(["left", "top"], function (i, dir) {
                    if ($.ui.position[collision[i]]) {
                        $.ui.position[collision[i]][dir](position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            offset: offset,
                            my: options.my,
                            at: options.at
                        });
                    }
                });

                if ($.fn.bgiframe) {
                    elem.bgiframe();
                }
                elem.offset($.extend(position, { using: options.using }));
            });
        };

        $.ui.position = {
            fit: {
                left: function (position, data) {
                    var win = $(window),
                            over = position.left + data.elemWidth - win.width() - win.scrollLeft();
                    position.left = over > 0 ? position.left - over : Math.max(0, position.left);
                },
                top: function (position, data) {
                    var win = $(window),
                            over = position.top + data.elemHeight - win.height() - win.scrollTop();
                    position.top = over > 0 ? position.top - over : Math.max(0, position.top);
                }
            },

            flip: {
                left: function (position, data) {
                    if (data.at[0] === "center") {
                        return;
                    }
                    var win = $(window),
                            over = position.left + data.elemWidth - win.width() - win.scrollLeft(),
                            myOffset = data.my[0] === "left" ?
                                    -data.elemWidth :
                                    data.my[0] === "right" ?
                                            data.elemWidth :
                                            0,
                            offset = -2 * data.offset[0];
                    position.left += position.left < 0 ?
                            myOffset + data.targetWidth + offset :
                            over > 0 ?
                                    myOffset - data.targetWidth + offset :
                                    0;
                },
                top: function (position, data) {
                    if (data.at[1] === "center") {
                        return;
                    }
                    var win = $(window),
                            over = position.top + data.elemHeight - win.height() - win.scrollTop(),
                            myOffset = data.my[1] === "top" ?
                                    -data.elemHeight :
                                    data.my[1] === "bottom" ?
                                            data.elemHeight :
                                            0,
                            atOffset = data.at[1] === "top" ?
                                    data.targetHeight :
                                    -data.targetHeight,
                            offset = -2 * data.offset[1];
                    position.top += position.top < 0 ?
                            myOffset + data.targetHeight + offset :
                            over > 0 ?
                                    myOffset + atOffset + offset :
                                    0;
                }
            }
        };

        // offset setter from jQuery 1.4
        if (!$.offset.setOffset) {
            $.offset.setOffset = function (elem, options) {
                // set position first, in-case top/left are set even on static elem
                if (/static/.test($.curCSS(elem, "position"))) {
                    elem.style.position = "relative";
                }
                var curElem = $(elem),
                        curOffset = curElem.offset(),
                        curTop = parseInt($.curCSS(elem, "top", true), 10) || 0,
                        curLeft = parseInt($.curCSS(elem, "left", true), 10) || 0,
                        props = {
                            top: (options.top - curOffset.top) + curTop,
                            left: (options.left - curOffset.left) + curLeft
                        };

                if ('using' in options) {
                    options.using.call(elem, props);
                } else {
                    curElem.css(props);
                }
            };

            $.fn.offset = function (options) {
                var elem = this[0];
                if (!elem || !elem.ownerDocument) { return null; }
                if (options) {
                    return this.each(function () {
                        $.offset.setOffset(this, options);
                    });
                }
                return _offset.call(this);
            };
        }

    }(jQuery));
}
