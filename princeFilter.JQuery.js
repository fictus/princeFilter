/*
    princeFilter.JQuery.js
    ======================

    VERSION 1.0.1


    Created by Luis Valle (8/19/2014)
    www.evicore.com/princeFilter.aspx


    JQuery plugin for filtering table-data. Use the following operands to filter your table-data: 'equlas', 
    'not-equals', 'like', 'starts with', 'ends with', 'less than', 'greater than', 'true' or 'false' 
    (for cells that contain checkboxes).


    (this plugin can be used on multiple tables at the same time)

	USAGE
	+++++

		Instantiating princeFilter is done in the following way:

				$('#tbl_Mytable').princeFilter();


    OPTIONAL PARAMETERS TO PASS
    +++++++++++++++++++++++++++

        By default princeFilter assumes your tables contains a header Row (first row). If that is not the case
        and your table contains no header, you must instantiate princeFilter with the following Parameter:

                $('#tbl_Mytable').princeFilter({ containsHeader: false });
    
    
        Also, the princeFilter orange funnel button is set to an absolute position by default. Some
        cases may require the button to stay at a fixed position. If you must set it to fixed
        positioning you can do so by passing the folloiwng Parameter:

                $('#tbl_Mytable').princeFilter({ buttonPosition: 'fixed' });






    Then just click the 'FUNNEL' symbol to open princeFilter from your table...

*/

$(document).ready(function () {
    checkForJSONstringify();
});

