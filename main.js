const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");

try {
  const discussionTitle = github.context.payload.discussion.title;
  const discussionNum = github.context.payload.discussion.number;
  const discussionNodeId = github.context.payload.discussion.node_id;
  const discussionBody = github.context.payload.discussion.body;
  const jsonFilePath = core.getInput("json-file");

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

  const octokit = github.getOctokit(core.getInput("PAT"));
  octokit.graphql(query).then((response) => {
    const discussionLabels = response.repository.discussion.labels.nodes.map(
      (node) => node.name
    );

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return;
      }

      const jsonData = JSON.parse(data);
      jsonData.discussionTitle = discussionTitle;
      jsonData.discussionLabels = discussionLabels;
      jsonData.discussionBody = discussionBody;

      fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error("Error writing JSON file:", err);
          return;
        }
        console.log("JSON file updated successfully.");
      });
    });

    core.setOutput("disc_ID", discussionNodeId);
    core.setOutput("disc_body", discussionBody);
    core.setOutput("disc_title", discussionTitle);
    core.setOutput("disc_labels", discussionLabels.join(", "));
  });
} catch (error) {
  core.setFailed(error.message);
}
