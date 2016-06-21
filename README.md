princeFilter.JQuery.js
======================

VERSION 2.2
    
Live Demo:
-------
http://www.evicore.net/princeFilter.aspx

Usage
-----

(BASIC MODE)
JQuery plugin for filtering table-data. Use the following operands to filter your table-data:
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
                        
(SQL MODE)
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
		




(this plugin can be used on multiple tables at the same time)




Then just click the desired Column's "FUNNEL" button to filter that Column's data...

License and Credit
---

Created by Luis Valle
www.evicore.net/princeFilter.aspx

Licensed under [Unlicense](http://unlicense.org/).
