import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { generateToken, hashPassword, comparePassword } from '../utils/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 查询用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    if (!comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成Token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // 返回用户信息（不包含密码）
    const { password_hash, ...userInfo } = user;
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email, nickname } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: '用户名、密码和邮箱不能为空' });
    }

    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(400).json({ error: '邮箱已存在' });
    }

    // 创建用户
    const userId = Date.now().toString();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, username, password_hash, email, nickname, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, passwordHash, email, nickname || null, 'user', now, now);

    // 生成Token
    const token = generateToken({
      userId,
      username,
      role: 'user',
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        nickname: nickname || null,
        email,
        role: 'user',
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT id, username, nickname, email, role, avatar, created_at, updated_at FROM users WHERE id = ?').get(req.user!.userId) as any;

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/auth/profile
 * 更新用户信息
 */
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { nickname, email, avatar } = req.body;
    const userId = req.user!.userId;
    const now = new Date().toISOString();

    // 如果更新邮箱，检查是否已存在
    if (email) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existingEmail) {
        return res.status(400).json({ error: '邮箱已存在' });
      }
    }

    // 更新用户信息
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now, userId);

    db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    // 返回更新后的用户信息
    const user = db.prepare('SELECT id, username, nickname, email, role, avatar, created_at, updated_at FROM users WHERE id = ?').get(userId) as any;

    res.json({ user });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/auth/password
 * 修改密码
 */
router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }

    const userId = req.user!.userId;

    // 获取当前用户
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证旧密码
    if (!comparePassword(oldPassword, user.password_hash)) {
      return res.status(400).json({ error: '旧密码错误' });
    }

    // 更新密码
    const passwordHash = hashPassword(newPassword);
    const now = new Date().toISOString();

    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(passwordHash, now, userId);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