(function ($) {
    $.fn.princeFilter = function (options) {
        var thisElement = this;

        if ($(thisElement)[0] != null) {
            var settings = $.extend({
                containsHeader: true,
                buttonPosition: 'absolute'
            }, options);

            var btnHTML = "<div id=\"dv_prncFltr_" + $(thisElement).attr("id") + "\" style=\"display:inline-block;position:" + settings.buttonPosition + ";padding:0px !important;padding:2px !important;outline:1px solid #4C9ED9;width:16px;height:16px;margin-left:6px;margin-top:-18px;background-color:orange;cursor:pointer;\" onmousedown=\"return false;\"><img src=\"data:image/png;base64," + prcn_img_filterFunnel64 + "\" alt=\"^\" /></div>";
            btnHTML = btnHTML + "<input id=\"txt_prncFltr_" + $(thisElement).attr("id") + "\" type=\"text\" value=\"\" style=\"display:none;\"></input>";
            $(thisElement).prepend(btnHTML);

            $('#txt_prncFltr_' + $(thisElement).attr('id')).val('{\"filter\":[],\"header\":' + settings.containsHeader + '}');

            $('#dv_prncFltr_' + $(thisElement).attr('id')).css('opacity', '0.4');
            $('#dv_prncFltr_' + $(thisElement).attr('id')).on('mouseover', function () {
                $('#dv_prncFltr_' + $(thisElement).attr('id')).stop().animate({
                    opacity: 0.9
                }, 'slow');
            });
            $('#dv_prncFltr_' + $(thisElement).attr('id')).on('mouseout', function () {
                $('#dv_prncFltr_' + $(thisElement).attr('id')).stop().animate({
                    opacity: 0.4
                }, 'slow');
            });
            $('#dv_prncFltr_' + $(thisElement).attr('id')).on('click', function () {
                var thisFiltrOps = $.parseJSON($('#txt_prncFltr_' + $(thisElement).attr('id')).val());
                //thisFiltrOps.filter.push({ column1: 'value' });


                if (thisFiltrOps.filter.length == 0) {
                    if (settings.containsHeader == true) {
                        if ($(thisElement)[0].rows.length > 0) {
                            for (var i = 0; i < $(thisElement)[0].rows[0].cells.length; i++) {
                                var xColName = 'column' + i;
                                thisFiltrOps.filter.push($.parseJSON('{\"selected\":false,\"operand\":\"equals\",\"title\":\"' + $(thisElement)[0].rows[0].cells[i].innerHTML + '\",\"value\":\"\"}'));
                            }

                            $('#txt_prncFltr_' + $(thisElement).attr('id')).val(JSON.stringify(thisFiltrOps));
                        }
                    } else {
                        if ($(thisElement)[0].rows.length > 0) {
                            for (var i = 0; i < $(thisElement)[0].rows[0].cells.length; i++) {
                                var xColName = 'column' + i;
                                thisFiltrOps.filter.push($.parseJSON('{\"selected\":false,\"operand\":\"equals\",\"title\":\"' + xColName + '\",\"value\":\"\"}'));
                            }

                            $('#txt_prncFltr_' + $(thisElement).attr('id')).val(JSON.stringify(thisFiltrOps));
                        }
                    }
                }

                //alert(JSON.stringify(thisFiltrOps));
                if (thisFiltrOps.filter.length > 0) {
                    if ($('#dv_prncFltr_FilterSettings')[0] == null) {
                        var fltDV = "<div id=\"dv_prncFltr_FilterSettings\" style=\"position:fixed;top:0px;left:0px;width:100%;height:100%;display:none;\">";
                        fltDV = fltDV + "<div id=\"dv_prncFltr_FilterSettings_white\" style=\"position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:white;\"></div>";
                        fltDV = fltDV + "<div style=\"position:fixed;top:0px;left:0px;width:100%;height:100%;\">";
                        fltDV = fltDV + "<div style=\"position:absolute;width:400px;heigth:auto;left:50%;margin-left:-200px;background-color:white;outline:1px solid orange;top:100px;\">";
                        fltDV = fltDV + "<div style=\"padding:4px;text-align:center;color:white;font-weight:bold;background-color:orange;\">Table Filter Options</div>";
                        fltDV = fltDV + "<div style=\"height:200px;overflow-y:auto;\"><div style=\"padding:5px;\"><table id=\"tbl_prncFltr_FilterSettings\" style=\"border-collapse:collapse;width:100%;\"></table></div></div>";
                        fltDV = fltDV + "<div style=\"padding:15px;text-align:center;background-color:#EBEBEB;border-top:1px solid #777571;\"><input id=\"btn_prncFltr_FilterSettings_Cabcel\" type=\"submit\" value=\"Close\" style=\"border:1px solid red;background-color:#FFBBBB;cursor:pointer;\" /><input id=\"btn_prncFltr_FilterSettings_Reset\" type=\"submit\" value=\"Reset Filter\" style=\"border:1px solid #8080C0;background-color:#D6D6EB;margin-left:15px;cursor:pointer;\" /><input id=\"btn_prncFltr_FilterSettings_Apply\" ctrlSrc=\"" + $(thisElement).attr('id') + "\" type=\"submit\" value=\"Apply Filter\" style=\"margin-left:50px;border:1px solid #4C9ED9;background-color:#CBE2F3;cursor:pointer;\" /></div></div></div></div>";

                        $(fltDV).insertAfter($(thisElement));
                        $('#dv_prncFltr_FilterSettings_white').css('opacity', '0.75');
                    } else {
                        $('#btn_prncFltr_FilterSettings_Apply').attr('ctrlSrc', $(thisElement).attr('id'));
                        $('#dv_prncFltr_FilterSettings').insertAfter($(thisElement));
                    }

                    $('#btn_prncFltr_FilterSettings_Cabcel').unbind('click');
                    $('#btn_prncFltr_FilterSettings_Reset').unbind('click');
                    $('#btn_prncFltr_FilterSettings_Apply').unbind('click');

                    $('#btn_prncFltr_FilterSettings_Cabcel').bind('click', function () {
                        $('#dv_prncFltr_FilterSettings').css('display', 'none');
                        return false;
                    });
                    $('#btn_prncFltr_FilterSettings_Reset').bind('click', function () {
                        apply_prnc_reset($('#btn_prncFltr_FilterSettings_Apply').attr('ctrlSrc'));
                        return false;
                    });
                    $('#btn_prncFltr_FilterSettings_Apply').bind('click', function () {
                        apply_prnc_filter($('#btn_prncFltr_FilterSettings_Apply').attr('ctrlSrc'));
                        return false;
                    });

                    $('#dv_prncFltr_FilterSettings').css({ 'display': 'none', 'opacity': '0' });
                    $('#tbl_prncFltr_FilterSettings tr').remove();

                    for (var i = 0; i < thisFiltrOps.filter.length; i++) {
                        var xChk_Checked = "";
                        var xChk_Disabld = "";
                        if (thisFiltrOps.filter[i].selected == true) {
                            xChk_Checked = "checked";
                        } else {
                            xChk_Disabld = "disabled";
                        }
                        var xTR = "<tr><td style=\"border:1px solid orange;background-color:#EBEBEB;\">" + "<input id=\"chk_prncFltr_FilterSettings_" + i + "\" indx=\"" + i + "\" type=\"checkbox\" name=\"chk_prncFltr_FilterSettings_" + i + "\" " + xChk_Checked + "/>" + thisFiltrOps.filter[i].title + "</td><td style=\"border:1px solid orange;background-color:#EBEBEB;\"><select id=\"cmb_prncFltr_FilterSettings_" + i + "\" indx=\"" + i + "\" " + xChk_Disabld + "></select></td><td style=\"border:1px solid orange;background-color:#EBEBEB;\"><input type=\"text\" id=\"txt_prncFltr_FilterSettings_" + i + "\" style=\"width:100px;\" value=\"" + thisFiltrOps.filter[i].value + "\" " + xChk_Disabld + "/></td></tr>";
                        $('#tbl_prncFltr_FilterSettings').append(xTR);

                        var xOpss = "<option value=\"equals\">equals</option>";
                        xOpss = xOpss + "<option value=\"not equals\">not equals</option>";
                        xOpss = xOpss + "<option value=\"like\">like</option>";
                        xOpss = xOpss + "<option value=\"starts with\">starts with</option>";
                        xOpss = xOpss + "<option value=\"ends with\">ends with</option>";
                        xOpss = xOpss + "<option value=\"less than\">less than</option>";
                        xOpss = xOpss + "<option value=\"greater than\">greater than</option>";
                        xOpss = xOpss + "<option value=\"true\" title=\"for checkboxes only - ''true'' means it's checked\" style=\"color:red;\">true</option>";
                        xOpss = xOpss + "<option value=\"false\" title=\"for checkboxes only - ''false'' means it's unchecked\" style=\"color:red;\">false</option>";
                        $('#cmb_prncFltr_FilterSettings_' + i).append(xOpss);
                        $('#cmb_prncFltr_FilterSettings_' + i).val(thisFiltrOps.filter[i].operand);

                        $('#chk_prncFltr_FilterSettings_' + i).on('change', function () {
                            var xRess = $(this).prop('checked');
                            var iii = $(this).attr('indx');
                            if (xRess == true) {
                                $('#cmb_prncFltr_FilterSettings_' + iii).removeAttr('disabled');
                                $('#txt_prncFltr_FilterSettings_' + iii).removeAttr('disabled');
                            } else {
                                $('#cmb_prncFltr_FilterSettings_' + iii).attr('disabled', 'disabled');
                                $('#txt_prncFltr_FilterSettings_' + iii).attr('disabled', 'disabled');
                            }
                        });

                        $('#cmb_prncFltr_FilterSettings_' + i).on('change', function () {
                            var iii = $(this).attr('indx');
                            var cOperand = $('#cmb_prncFltr_FilterSettings_' + iii + ' option:selected').val();

                            if (cOperand == 'true' || cOperand == 'false') {
                                $('#txt_prncFltr_FilterSettings_' + iii).css('display', 'none');
                            } else {
                                $('#txt_prncFltr_FilterSettings_' + iii).css('display', '');
                                $('#txt_prncFltr_FilterSettings_' + iii)[0].focus();
                            }
                        });
                        $('#cmb_prncFltr_FilterSettings_' + i).trigger('change');
                    }

                    $('#dv_prncFltr_FilterSettings').css('display', '');
                    $('#dv_prncFltr_FilterSettings').animate({
                        opacity: 1
                    }, 'fast');
                }
            });
        } else {
            //alert('This element doesnt exist!');
        };

        function apply_prnc_reset(tblID) {
            var cFilterOptions = $.parseJSON($('#txt_prncFltr_' + tblID).val());

            for (var i = 0; i < $('#tbl_prncFltr_FilterSettings')[0].rows.length; i++) {
                var cSelected = false;
                var cOperand = 'equals';
                var cValue = '';

                $('#chk_prncFltr_FilterSettings_' + i).prop('checked', false);
                $('#cmb_prncFltr_FilterSettings_' + i).val('equals');
                $('#txt_prncFltr_FilterSettings_' + i).val('');

                $('#chk_prncFltr_FilterSettings_' + i).trigger('change');
                $('#cmb_prncFltr_FilterSettings_' + i).trigger('change');

                cFilterOptions.filter[i].selected = cSelected;
                cFilterOptions.filter[i].operand = cOperand;
                cFilterOptions.filter[i].value = cValue;
            }
            $('#txt_prncFltr_' + tblID).val(JSON.stringify(cFilterOptions));

            $('#' + tblID + ' tr').css('display', '');
        };

        function apply_prnc_filter(tblID) {
            var cFilterOptions = $.parseJSON($('#txt_prncFltr_' + tblID).val());
            var cAllUnchecked = true;

            for (var i = 0; i < $('#tbl_prncFltr_FilterSettings')[0].rows.length; i++) {
                var cSelected = $('#chk_prncFltr_FilterSettings_' + i).prop('checked');
                var cOperand = $('#cmb_prncFltr_FilterSettings_' + i + ' option:selected').val();
                var cValue = $('#txt_prncFltr_FilterSettings_' + i).val();

                if (cSelected == true) {
                    cAllUnchecked = false;
                }

                cFilterOptions.filter[i].selected = cSelected;
                cFilterOptions.filter[i].operand = cOperand;
                cFilterOptions.filter[i].value = cValue;
            }
            $('#txt_prncFltr_' + tblID).val(JSON.stringify(cFilterOptions));

            if (cAllUnchecked == true) {
                return false;
            }

            var iIsEqualTo = 0;

            if (cFilterOptions.header == true) {
                iIsEqualTo = 1;
            }
            
            $('#' + tblID + ' tr').css('display', '');

            for (var i = iIsEqualTo; i < $('#' + tblID)[0].rows.length; i++) {
                var showCell = true;

                for (var j = 0; j < cFilterOptions.filter.length; j++) {
                    if (cFilterOptions.filter[j].selected == true) {
                        //if ($.trim(cFilterOptions.filter[j].value) != '') {
                            try {
                                if (cFilterOptions.filter[j].operand == 'equals') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase() == cFilterOptions.filter[j].value.toLowerCase()) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'not equals') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase() != cFilterOptions.filter[j].value.toLowerCase()) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'like') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().match(cFilterOptions.filter[j].value.toLowerCase())) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'starts with') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().substring(0, cFilterOptions.filter[j].value.length) == cFilterOptions.filter[j].value.toLowerCase()) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'ends with') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().substring($('#' + tblID)[0].rows[i].cells[j].innerHTML.length - cFilterOptions.filter[j].value.length, $('#' + tblID)[0].rows[i].cells[j].innerHTML.length) == cFilterOptions.filter[j].value.toLowerCase()) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'less than') {
                                    if (parseFloat($.trim($('#' + tblID)[0].rows[i].cells[j].innerHTML)) < parseFloat($.trim(cFilterOptions.filter[j].value))) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'greater than') {
                                    if (parseFloat($.trim($('#' + tblID)[0].rows[i].cells[j].innerHTML)) > parseFloat($.trim(cFilterOptions.filter[j].value))) {
                                        //showCell = true;
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'true') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().match('type\="checkbox"')) {
                                        if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().match('checked\="checked"')) {
                                            //showCell = true;
                                        } else {
                                            showCell = false;
                                        }
                                    } else {
                                        showCell = false;
                                    }
                                } else if (cFilterOptions.filter[j].operand == 'false') {
                                    if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().match('type\="checkbox"')) {
                                        if ($('#' + tblID)[0].rows[i].cells[j].innerHTML.toLowerCase().match('checked\="checked"')) {
                                            showCell = false;
                                        } else {
                                            //showCell = true;
                                        }
                                    } else {
                                        showCell = false;
                                    }
                                }
                            } catch (e) {
                                alert(e);
                            }
                        //}                        
                    }
                }

                if (showCell == false) {
                    $('#' + tblID)[0].rows[i].style.display = 'none';
                }
            }

            $('#dv_prncFltr_FilterSettings').css('display', 'none');
        };

        function save_prnc_filter(tblID) {
            var cFilterOptions = $.parseJSON($('#txt_prncFltr_' + tblID).val());

            for (var i = 0; i < $('#tbl_prncFltr_FilterSettings')[0].rows.length; i++) {
                var cSelected = $('#chk_prncFltr_FilterSettings_' + i).prop('checked');
                var cOperand = $('#cmb_prncFltr_FilterSettings_' + i + ' option:selected').val();
                var cValue = $('#txt_prncFltr_FilterSettings_' + i).val();
                
                cFilterOptions.filter[i].selected = cSelected;
                cFilterOptions.filter[i].operand = cOperand;
                cFilterOptions.filter[i].value = cValue;
            }

            $('#txt_prncFltr_' + tblID).val(JSON.stringify(cFilterOptions));
        };
    };
}(jQuery));


