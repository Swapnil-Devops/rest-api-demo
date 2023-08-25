import fs from 'fs';
import * as jsonschema from 'jsonschema';
import schema from './schema.json' assert { type: 'json' };
import core from '@actions/core';
import github from '@actions/github';

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