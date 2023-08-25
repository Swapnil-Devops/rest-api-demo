const fs = require('fs');
const jsonschema = require('jsonschema');
const schema = require('./schema.json');
const core = require('@actions/core');
const github = require('@actions/github');

const discussionTitle = github.context.payload.discussion.title;
const discussionBody = github.context.payload.discussion.body;

const query = `
    query {
      repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
        discussion(number: ${discussionNum}) {
          title
          body
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  `;

  // Make a request to the GitHub GraphQL API using octokit
  const octokit = github.getOctokit(core.getInput("PAT")); // Assuming you pass your repository token as an input

  // Use .graphql instead of .graphql.query for making the request
  octokit.graphql(query).then((response) => {
    // Extract labels from the response
    const discussionLabels = response.repository.discussion.labels.nodes.map(
      (node) => node.name
    );
    console.log("Discussion Labels:", discussionLabels);
    
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
});
