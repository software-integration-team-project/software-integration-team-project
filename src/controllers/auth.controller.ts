import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import userModel from '../models/userModel';

const signup = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        res.status(400).json({ error: 'missing information' });
        return;
    }

    const hash = bcrypt.hashSync(password, 10);

    try {
        const User = new userModel({
            email, // equivalent of writing email: email
            username,
            password: hash,
        });
        const user = await User.save();
        res.status(200).json(user);
    } catch {
        res.status(500).json({ message: 'failed to save user' });
    }
};

const signin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'missing information' });
        return;
    }

    try {
        const user = await userModel.findOne({ email: email });

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        if (!bcrypt.compareSync(password, user.password)) {
            res.status(400).json({ message: "Email or password don't match" });
            return;
        }

        req.session.user = {
            _id: user._id as unknown as string,
            email: user.email,
            username: user.username,
        };

        const token = jwt.sign(
            { user: { id: user._id, email: user.email } },
            process.env.JWT_SECRET_KEY as string,
            {
                expiresIn: '1h',
            },
        );

        res.status(200).json({ token });
    } catch {
        res.status(500).json({ error: 'Failed to get user' });
    }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
    if (!req.session.user) {
        res.status(500).json({ error: 'You are not authenticated' });
        return;
    }

    try {
        const user = await userModel
            .findById(req.session.user._id, {
                password: 0,
            })
            .populate('messages');

        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch {
        res.status(500).json({ error: 'Failed to get user' });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    if (req.session.user) {
        delete req.session.user;
    }

    res.status(200).json({ message: 'Disconnected' });
};

export default {
    signup,
    signin,
    getUser,
    logout,
};
