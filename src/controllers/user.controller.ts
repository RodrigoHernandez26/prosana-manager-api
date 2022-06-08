import { Request, Response } from "express";
import { Prisma, PrismaClient } from '@prisma/client'
import { generateToken, hashPassword } from "../auth/auth.service";
import { createUserSchema, updateUserSchema } from "../schemas/user.schemas";

const prisma = new PrismaClient()

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                permissions: true
            }
        })

        return res.status(200).json({
            success: true,
            users
        })
    } catch (error: any) {
        switch (error.message) {
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido buscar usuários. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.authData!.id },
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                permissions: true
            }
        })
        if (!user) throw new Error('USER_NOT_FOUND')
    
        return res.status(200).json({
            success: true,
            user
        })
    } catch (error: any) {
        res.clearCookie("access_token", {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
        switch (error.message) {
            case 'USER_NOT_FOUND':
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado. tente relogar no sistema.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao obter informações do usuário. Tente relogar no sistema.'
                })
        }
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        req.body = createUserSchema.validateSync(req.body)

        const { password } = req.body
        const hashedPassword = hashPassword(password)

        const user = await prisma.user.create({
            data: {
                ...req.body,
                password: hashedPassword,
                permissions: 0
            }
        })

        const token = generateToken({ id: user.id })

        return res
            .cookie('access_token', token, {
                httpOnly: true
            })
            .status(200)
            .json({
                success: true,
                message: 'Usuário criado com sucesso!',
            })

    } catch (error: any) { 
        switch (error.message) {
            case 'MISSING_NAME':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o nome do usuário.'
                })
            case 'MISSING_CPF':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o CPF do usuário.'
                })
            case 'MISSING_PASSWORD':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar uma senha para o usuário.'
                })
            case 'MISSING_EMAIL':
            case 'INVALID_EMAIL':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar um email válido para o usuário.'
                })
            default:
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    return res.status(400).json({
                        success: false,
                        message: "Email e/ou CPF já cadastrado."
                    })
                }
                
                console.log(error.message) // observabilidade
                return res.status(500).json({
                    success: false,
                    message: "Erro desconhecido ao criar usuário. Por favor, entre em contato com o administrador do sistema."
                })
        }
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        req.body = updateUserSchema.validateSync(req.body)

        if (Object.entries(req.body).length) {
            for (const keys of Object.keys(req.body)) {            
                if (keys === 'password') 
                req.body[keys] = hashPassword(req.body[keys])
            }
    
            const { id, ...updateInfo } = req.body

            await prisma.user.update({
                where: { id: id },
                data: { 
                    ...updateInfo,
                    updatedAt: new Date()
                }
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Usuário atualizado com sucesso!',
        })

    } catch (error: any) {
        switch (error.message) {
            case 'INVALID_EMAIL':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar um email válido para o usuário.'
                })
            case 'MISSING_ID':
            case 'INVALID_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao atualizar o usuário. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    return res.status(400).json({
                        success: false,
                        message: "Email e/ou CPF já cadastrado."
                    })
                }

                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao atualizar usuário. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const updateUserPermissions = async (req: Request, res: Response) => {
    try {
        if (!req.body.targetId) throw new Error('MISSING_TARGET_ID')
        if (!req.body.permissions) throw new Error('MISSING_PERMISSIONS_FIELD')

        req.body.permissions = parseInt(req.body.permissions)
        if (isNaN(req.body.permissions)) throw new Error('INVALID_PERMISSION')

        await prisma.user.update({
            where: { id: req.body.targetId },
            data: { 
                permissions: req.body.permissions,
                updatedAt: new Date()
            }
        })

        return res.status(200).json({
            success: true,
            message: 'Permissões atualizadas com sucesso!',
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_PERMISSIONS_FIELD':
            case 'MISSING_TARGET_ID':
            case 'INVALID_PERMISSION':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao atualizar o usuário. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao atualizar usuário. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) throw new Error('MISSING_ID')

        await prisma.user.delete({
            where: { id: req.body.id }
        })

        return res.status(200).json({
            success: true,
            message: 'Usuário deletado com sucesso!'
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao deletar o usuário. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao deletar usuário. Por favor, entre em contato com o administrador do sistema.'
                })
            }
        }
}
