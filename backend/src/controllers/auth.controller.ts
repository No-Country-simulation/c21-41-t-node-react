import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.users.create({
        data: { email, password: hashedPassword },
    })

    res.json({ user })
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body
    const user = await prisma.users.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: 'Invalid credentials' })
        return
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' }),

        res.json({ token })
}
