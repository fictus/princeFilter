    princeFilter.JQuery.js
    ======================

    VERSION 1.0.0
    
See a live Demo here:
=====================
http://www.evicore.com/princeFilter.aspx


    Created by Luis Valle
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
    
    
    Just click the 'VESTA' symbol to open princeFilter from your table...
