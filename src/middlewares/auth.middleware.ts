import { NextFunction, Request, Response } from 'express'
import { decodeToken } from '../auth/auth.service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.access_token
        if (!token) throw new Error('MISSING_TOKEN')

        req.authData = decodeToken(token)

        const user = await prisma.user.findUnique({
            where: { id: req.authData!.id },
            select: { id: true }
        })

        if (!user) throw new Error('USER_NOT_FOUND')

        next()

    } catch (error: any) {
        res.clearCookie("access_token", {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
        switch (error.message) {
            case 'USER_NOT_FOUND':
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não encontrado. tente relogar no sistema.'
                })
            case 'MISSING_TOKEN':
            case 'INVALID_TOKEN':
                return res.status(401).json({
                    success: false,
                    message: 'É necessário estar logado para acessar.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao verificar sua identidade. Faça login novamente.' 
                })
        }
    }
}

export const verifyPermission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers['required-permissions']) return next()

        const id = req.authData!.id
        const user = await prisma.user.findUnique({ 
            where: { id },
            select: { permissions: true }
        })
        
        if (!user) throw new Error('USER_NOT_FOUND')

        const requiredPermission = !Array.isArray(req.headers['required-permissions']) ? [req.headers['required-permissions']] : req.headers['required-permissions']

        for (const permission of requiredPermission) {
            const parsedPermission: number = parseInt(permission)
            if (isNaN(parsedPermission)) throw new Error('INVALID_PARAMETER')

            if (!((user.permissions & parsedPermission) == parsedPermission))
                throw new Error('INSUFFICIENT_PERMISSION')
        }

        next()
        
    } catch (error: any) {
        switch (error.message) {
            case 'USER_NOT_FOUND':
                res.clearCookie("access_token", {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true
                })
                return res.status(401).json({
                    success: false,
                    message: 'Login inválido. Tente logar novamente.'
                })
            case 'INSUFFICIENT_PERMISSION':
                return res.status(401).json({
                    success: false,
                    message: 'Você não tem permissão para acessar este recurso.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao verificar sua identidade. Faça login novamente.'
                })
        }
    }
}