function checkForJSONstringify() {
    /*
        I did not write this function!

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
}

var prcn_img_filterFunnel64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAK3RFWHRDcmVhdGlvbiBUaW1lAEZyIDI4IEZlYiAyMDAzIDExOjUxOjUxICswMTAwfOn0bw"
    + "AAAAd0SU1FB9YFFw0yEYKFUhQAAAAJcEhZcwAACvAAAArwAUKsNJgAAAAEZ0FNQQAAsY8L/GEFAAACdUlEQVR42o1SvW9ScRS9j0ehNIWAIQEpqTg4mA46yOCATYyb6dLRuLB3cfAf6NKtq38"
    + "AIXERFhMGhYAmBuoAUWiVgqVA+CwfeYB8FZ7nvjy0X4M3ue+X994953fPuVcgxO7urmZ7e/tZLpd73uv1HoqieEev15vm8zlNp1Op3W6Xj46O0slk8iPOD51OZwDYOWOF09PTB4lEwp9KpTYYs"
    + "La2Rg6Hg5xOJ5lMJjKbzcq5srJCICefz5fb399/lc/no8APRKvVGvb7/Ru4lVZXV8lgMCjFRqORlpaWSKvVkiAIxP/5u9vtvtXtdp9Eo9EvIGhpUHTW7/cJbZEkSTQcDrlt4m4YyAQ6nY4giRYB"
    + "GWc4HiHNmnK5/HpnZ6e9vr5O0Eq1Wo0Gg4FSyB1ZLBalGyYNBoO0tbXVCgQC3/B7ipwLeBi8Xu/Lvb29NygS0+k0NRoNms1mNJlMFNJCoUDNZpNGo9E5/HqLb0Xg3iNTIh4zGHgCgB7sj202G8EX"
    + "stvtiu4LsuRMJvMOHTeBCSO5i76oyhrH4/Hv0Hp/c3PzHnuC26jValGpVKJ6vU7Hx8cRjLGO2k/IAyT7IC8IZOSwWCymlpeXn3o8Hiv7wH4ASBjZYSwW+ynL8oFKUOHOGSjSv5hjElK1Ws1CzgtM"
    + "QchmswyehEKhMCQcqq0XVAOV0NDlGKPNz5jI1OVyKTsBIyXI6eNfAnnCNRcBVwlYCs9wxCaq4/uNd0lte3Cl/hqBQlKpVMI8AfhB4/F4qN46vaH2kgd/A8Z9jUQiVszbgq37gb3Iq2PrXq0V6Obgv"
    + "b2rrutt5C9kTB3dfxEsSEy8qTxi9fZrMv4ACcVMYmdxl5oAAAAASUVORK5CYII=";