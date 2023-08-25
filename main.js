const fs = require('fs');
const jsonschema = require('jsonschema');
const schema = require('./schema.json');
const core = require('@actions/core');
const github = require('@actions/github');

const discussionTitle = github.context.payload.discussion.title;
const discussionLabels = github.context.payload.discussion.labels ? github.context.payload.discussion.labels.map(label => label.name) : [];
const discussionBody = github.context.payload.discussion.body;

const promptJson = {
  Title: discussionTitle,
  Labels: discussionLabels,
  Body: discussionBody
};

console.log('Constructed prompt JSON:\n', JSON.stringify(promptJson, null, 2));

const promptJsonString = JSON.stringify(promptJson, null, 2);

const validationResult = jsonschema.validate(promptJson, schema);
if (validationResult.valid) {
  console.log('Generated prompt JSON is valid.');
  fs.writeFileSync('prompt.json', promptJsonString);
} else {
  console.log('Generated prompt JSON is invalid.');
  console.log('Validation errors:', validationResult.errors);
}
