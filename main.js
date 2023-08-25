const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
try {
  // const commentBody = github.context.payload.comment.body;
  const discussionTitle = github.context.payload.discussion.title;
  const discussionNum = github.context.payload.discussion.number;
  const discussionNodeId = github.context.payload.discussion.node_id;
  const discussionBody = github.context.payload.discussion.body;
  const jsonFilePath = core.getInput("json-file");

  // console.log(`Comment Body: ${commentBody}`);
  console.log(`Discussion Title: ${discussionTitle}`);
  console.log(`Discussion number: ${discussionNum}`);
  console.log(`Discussion Node ID: ${discussionNodeId}`);
  console.log(`Discussion Body: ${discussionBody}`);

  // Construct the GraphQL query
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

  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }
      
    const jsonData = JSON.parse(data);
      
    jsonData.discussionTitle = discussionTitle;
    jsonData.discussionLabels = discussionLabels;
    jsonData.discussionBody = discussionBody;
      
    fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
        return;
      }
      console.log('JSON file updated successfully.');
    });
  });


    // Set an output for the comment body, discussion ID, discussion body, and labels
    // core.setOutput("comment_body", commentBody);
  core.setOutput("disc_ID", discussionNodeId);
  core.setOutput("disc_body", discussionBody);
  core.setOutput("disc_title",discussionTitle);
  core.setOutput("disc_labels", discussionLabels.join(", "));
  });
} catch (error) {
  core.setFailed(error.message);
}