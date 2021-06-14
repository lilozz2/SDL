////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Adds a trigger that generates a grade report for the given classroom once every week & announces the top scorers to
// the students of the class
// 
// Remember to implement a way to track the triggers so that you can delete them
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function createResultTrigger(courseIds, spreadsheetId) {
  // var trigger = ScriptApp.newTrigger(triggerFunction)
  //   .timeBased()
  //   .everyWeeks(1)
  //   .create();

  var arguments = {
    "courseId": courseIds,
    "spreadsheetId": spreadsheetId
  };
  setupTriggerArguments(trigger, arguments, true);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ResultsTrigger function called upon submission as specified in the createFormTrigger function
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function resultTrigger(event) {
  var functionArguments = handleTriggered(event.triggerUid);
  var courseIds = functionArguments.courseId;
  var spreadsheetId = functionArguments.spreadsheetId;

  var sheet = new Spreadsheet(spreadsheetId);
  // Logger.log(sheet.getSheetNames());
  
  for (var i in courseIds) {
    var courseId = courseIds[i];
  }

  cf = new Course(courseId);

  var grades = cf.getGrades();
  grades.sort(compare);
  Logger.log(grades);

  sheet.updateSheet(grades, "OT (S)");
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper function used together with the sort() function in the quizTrigger function
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function compare( a, b ) {
  var lastIndex = a.length-1;
  if ( a[lastIndex] > b[lastIndex] ){
    return -1;
  }
  if ( a[lastIndex] < a[lastIndex] ){
    return 1;
  }
  return 0;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generates the Leaderboard given a set of student Grades
// 
// param {array} : grades - student grades, in a excel ready exportable format
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generateLeaderboard(grades) {
  grades.shift();
  var message = "\n\nTop Scorers of the week\n\n";
  var lastindex = grades[0].length-1;
  for (var i=0; i<10; i++){
    message += String.format('{0}.{1}: {2}\n', i+1, grades[i][0], grades[i][lastindex].toFixed(2));
  }
  return message;
}