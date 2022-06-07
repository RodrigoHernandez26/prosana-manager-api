import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { comparePassword, generateToken } from "../auth/auth.service";

const prisma = new PrismaClient()

export const login = async (req: Request, res: Response) => {
    try {
        const requiredFields = ['email', 'password']
    
        for (const keys of requiredFields) {
            if (!req.body[keys]) 
                throw new Error('MISSING_FIELDS')
        }
    
        const { email, password } = req.body

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true }
        })

        if (!user) throw new Error('USER_NOT_FOUND')
        if (!comparePassword(user.password, password)) throw new Error('INVALID_PASSWORD')

        const token = generateToken({ id: user.id })

        return res
            .cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            })
            .status(200)
            .json({
                success: true,
                message: 'Login realizado com sucesso!',
            })

    } catch (error: any) {
        res.clearCookie("access_token")
        switch (error.message) {
            case 'MISSING_FIELDS':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário preencher todos os campos.'
                })
            case 'USER_NOT_FOUND':
            case 'INVALID_PASSWORD':
                return res.status(401).json({
                    success: false,
                    message: 'Login inválido. Certifique-se que o email e a senha estão corretos.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao fazer login. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }

}