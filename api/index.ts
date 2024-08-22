import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateToken, verifyToken } from './auth';
import { getUserInfo, updateUserProfile } from './user';
import { getLeaderboard } from './leaderboard';
import { handleWebhook } from './webhooks';

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, body, headers, query, path } = req;

  try {
    if (method === 'POST') {
      switch (path) {
        case '/api/login':
          const { username, password } = body;
          const loginData = await generateToken(username); // Assuming `generateToken` uses the username for authentication
          return res.status(200).json({ error: false, payload: loginData });

        case '/api/start-game':
          const startGameData = await startGame(headers.authorization!);
          return res.status(200).json({ error: false, payload: startGameData });

        case '/api/submit-answer':
          const { gameId, answer } = body;
          const submitData = await submitAnswer(headers.authorization!, gameId, answer);
          return res.status(200).json({ error: false, payload: submitData });

        case '/api/end-game':
          const endGameData = await endGame(headers.authorization!, query.gameId as string);
          return res.status(200).json({ error: false, payload: endGameData });

        case '/api/update-profile':
          const updateData = await updateUserProfile(headers.authorization!, body);
          return res.status(200).json({ error: false, payload: updateData });

        case '/api/webhook':
          await handleWebhook(body);
          return res.status(200).json({ error: false, payload: { success: true } });

        default:
          return res.status(404).json({ error: true, payload: null });
      }
    } else if (method === 'GET') {
      switch (path) {
        case '/api/user-info':
          const userInfo = await getUserInfo(headers.authorization!);
          return res.status(200).json({ error: false, payload: userInfo });

        case '/api/leaderboard':
          const leaderboardData = await getLeaderboard();
          return res.status(200).json({ error: false, payload: leaderboardData });

        default:
          return res.status(404).json({ error: true, payload: null });
      }
    } else {
      return res.status(405).json({ error: true, payload: null });
    }
  } catch (error) {
    return res.status(500).json({ error: true, payload: null });
  }
};