using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Script.Serialization;

namespace JSfilterSample
{
    /// <summary>
    /// Summary description for JSfilterCOM
    /// </summary>
    public class JSfilterCOM : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string writeResult = "";
            var jss = new JavaScriptSerializer();

            try
            {
                if (context.Request.QueryString.AllKeys.Contains("fileName"))
                {
                    StreamExcelorWordFile();
                }
                else
                {                    
                    string json = new StreamReader(context.Request.InputStream).ReadToEnd();
                    Dictionary<string, object> sData = jss.Deserialize<Dictionary<string, object>>(json);
                    string xWHAT = sData["tFunction"].ToString();

                    Type t = this.GetType();
                    MethodInfo method = t.GetMethod(xWHAT);
                    object[] Params = new object[] { json };
                    method.Invoke(this, Params);
                }
            }
            catch (Exception ex)
            {
                writeResult = "{\"error\":\"1\",\"errorCode\":" + jss.Serialize("(MAIN ENTRY) " + ex.Message.ToString()) + "}";
                HttpContext.Current.Response.ContentType = "application/json";
                HttpContext.Current.Response.Write(writeResult);
            }
        }

        public void princeFilter(string json)
        {
            string ress = "";
            string errLocation = "0";

            JavaScriptSerializer jss = new JavaScriptSerializer();
            try
            {
                errLocation = "1";

                Dictionary<string, object> sData = jss.Deserialize<Dictionary<string, object>>(json);
                Dictionary<string, object> xParams = (Dictionary<string, object>)sData["params"];

                DataTable tblResults = new DataTable();
                Dictionary<string, object> iteratePrms = (Dictionary<string, object>)xParams["params"];

                using (SqlConnection dbConnection = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings[xParams["conn"].ToString()].ConnectionString))
                {
                    dbConnection.Open();

                    SqlCommand dbCommand = new SqlCommand();
                    dbCommand = new SqlCommand(xParams["storeProc"].ToString(), dbConnection);
                    dbCommand.CommandType = CommandType.StoredProcedure;

                    foreach (KeyValuePair<string, object> item in iteratePrms)
                    {
                        dbCommand.Parameters.Add(new SqlParameter("@" + item.Key.ToString(), (item.Value.ToString().Trim() == "[0]" ? null : (item.Value.ToString().Trim().Contains("{") ? item.Value.ToString().Trim().Replace(" ", "") : item.Value.ToString().Trim()))));
                    }

                    dbCommand.Parameters.Add(new SqlParameter("@QueryIsCount", "1"));

                    SqlDataAdapter adapter = new SqlDataAdapter(dbCommand);
                    adapter.Fill(tblResults);
                }

                double pageNumbers = Math.Ceiling((Convert.ToDouble(tblResults.Rows[0][0].ToString()) / (Convert.ToDouble(iteratePrms["Size"].ToString()))));

                tblResults = new DataTable();
                using (SqlConnection dbConnection = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings[xParams["conn"].ToString()].ConnectionString))
                {
                    dbConnection.Open();

                    SqlCommand dbCommand = new SqlCommand();
                    dbCommand = new SqlCommand(xParams["storeProc"].ToString(), dbConnection);
                    dbCommand.CommandType = CommandType.StoredProcedure;

                    foreach (KeyValuePair<string, object> item in iteratePrms)
                    {
                        dbCommand.Parameters.Add(new SqlParameter("@" + item.Key.ToString(), (item.Value.ToString().Trim() == "[0]" ? null : item.Value.ToString().Trim())));
                    }

                    dbCommand.Parameters.Add(new SqlParameter("@QueryIsCount", "0"));

                    SqlDataAdapter adapter = new SqlDataAdapter(dbCommand);
                    adapter.Fill(tblResults);
                }

                string tblJSON = serializeTable(tblResults, "row");

                ress = "{\"error\":\"0\",\"pages\":\"" + pageNumbers.ToString() + "\",\"columCount\":\"" + tblResults.Columns.Count.ToString() + "\"," + tblJSON + "}";
            }
            catch (Exception ex)
            {
                ress = "{\"error\":\"1\",\"errorCode\":" + jss.Serialize(ex.Message.ToString()) + "}";
            }

            HttpContext.Current.Response.ContentType = "application/json";
            HttpContext.Current.Response.Write(ress);
        }

        public string serializeTable(DataTable tb, string rowCaption)
        {
            var jss = new JavaScriptSerializer { MaxJsonLength = Int32.MaxValue, RecursionLimit = 100 };

            if (tb.Rows.Count > 0)
            {
                var rowsx = new List<Object>();

                if (rowCaption == "col")
                {
                    var rowDataCols = new Dictionary<string, object>();
                    for (int j = 0; j < tb.Columns.Count; j++)
                    {
                        rowDataCols[j.ToString()] = tb.Columns[j].ToString();
                    }
                    rowsx.Add(rowDataCols);
                }
                else
                {
                    for (int i = 0; i < tb.Rows.Count; i++)
                    {
                        var rowData = new Dictionary<string, object>();
                        for (int j = 0; j < tb.Columns.Count; j++)
                        {
                            rowData[j.ToString()] = tb.Rows[i][j].ToString().Replace("\r", @"\r").Replace("\n", @"\n").Trim();
                        }
                        rowsx.Add(rowData);
                    }
                }

                //string RowsX = jss.Serialize(new { rowsReplcMeHererrer = rowsx });
                Dynamic d = new Dynamic();
                d = d.Add(rowCaption, rowsx);

                string RowsX = jss.Serialize(d);
                RowsX = RowsX.Substring(1);
                RowsX = RowsX.Substring(0, RowsX.Length - 1);
                return RowsX; //.Replace("rowsReplcMeHererrer", rowCaption);
            }
            else
            {
                return " \"" + rowCaption + "\": [] ";
            }
        }

        public void StreamExcelorWordFile()
        {
            string tableName = HttpContext.Current.Request.QueryString["fileName"].ToString();
            string extensions = HttpContext.Current.Request.QueryString["extension"].ToString();

            //HttpContext.Current.Response.ContentType = "application/force-download";

            string appType = "force-download";
            if (extensions == "xls")
            {
                appType = "vnd.ms-excel";
            }
            else if (extensions == "doc")
            {
                appType = "vnd.ms-word";
            }

            HttpContext.Current.Response.ContentType = "application/" + appType;
            HttpContext.Current.Response.AddHeader("Content-Disposition", "attachment;filename=" + tableName + "." + extensions);

            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            sb.Append(".prncFltrStyle{border-collapse: collapse;margin-left: auto;margin-right: auto;font-family:Arial;font-size:small;background-color:white;}");
            sb.Append(".prncFltrStyle th{font-weight: bold;padding: 8px;background: black;color: white;border: 1px solid #525252;}");
            sb.Append(".prncFltrStyle td{text-align: left;padding: 4px;color: black;border: 1px solid black;}");
            sb.Append(".prncFltrStyle tr:hover td{background-color: #EAEAEA;color: #B77D00;}");

            HttpContext.Current.Response.Write("<html><head><meta charset='utf-8' /><style type='text/css'>" + sb.ToString() + "</style></head>" + HttpContext.Current.Request.Form["exportdata"] + "</html>");
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}