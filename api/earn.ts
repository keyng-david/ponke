import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from './auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Function to fetch available tasks and user level
export const getEarnTasks = async (token: string) => {
  const decoded = verifyToken(token);
  const userId = decoded.user_id;

  // Fetch tasks data
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, name, description, reward, reward1, reward2, reward3, reward_symbol, end_time, total_clicks, link, image_link, task_list');

  if (tasksError) {
    throw new Error('Failed to retrieve tasks data');
  }

  // Fetch user level
  const { data: userLevelData, error: userLevelError } = await supabase
    .from('user_levels')
    .select('level')
    .eq('user_id', userId)
    .single();

  if (userLevelError) {
    throw new Error('Failed to retrieve user level');
  }

  return {
    tasks,
    user_level: userLevelData.level
  };
};

// Function to complete a task
export const completeTask = async (token: string, taskId: number) => {
  const decoded = verifyToken(token);
  const userId = decoded.user_id;

  // Check if the user has already completed this task
  const { data: existingCompletion, error: completionError } = await supabase
    .from('task_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .single();

  if (completionError) {
    throw new Error('Failed to check task completion status');
  }

  if (existingCompletion) {
    throw new Error('Task already completed');
  }

  // Fetch task details
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, reward, user_level_required')
    .eq('id', taskId)
    .single();

  if (taskError || !task) {
    throw new Error('Task not found');
  }

  // Fetch user details (e.g., level)
  const { data: user, error: userError } = await supabase
    .from('user_levels')
    .select('level')
    .eq('user_id', userId)
    .single();

  if (userError || !user) {
    throw new Error('Failed to retrieve user data');
  }

  // Check if the user meets the required level
  if (user.level < task.user_level_required) {
    throw new Error('User does not meet the required level');
  }

  // Mark the task as completed
  const { error: insertError } = await supabase
    .from('task_completions')
    .insert([{ user_id: userId, task_id: taskId, completed_at: new Date() }]);

  if (insertError) {
    throw new Error('Failed to complete task');
  }

  // Update user's points or other rewards based on task completion
  const { data: updatedUser, error: updateError } = await supabase
    .from('user_points')
    .update({ points: user.points + task.reward }) // Assuming 'points' is a field in 'user_points' table
    .eq('user_id', userId)
    .single();

  if (updateError || !updatedUser) {
    throw new Error('Failed to update user points');
  }

  return {
    success: true,
    message: 'Task completed and reward granted',
    updatedPoints: updatedUser.points
  };
};

// Example Vercel API handler for task completion
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { token, taskId } = req.body;

    if (!token || !taskId) {
      return res.status(400).json({ error: 'Missing token or taskId' });
    }

    const response = await completeTask(token, taskId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}