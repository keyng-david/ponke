import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from './auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

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

  // Fetch user level (assuming user level is stored in a `user_levels` table)
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

export const completeTask = async (token: string, taskId: number) => {
  const decoded = verifyToken(token);
  const userId = decoded.user_id;

  // Mark the task as completed for the user
  const { error } = await supabase
    .from('task_completions')
    .insert([{ user_id: userId, task_id: taskId, completed_at: new Date() }]);

  if (error) {
    throw new Error('Failed to complete task');
  }

  return { success: true };
};