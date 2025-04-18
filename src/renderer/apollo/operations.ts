import { gql } from '@apollo/client';

// Projects
export const LIST_PROJECTS = gql`
  query ListProjects {
    projects @rest(type: "[Project]", path: "projects") {
      id
      name
      description
      created_at
      updated_at
    }
  }
`;

// Workflows
export const LIST_WORKFLOWS = gql`
  query ListWorkflows {
    workflows @rest(type: "[Workflow]", path: "workflows") {
      id
      name
      states {
        id
        name
        type
        position
      }
      created_at
      updated_at
    }
  }
`;

// Validate token - we'll attempt to fetch members as a validation check
export const VALIDATE_TOKEN = gql`
  query ValidateToken {
    members @rest(type: "[Member]", path: "members?page_size=1") {
      id
      # We only need one field to check if the request succeeded
    }
  }
`;

// Epic operations
export const CREATE_EPIC = gql`
  mutation CreateEpic($epic: EpicInput!) {
    createEpic(input: $epic) 
      @rest(type: "Epic", path: "epics", method: "POST") {
      id
      name
      description
      state
      project_id
      created_at
      updated_at
    }
  }
`;

export const GET_EPIC = gql`
  query GetEpic($epicId: ID!) {
    epic(id: $epicId) @rest(type: "Epic", path: "epics/:epicId") {
      id
      name
      description
      state
      project_id
      created_at
      updated_at
    }
  }
`;

// Story operations
export const CREATE_STORY = gql`
  mutation CreateStory($story: StoryInput!) {
    createStory(input: $story) 
      @rest(type: "Story", path: "stories", method: "POST") {
      id
      name
      description
      story_type
      workflow_state_id
      epic_id
      created_at
      updated_at
    }
  }
`;

export const GET_STORY = gql`
  query GetStory($storyId: ID!) {
    story(id: $storyId) @rest(type: "Story", path: "stories/:storyId") {
      id
      name
      description
      story_type
      workflow_state_id
      epic_id
      estimate
      created_at
      updated_at
    }
  }
`;

// Function to combine the epic and stories creation
// This is not a GraphQL operation but a utility function to orchestrate the API calls
export const createEpicWithStories = async (
  client: any,
  epicData: {
    name: string;
    description?: string;
    state: string;
    project_id: number;
  },
  stories: Array<{
    name: string;
    description?: string;
    story_type: string;
    workflow_state_id: number;
    estimate?: number;
    labels?: Array<{name: string}>;
  }>
) => {
  // First create the epic
  const epicResult = await client.mutate({
    mutation: CREATE_EPIC,
    variables: { epic: epicData }
  });
  
  const epicId = epicResult.data.createEpic.id;
  
  // Then create all stories linked to the epic
  const storyPromises = stories.map(storyData => 
    client.mutate({
      mutation: CREATE_STORY,
      variables: { 
        story: {
          ...storyData,
          epic_id: epicId
        }
      }
    })
  );
  
  const storyResults = await Promise.all(storyPromises);
  const storyIds = storyResults.map(result => result.data.createStory.id);
  
  return {
    epicId,
    storyIds
  };
};
