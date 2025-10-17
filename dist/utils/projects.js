export var extractProjectName = (answers, questions) => {
  if (!answers || !questions) {
    return '';
  }
  var preferredKeys = ['projectName', 'project_name', 'nomProjet', 'nom_projet'];
  for (var key of preferredKeys) {
    var value = answers[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  var matchingQuestion = questions.find(question => {
    if (!question || !question.question) {
      return false;
    }
    var text = question.question.toLowerCase();
    return text.includes('nom') && text.includes('projet') && typeof answers[question.id] === 'string' && answers[question.id].trim() !== '';
  });
  if (matchingQuestion) {
    return answers[matchingQuestion.id].trim();
  }
  return '';
};