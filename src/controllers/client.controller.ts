import { Request, Response } from "express";
import { Prisma, PrismaClient } from '@prisma/client'
import { createClientSchema, updateClientSchema } from "../schemas/client.schema";

const prisma = new PrismaClient()

export const getAllClients = async (req: Request, res: Response) => {
    try {
        const clients = await prisma.client.findMany({
            include: { address: true }
        })

        return res.status(200).json({
            success: true,
            clients
        })
    } catch (error: any) {
        switch (error.message) {
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido buscar clientes. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const getClient = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) throw new Error("CLIENT_ID_NOT_FOUND")
        const id = parseInt(req.params.id)
        if (isNaN(id)) throw new Error("INVALID_CLIENT_ID")

        const client = await prisma.client.findUnique({
            where: { id },
            include: { address: true }
        })

        if (!client) throw new Error("CLIENT_NOT_FOUND")

        return res.status(200).json({
            success: true,
            client
        })

    } catch (error: any) {
        switch (error.message) {
            case "CLIENT_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message: "Houve um erro ao buscar o cliente. Por favor, entre em contato com o administrador do sistema."
                })
            case 'CLIENT_ID_NOT_FOUND':
            case 'INVALID_CLIENT_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao buscar o cliente. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao obter informações do cliente. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const createClient = async (req: Request, res: Response) => {
    try {
        req.body = createClientSchema.validateSync(req.body)

        const { address, ...clientInfo } = req.body
        
        const client = await prisma.client.create({
            data: {
                ...clientInfo,
                address: {
                    create: { ...address }
                }
            },
            include: { address: true }
        })

        return res.status(200).json({
            success: true,
            message: 'Cliente criado com sucesso.',
            client
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_NAME':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o nome do cliente.'
                })
            case 'INVALID_EMAIL':
            case 'MISSING_EMAIL':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar um email válido para o cliente.'
                })
            case 'MISSING_CPF':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o CPF do cliente.'
                })
            case 'MISSING_PHONE':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o telefone do cliente.'
                })
            case 'MISSING_ADDRESS':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o endereço do cliente.'
                })
            case 'MISSING_STREET':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar a rua no endereço do cliente.'
                })
            case 'MISSING_NUMBER':
            case 'INVALID_NUMBER':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar um número válido no endereço do cliente.'
                })
            case 'MISSING_NEIGHBORHOOD':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o bairro no endereço do cliente.'
                })
            case 'MISSING_CITY':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar a cidade no endereço do cliente.'
                })
            case 'MISSING_STATE':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o estado no endereço do cliente.'
                })
            case 'MISSING_ZIPCODE':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o CEP no endereço do cliente.'
                })
            case 'MISSING_COUNTRY':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o país no endereço do cliente.'
                })
            default:
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    return res.status(400).json({
                        success: false,
                        message: "Email e/ou CPF já cadastrado."
                    })
                }
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao criar o cliente. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const updateClient = async (req: Request, res: Response) => {
    try {
        const { address, id, ...clientInfo } = req.body

        const data = { ...clientInfo }
        if (address) {
            data.address = { 
                update: {...address}
            }
        }

        req.body = updateClientSchema.validateSync(req.body)

        const client = await prisma.client.update({
            where: { id: id },
            data,
            include: { address: true }
        })

        return res.status(200).json({
            success: true,
            message: 'Cliente atualizado com sucesso.',
            client
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
            case 'INVALID_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao atualizar o cliente. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    return res.status(400).json({
                        success: false,
                        message: "Email e/ou CPF já cadastrado."
                    })
                }
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao atualizar o cliente. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const deleteClient = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) throw new Error('MISSING_ID')

        const client = await prisma.client.findUnique({
            where: { id: req.body.id },
            select: { addressId: true }
        })

        if (client) {
            await prisma.$transaction([
                prisma.address.delete({
                    where: { id: client.addressId! }
                }),
    
                prisma.client.delete({
                    where: { id: req.body.id }
                })
            ])         
        }

        return res.status(200).json({
            success: true,
            message: 'Cliente excluído com sucesso.'
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao deletar o cliente. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                    return res.status(400).json({
                        success: false,
                        message: "Esse cliente tem um pedido!"
                    })
                }

                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao deletar o cliente. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}