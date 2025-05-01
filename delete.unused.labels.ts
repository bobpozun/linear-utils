import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
import readline from 'readline';



function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Control dry-run via env var: set DRY_RUN=false to disable dry-run
const DRY_RUN = process.env.DRY_RUN !== 'false';
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const API_URL = 'https://api.linear.app/graphql';

if (!LINEAR_API_KEY) {
  console.error('❌ Missing LINEAR_API_KEY environment variable.');
  process.exit(1);
}
if (!DRY_RUN) {
  console.error('❌ Missing DRY_RUN environment variable. Please set to "true" or "false".');
  process.exit(1);
}

interface Label {
  id: string;
  name: string;
  isGroup: boolean;
  issues: { nodes: { id: string }[] };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface LabelQueryResponse {
  issueLabels: {
    nodes: Label[];
    pageInfo: PageInfo;
  };
}

interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

// Helper to perform GraphQL requests
async function linearQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  if (!LINEAR_API_KEY) {
    throw new Error('Missing LINEAR_API_KEY in environment');
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: LINEAR_API_KEY || '',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors));
  }

  return json.data;
}

// Fetch all labels with pagination
async function getAllLabels(): Promise<Label[]> {
  const labels: Label[] = [];
  let cursor: string | null = null;

  while (true) {
    const query = `
      query ($after: String) {
        issueLabels(first: 100, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            name
            isGroup
            issues(first: 1) { nodes { id } }
          }
        }
      }
    `;
    const data: LabelQueryResponse = await linearQuery<LabelQueryResponse>(query, { after: cursor });
    labels.push(...data.issueLabels.nodes);

    if (!data.issueLabels.pageInfo.hasNextPage) break;
    cursor = data.issueLabels.pageInfo.endCursor;
  }

  return labels;
}

// Delete label (commented out for safety)
// async function deleteLabel(id: string, name: string): Promise<void> {
//   const mutation = `
//     mutation DeleteLabel($id: String!) {
//       labelDelete(id: $id) {
//         success
//       }
//     }
//   `;
//   try {
//     const res = await linearQuery<{ labelDelete: { success: boolean } }>(mutation, { id });
//     if (res.labelDelete.success) {
//       console.log(`✅ Deleted label: ${name}`);
//     } else {
//       console.log(`⚠️ Could not delete label: ${name}`);
//     }
//   } catch (err) {
//     console.error(`❌ Error deleting label ${name}:`, (err as Error).message);
//   }
// }

(async () => {
  try {
    const labels = await getAllLabels();
    const emptyLabels = labels.filter(
      label => label.issues.nodes.length === 0 && !label.isGroup
    );

    if (emptyLabels.length === 0) {
      console.log('✅ No empty labels to delete.');
      return;
    }

    console.log(`🔍 Found ${emptyLabels.length} unused labels:`);
    emptyLabels.forEach(label => console.log(`- ${label.name}`));

    if (DRY_RUN) {
      console.log('\n💡 Dry run enabled — no labels will be deleted.');
    } else {
      // Ask for confirmation before deletion
      const confirmation = await askQuestion('\n🚨 WARNING: this will delete the above labels. Proceed? (y/N) ');
      if (confirmation.trim().toLowerCase() === 'y') {
        console.log('🚀 Proceeding with deletion (still commented out for safety).');
        // for (const label of emptyLabels) {
        //   await deleteLabel(label.id, label.name);
        // }
      } else {
        console.log('❌ Deletion aborted by user.');
        return;
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', (err as Error).message);
  }
})();