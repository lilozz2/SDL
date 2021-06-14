////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Code for adding arguments to trigger functions
// https://stackoverflow.com/questions/32697653/how-can-i-pass-a-parameter-to-a-time-based-google-app-script-trigger
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var RECURRING_KEY = "recurring";
var ARGUMENTS_KEY = "arguments";
var TRIGGERS_ACTIVE = getTriggers();

/**
 * Sets up the arguments for the given trigger.
 *
 * @param {Trigger} trigger - The trigger for which the arguments are set up
 * @param {*} functionArguments - The arguments which should be stored for the function call
 * @param {boolean} recurring - Whether the trigger is recurring; if not the 
 *   arguments and the trigger are removed once it called the function
 */
function setupTriggerArguments(trigger, functionArguments, recurring) {
  var triggerUid = trigger.getUniqueId();
  var triggerData = {};
  triggerData[RECURRING_KEY] = recurring;
  triggerData[ARGUMENTS_KEY] = functionArguments;

  PropertiesService.getScriptProperties().setProperty(triggerUid, JSON.stringify(triggerData));
}

/**
 * Function which should be called when a trigger runs a function. Returns the stored arguments 
 * and deletes the properties entry and trigger if it is not recurring.
 *
 * @param {string} triggerUid - The trigger id
 * @return {*} - The arguments stored for this trigger
 */
 
 function handleTriggered(triggerUid) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var triggerData = JSON.parse(scriptProperties.getProperty(triggerUid));

  if (!triggerData[RECURRING_KEY]) {
    deleteTriggerByUid(triggerUid);
  }

  return triggerData[ARGUMENTS_KEY];
}

/**
 * Deletes trigger arguments of the trigger with the given id.
 *
 * @param {string} triggerUid - The trigger id
 */
function deleteTriggerArguments(triggerUid) {
  PropertiesService.getScriptProperties().deleteProperty(triggerUid);
}

/**
 * Deletes a trigger with the given id and its arguments.
 * When no project trigger with the id was found only an error is 
 * logged and the function continues trying to delete the arguments.
 * 
 * @param {string} triggerUid - The trigger id
 */
function deleteTriggerByUid(triggerUid) {
  if (!ScriptApp.getProjectTriggers().some(function (trigger) {
    if (trigger.getUniqueId() === triggerUid) {
      ScriptApp.deleteTrigger(trigger);
      return true;
    }

    return false;
  })) {
    console.error("Could not find trigger with id '%s'", triggerUid);
  }

  deleteTriggerArguments(triggerUid);
}

/**
 * Deletes a trigger and its arguments.
 * 
 * @param {Trigger} trigger - The trigger
 */
function deleteTrigger(trigger) {
  ScriptApp.deleteTrigger(trigger);
  deleteTriggerArguments(trigger.getUniqueId());
}

/**
 * Gets a form trigger based on the url
 * 
 * @param {string} url - The url of the form
 */
function getTrigger(url) {
  var form = FormApp.openByUrl(url);
  var triggers = ScriptApp.getProjectTriggers();
  for (var i in triggers) {
    if (triggers[i].getTriggerSourceId() == form.getId()){
      return triggers[i];
    }
  }
}

/**
 * Deletes a form trigger based on the url
 * 
 * @param {string} url - The url of the form
 */
function deleteTriggerbyUrl(url) {
  var trigger = getTrigger(url);
  deleteTrigger(trigger);
}

/**
 * Gets all form triggers of the current project
 * ----------NEW 10/6/21 Ivan-------------
 * map trigger id to trigger title in a dictionary and return the dictionary
 */
function getTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  
  // NEW
  var trigger_dict = {}

  for (var i in triggers) {
    var form = FormApp.openById(triggers[i].getTriggerSourceId());
    
    //NEW
    trigger_dict[form.getTitle()] = form.getId()
  }
  // Logger.log(trigger_dict);
  // Logger.log(trigger_dict["SF Quiz 2"]);

  //NEW
  return trigger_dict
}