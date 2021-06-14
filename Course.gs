////////////////////////////////////////////////////////////////////////////////////////
// Course Class for interacting with the course through the Google classroom api
////////////////////////////////////////////////////////////////////////////////////////

class Course { 
  ////////////////////////////////////////////////////////////
  // Constructor
  ////////////////////////////////////////////////////////////
  constructor(courseId) {
    this.courseId = courseId;
    this.courseworks = Classroom.Courses.CourseWork.list(this.courseId).courseWork;
    this.courseworkMaterials = Classroom.Courses.CourseWorkMaterials.list(this.courseId).courseWorkMaterial;
  }
  
  ////////////////////////////////////////////////////////////
  // Returns list of student Ids & Names
  ////////////////////////////////////////////////////////////
  getStudentIds(){
    return Classroom.Courses.Students.list(this.courseId).students.map(students => {return `${students.profile.name.fullName} : ${students.userId}`;});
  }
  
  ////////////////////////////////////////////////////////////
  // Returns list of topic Ids & Names
  ////////////////////////////////////////////////////////////
  getTopicIds(){
    return Classroom.Courses.Topics.list(this.courseId).topic.map(topic => {return [topic.topicId, topic.name];});
  }
  
  ////////////////////////////////////////////////////////////
  // Returns list of coursework Ids & Names
  ////////////////////////////////////////////////////////////
  getCourseworkIds(){
    return this.courseworks.map(coursework => {return [coursework.id, coursework.title, coursework.state];});
  }
  
  ////////////////////////////////////////////////////////////
  // Returns list of courseworkMaterials Ids & Names
  ////////////////////////////////////////////////////////////
  getCourseworkMaterialsIds(){
    return this.courseworkMaterials.map(courseworkMaterial => {return [courseworkMaterial.id, courseworkMaterial.title];
    })
  }
  
  ////////////////////////////////////////////////////////////
  // Returns all the classworks of a particular topic
  // 
  // Classworks split into the two categories:
  // Classroom.Courses.CourseWorkMaterials - slides/lesson
  // Classroom.Courses.CourseWork - assignments/quizzes
  ////////////////////////////////////////////////////////////
  getTopicCourseworks(topicName) {
    var topicId = this.processTopicName(topicName);
    var materials = Classroom.Courses.CourseWorkMaterials.list(this.courseId).courseWorkMaterial;
    var allCourseworks = materials.concat(this.courseworks);
    return allCourseworks
      .filter(coursework => coursework.topicId == topicId)
      .map(coursework => {
        return {
          "courseworkId":coursework.id,
          "courseworkType":this.getCourseworkType(coursework)};
      });
  }
  
  ////////////////////////////////////////////////////////////
  // Returns the coursework type (Material / Coursework)
  ////////////////////////////////////////////////////////////
  getCourseworkType(coursework) {
    // Only courseworks have the 'maxPoints' property
    if (coursework.maxPoints) {return "coursework"}
    else {return "material"}
  }
  
  ////////////////////////////////////////////////////////////
  // Returns student grade for a coursework
  //
  // param {string} : courseworkId - ID of coursework item. 
  // param {string} : userId - ID of user.
  ////////////////////////////////////////////////////////////
  getGrade(userId, courseworkId) {
    try {
      var submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(
        this.courseId, 
        courseworkId, 
        {
          "userId":userId
        }
      ).studentSubmissions 
      return submissions.reverse()[0].assignedGrade; // gets the most recent submission
    } catch(e) {
      Logger.log(e);
      return;
    }
  }
  
  ////////////////////////////////////////////////////////////
  // Returns the maximum grade for a coursework
  //
  // param {string} : courseworkId - ID of coursework item. 
  ////////////////////////////////////////////////////////////
  getMaxGrade(courseworkId) {
    return Classroom.Courses.CourseWork.get(this.courseId, courseworkId).maxPoints;
  }

