import { Request, Response, NextFunction } from 'express';
import { runAssistant, ChatMessage } from '../services/assistantService';

export const chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messages: ChatMessage[] = req.body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, message: 'messages array is required' });
      return;
    }
    const reply = await runAssistant(messages);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
};
