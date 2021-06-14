//////////////////////////////////////////////////////////
//          Page used for executing functions           //
//////////////////////////////////////////////////////////

// Use `${code here}` to print out code variables in a string

function main() {
  // cf = new Course("344424167847");
  // cf.announce("hi");
  // deleteTriggerbyUrl("https://docs.google.com/forms/d/1oYjM-UeVPAHwcLfh82eIJ7pBIFApa3EmIEFNP9EIjIs/edit");
  // createQuizTrigger("https://docs.google.com/forms/d/1oYjM-UeVPAHwcLfh82eIJ7pBIFApa3EmIEFNP9EIjIs/edit");
  //  cf = new Course("248342211449");
  //  cf.inviteStudents("1gNOamuzsf5hoX-eeV_TqNo5shhV_oFvEpwjVKgjiyOg");
  // Logger.log(getTriggers());
  // Logger.log(Classroom.Courses.list().courses.map(course => `${course.name} : ${course.id}`));
  //  Logger.log(getTrigger('https://docs.google.com/forms/d/1I_Oif7HcAvEFngJ9yOGXA5CSJeSY46ifYSIJbIlvuWk/edit'));
  // Logger.log(cf.getQuizzes());
  // cf.createCoursework());
  // var courseid = Classroom.Courses.list().courses.map(course => `${course.id}`);
  // for (var i in courseid){
  //   cf = new Course(courseid[i]);
  //   Logger.log(cf.getCourseworkIds().map(coursework => `${coursework[1]}`));
  // }
  Logger.log(Classroom.Courses.list().courses.map(course => `${course.name} : ${course.id}`));
    // cf = new Course("352973399463");
    // for (var i=0; i<4; i++){
    //   cf.createCourseworkMaterial();
    //   cf.createCoursework();
    // }
}

function exportGrades(courseName, courseId, sheetId) {
  var sheet = new Spreadsheet("1b6iK9FUPSNxlEGCka4RqWTruU9YCTfpgmwwB90_S17I");
  // Logger.log(sheet.getSheetNames());
  
  // cf = new Course("249375138269");

  // var grades = cf.getGrades();
  // grades.sort(compare);
  // Logger.log(grades);

  var grades = [["Student Name", 'OT(S) Quiz 3', 'OT(S) Quiz 2', 'reflection for all NSF', 'Reflection for Jeremy', 'Reflection for Yichao', 'OT(S) Quiz 1', 'Total%'], ['Buck Ruizhe', 11.0, 15.0, , , , 28.0, 52.73477812177503], ['Ryan Wong', 11.0, 14.0, , , , 24.0, 48.76160990712074], ['elsen ns', 13.0, 14.0, , , , 12.0, 43.27141382868937], ['Han Ruobin', 9.0, 14.0, , , , 20.0, 43.27141382868937], ['Chee Hin', 8.0, 13.0, , , , 23.0, 42.729618163054695], ['Rayson Chia', 10.0, 12.0, , , , 14.0, 38.07017543859648], ['Xavier Ting', 6.0, 15.0, , , , 15.0, 36.95046439628483], ['Homosexual Toaster', 8.0, 12.0, , , , 15.0, 36.01135190918472], ['Anon Pieces', 7.0, 12.0, , , , 16.0, 35.3250773993808], ['Wong 20', 8.0, 13.0, , , , 12.0, 35.18059855521155], ['Yap Zhi Heng', 10.0, 10.0, , , , 12.0, 34.241486068111456], ['Matthew Ng', 7.0, 9.0, , , , 9.0, 26.83694530443756], ['Yew Jin', 5.0, 8.0, , , , 14.0, 26.29514963880289], ['John Chiang', , , , , , 15.0, 10.294117647058822], ['Ruitao', , , , , , 13.0, 8.921568627450977], ['Yichao Chin', , , , , , 13.0, 8.921568627450977], ['Ryan Loh', , , , , , 13.0, 8.921568627450977], ['Jeremy -', , , , , , 12.0, 8.235294117647058], ['Kenji T', , , , , , 12.0, 8.235294117647058], ['Lucas Cham', , , , , , , 0.0], ['Miguel Antonio', , , , , , , 0.0], ['Dewlei gg', , , , , , , 0.0], ['Ryan Teo', , , , , , , 0.0], ['Ethan Wong', , , , , , , 0.0], ['test chan 2', , , , , , , 0.0]];

  var leaderboard = generateLeaderboard(grades);
  Logger.log(leaderboard);
  cf = new Course("344424167847");
  cf.announce(leaderboard);

  Logger.log(TRIGGERS_ACTIVE);


  // sheet.updateSheet(grades, "OT (S)");

  // cf = new Course("344424167847");

  // var grades = cf.getGrades();
  // Logger.log(grades);

  // sheet.updateSheet(grades, "Safety (cdwf)");
  // var courseId = "187196932450";
  // var sheetId = "1i_jD1Q1jFDrd5oIHyQGhf4AezaCM1i0mHUgDJhXJaTU";
  // var course = new Course(courseId);
  // var sheet = new Spreadsheet(sheetId);
  // var sheetNames = sheet.getSheetNames();
  // for (var i in sheetNames) {
  //   var grades = sheet.getGrades(sheetNames[i]);
  //   if (grades) {} else {continue;}
  //   var courseworkId = course.processCourseworkName(sheetNames[i]);
  //   for (var j in grades) {
  //     if (grades[j][0]) {} else {continue;}
  //     var userId = course.processEmail(grades[j][0]);
  //     if (userId) {} else {continue;}
  //     console.log(userId);
  //     course.setGrade_(courseworkId, userId, grades[j][1]);
  //   }
  // }
}

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}