  ////////////////////////////////////////////////////////////
  // Returns all student grades for all courseworks
  // Resultant Value will be in a nested array format so as to 
  // allow easy import into spreadsheets
  ////////////////////////////////////////////////////////////
  getGrades() {
    try {
      var studentIds = this.getStudentIds().map(studentId => {return [studentId.split(" : ")[1], studentId.split(" : ")[0]];});
      var courseworkIds = this.getCourseworkIds().map(courseworkId => {return [courseworkId[0], courseworkId[1]];});
      var result = [];
      
      // Adding the headers for the excel sheet
      var headers = ["Student Name"];
      for (var i in courseworkIds) {
        headers.push(courseworkIds[i][1]);
      }
      headers.push("Total%");
      result.push(headers);


      // Getting the results from the classrooms and appending to array
      for (var i in studentIds) {
        var row = [];
        row.push(studentIds[i][1]);
        for (var j in courseworkIds){
          var grade = this.getGrade(studentIds[i][0], courseworkIds[j][0]);
          if (!grade) {grade=""}
          row.push(grade);
        }
        row.push(this.getOverallGrade(row, headers));
        result.push(row);
      }
     return result;
    } catch(e) {
      return;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Gets an array of grades obtained by the student and outputs the Overall grade
  //
  // param {array} : gradeArray - student grades, with the first element being the name of the student
  // param {array} : headers - names of the coursework names, first element being "Student Name"
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getOverallGrade(gradeArray, headers){
    var reflectionGrade = 0;
    var quizGrade = 0;
    var no_of_quiz = 0;
    var no_of_reflection = 0;
    for (var i=1; i < headers.length-1; i++){
      var regExp = new RegExp("reflection", "gi"); // "i" is for case insensitive
      var courseworkName = headers[i];
      var courseworkId = this.processCourseworkName(courseworkName);
      var maxGrade = this.getMaxGrade(courseworkId);
      var result = regExp.exec(courseworkName);
      if (!gradeArray[i]){
        var grade = 0;
      } else {
        var grade = gradeArray[i] / maxGrade;
      }
      if (result == null){
        quizGrade += grade;
        no_of_quiz += 1;
      } else {
        reflectionGrade += grade;
        no_of_reflection += 1;
      }
    }
    var overallGrade = (quizGrade * 0.7 / no_of_quiz) + (reflectionGrade * 0.3 / no_of_reflection);
    if (!overallGrade) {overallGrade = ""}
    return overallGrade*100;
  }

  announce(message){
    var resource = {
      "text": message
    }
    Classroom.Courses.Announcements.create(resource, this.courseId);
  }
  
  ////////////////////////////////////////////////////////////
  // Invites Student to the course
  ////////////////////////////////////////////////////////////
  inviteStudent(email) {
    var resource =  {
                      "userId": email,
                      "courseId": this.courseId,
                      "role": "STUDENT"
                    }
    Classroom.Invitations.create(resource);
  }
  
  ////////////////////////////////////////////////////////////
  // Adds Student to a particular classwork
  //
  // param {string} : studentId - student IDs
  // param {string} : courseworkId - coursework IDs
  ////////////////////////////////////////////////////////////
  addClassworkStudents(studentId, classwork) {
    if (classwork.courseworkType=="material") {
      this.addCourseworkMaterialStudents(studentId, classwork.courseworkId)
    } else {
      this.addCourseworkStudents(studentId, classwork.courseworkId)
    }
  }
  
  ////////////////////////////////////////////////////////////
  // Adds Student to a particular coursework
  //
  // param {string} : studentId - student IDs
  // param {string} : courseworkId - coursework IDs
  //
  // No error if an existing studentId is added
  ////////////////////////////////////////////////////////////
  addCourseworkStudents(studentId, courseworkId) {
    try {
      var students = [studentId];
      var resource =  {
                      "assigneeMode": "INDIVIDUAL_STUDENTS",
                      "modifyIndividualStudentsOptions": {
                          "addStudentIds": students
                      }
                    }
      Classroom.Courses.CourseWork.modifyAssignees(resource, this.courseId, courseworkId);
    } catch(e) {
      Logger.log(e)
    }
  }
  
  ////////////////////////////////////////////////////////////
  // Adds Student to a particular courseworkMaterial
  //
  // param {string} : studentId - student IDs
  // param {string} : courseworkId - coursework IDs
  ////////////////////////////////////////////////////////////
  addCourseworkMaterialStudents(studentId, courseworkId) {
    try {
      var courseworkMaterial = Classroom.Courses.CourseWorkMaterials.get(this.courseId, courseworkId);
      var studentIds = courseworkMaterial.individualStudentsOptions.studentIds;
      
      // If student is not one of the existing students
      if (studentIds.indexOf(studentId)==-1) {
      
        // Deletes the old material
        Classroom.Courses.CourseWorkMaterials.remove(this.courseId, courseworkId)
        
        // Adds a new one with access to the new student
        var StudentIds = courseworkMaterial.individualStudentsOptions.studentIds;
        studentIds = studentIds.concat([studentId]);
        Logger.log(studentIds);
        courseworkMaterial['individualStudentsOptions']['studentIds'] = studentIds;
        Classroom.Courses.CourseWorkMaterials.create(courseworkMaterial, this.courseId);
      }
    } catch(e) {
      Logger.log(e)
    }
  }
  
  ////////////////////////////////////////////////////////////
  // Creates a New coursework 
  // 
  // This is to ensure that the 'associatedWithDeveloper' flag is set to true
  ////////////////////////////////////////////////////////////
  createCoursework(COURSE_INFO = {
    "assigneeMode": "ALL_STUDENTS",
    "associatedWithDeveloper": true,
    "description": "describe what your assignment is about here.",// <<< UPDATE THIS
    "maxPoints": 40, // <<< UPDATE THIS
    "state": "PUBLISHED",
    "submissionModificationMode": "SUBMISSION_MODIFICATION_MODE_UNSPECIFIED",
    "title": "Unit 2 - External Grade import", // <<< UPDATE THIS
    "workType": "ASSIGNMENT"
  }) {
    var newCourse = Classroom.Courses.CourseWork.create(COURSE_INFO, this.courseId);
    return newCourse.id;
  }
  
  ////////////////////////////////////////////////////////////
  // Creates a New coursework material
  // 
  // This is to ensure that the material can be deleted by the script
  ////////////////////////////////////////////////////////////
  createCourseworkMaterial(COURSE_INFO = {
    "assigneeMode": "ALL_STUDENTS",
    "description": "describe what your assignment is about here.",// <<< UPDATE THIS
    "state": "PUBLISHED",
    "title": "insert title" // <<< UPDATE THIS
  }){
    var newCourseMaterial = Classroom.Courses.CourseWorkMaterials.create(COURSE_INFO, this.courseId);
    return newCourseMaterial.id;
  }

  ////////////////////////////////////////////////////////////
  // Adds grade for the particular student. 
  //
  // param {string} : COURSEWORK_ID - ID of coursework item. 
  // param {string} : USER_ID - ID of user.
  // param {string} : GRADE - users grade.
  ////////////////////////////////////////////////////////////
  setGrade_(COURSEWORK_ID, USER_ID, GRADE){
    try{
      var grades = {  
        'assignedGrade': GRADE,  
        'draftGrade': GRADE  
      } 
      
      const studentSub = Classroom.Courses.CourseWork.StudentSubmissions
      
      let submissionID = studentSub.list(
        this.courseId,
        COURSEWORK_ID,
        {"userId":USER_ID}
      ).studentSubmissions[0].id
      
      studentSub.patch(
        grades,
        this.courseId,
        COURSEWORK_ID,
        submissionID,
        {
          "updateMask":"assignedGrade,draftGrade"  
        }
      );
      var resource = {};
      Classroom.Courses.CourseWork.StudentSubmissions.return(resource, this.courseId, COURSEWORK_ID, submissionID)
    } catch(e){
      console.error(e);
      console.log(`${USER_ID} could not be found and was not uploaded.`);
    }
  };

  ////////////////////////////////////////////////////////////
  //                  Helper functions                      //
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  // Correlates emails to userIds
  ////////////////////////////////////////////////////////////
  processEmail(email) {
    try {
      return Classroom.Courses.Students.get(this.courseId, email).userId;
    } catch(e) {
      return;
    }
  }
  
  ////////////////////////////////////////////////////////////
  // Correlates courseworkname to courseworkIds
  ////////////////////////////////////////////////////////////
  processCourseworkName(courseworkName) {
    var courseworkDetails = this.getCourseworkIds();
    for (var i in courseworkDetails) {
      if (courseworkDetails[i][1] == courseworkName) {return courseworkDetails[i][0];}
    }
  }
  
  processTopicName(topicName) {
    var topicDetails = this.getTopicIds();
    for (var i in topicDetails) {
      if (topicDetails[i][1] == topicName) {return topicDetails[i][0];}
    }
    return;
  }
}