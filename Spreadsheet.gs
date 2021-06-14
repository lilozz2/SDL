//////////////////////////////////////////////////////////
//                Spreadsheet code                      //
//////////////////////////////////////////////////////////

class Spreadsheet {
  ////////////////////////////////////////////////////////////
  // Constructor
  ////////////////////////////////////////////////////////////
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
  }
  
  ////////////////////////////////////////////////////////////
  // Returns as a list [email, score]
  ////////////////////////////////////////////////////////////
  getGrades(sheetName) {
    const ss = SpreadsheetApp.openById(this.spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    try{
      // const range = sheet.getRange(2,1,sheet.getLastRow()-1,3); // <<< Original
      const range = sheet.getRange(2,2,sheet.getLastRow()-1,2);
      const values = range.getValues();
   
      return values;
    } catch(e) {
      return "";
    }
  }
  
  getSheetNames() {
    return Sheets.Spreadsheets.get(this.spreadsheetId).sheets.map(sheet => {return `${sheet.properties.title}:${sheet.properties.sheetId}`;})
  }

  getSheetId(sheetName) {
    var sheetNames = this.getSheetNames();
    for (var i in sheetNames){
      var tmp = sheetNames[i].split(":");
      if (tmp[0] == sheetName){
        return tmp[1];
      }
    }
  }

  updateSheet(values, sheetName){
    var resource = {
      "majorDimension": "ROWS",
      "values": values
    }
    var range = this.getRange(values, sheetName);
    Sheets.Spreadsheets.Values.update(resource, this.spreadsheetId, range, {valueInputOption: "RAW"});
    
  }

  getRange(values, sheetName) {
    var no_of_rows = values.length;
    var no_of_columns = values[0].length;
    Logger.log(no_of_rows);
    Logger.log(no_of_columns);
    return (sheetName + "!A1:" + String.fromCharCode(64+no_of_columns) + no_of_rows.toString());
  }

  toGridRange(range){
    var myRegexp = /(?:^|\s)(.*?)!([A-Z])\d*:([A-Z])\d*(?:\s|$)/g;
    var match = myRegexp.exec(range);
    var gridRange = {
      "sheetId": this.getSheetId(match[1]),
      "startColumnIndex": match[2].charCodeAt(0)-64,
      "endColumnIndex": match[3].charCodeAt(0)-64
    }
    return gridRange;
  }
}