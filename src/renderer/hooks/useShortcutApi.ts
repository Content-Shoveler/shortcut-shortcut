import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setApiToken } from '../utils/electronApi';
import { 
  LIST_PROJECTS, 
  LIST_WORKFLOWS, 
  VALIDATE_TOKEN,
  CREATE_EPIC,
  CREATE_STORY,
  createEpicWithStories as createEpicWithStoriesUtil
} from '../apollo/operations';
import { 
  ShortcutProject, 
  ShortcutWorkflow,
  EpicCreateParams,
  StoryCreateParams,
  CreateEpicWithStoriesResult
} from '../types/shortcutApi';

// Custom error type for API errors
export class ShortcutApiError extends Error {
  constructor(
    message: string,
    public originalError: ApolloError | Error | unknown
  ) {
    super(message);
    this.name = 'ShortcutApiError';
  }
}

// Projects hook
export function useProjects() {
  const { loading, error, data, refetch } = useQuery(LIST_PROJECTS, {
    fetchPolicy: 'network-only', // Don't use cache for projects
  });
  
  return {
    projects: (data?.projects || []) as ShortcutProject[],
    loading,
    error,
    refetch,
  };
}

// Workflows hook
export function useWorkflows() {
  const { loading, error, data, refetch } = useQuery(LIST_WORKFLOWS, {
    fetchPolicy: 'network-only', // Don't use cache for workflows
  });
  
  return {
    workflows: (data?.workflows || []) as ShortcutWorkflow[],
    loading,
    error,
    refetch,
  };
}

// Token validation hook
export function useValidateToken() {
  const [validateTokenMutation, { loading }] = useMutation(VALIDATE_TOKEN);
  
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // First save the token
      await setApiToken(token);
      
      // Then try to validate with an API call
      await validateTokenMutation();
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };
  
  return { validateToken, loading };
}

// Epic creation hook
export function useCreateEpic() {
  const [createEpicMutation, { loading }] = useMutation(CREATE_EPIC);
  
  const createEpic = async (epicData: EpicCreateParams) => {
    try {
      const result = await createEpicMutation({
        variables: { epic: epicData }
      });
      
      return result.data.createEpic;
    } catch (error) {
      throw new ShortcutApiError('Failed to create epic', error);
    }
  };
  
  return { createEpic, loading };
}

// Story creation hook
export function useCreateStory() {
  const [createStoryMutation, { loading }] = useMutation(CREATE_STORY);
  
  const createStory = async (storyData: StoryCreateParams) => {
    try {
      const result = await createStoryMutation({
        variables: { story: storyData }
      });
      
      return result.data.createStory;
    } catch (error) {
      throw new ShortcutApiError('Failed to create story', error);
    }
  };
  
  return { createStory, loading };
}

// Combined epic + stories creation hook
export function useCreateEpicWithStories() {
  const apolloClient = useApolloClient();
  const { createEpic, loading: creatingEpic } = useCreateEpic();
  const { createStory, loading: creatingStory } = useCreateStory();
  
  const createEpicWithStories = async (
    epicData: EpicCreateParams,
    stories: StoryCreateParams[]
  ): Promise<CreateEpicWithStoriesResult> => {
    try {
      return await createEpicWithStoriesUtil(
        apolloClient,
        epicData,
        stories
      );
    } catch (error) {
      throw new ShortcutApiError('Failed to create epic with stories', error);
    }
  };
  
  return {
    createEpicWithStories,
    loading: creatingEpic || creatingStory,
  };
}
