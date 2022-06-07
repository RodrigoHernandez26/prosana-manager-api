import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import { createOrderSchema, updateOrderSchema } from "../schemas/order.schemas";

const prisma = new PrismaClient()

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                client: {
                    select: { name: true }
                },
                user: {
                    select: { name: true }
                },
                stock: true,
            }
        })

        return res.status(200).json({
            success: true,
            orders
        })
    } catch (error: any) {
        switch (error.message) {
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido buscar os pedidos. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const getOrder = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) throw new Error("ORDER_ID_NOT_FOUND")
        const id = parseInt(req.params.id)
        if (isNaN(id)) throw new Error("INVALID_ORDER_ID")

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                client: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        cpf: true
                    }
                },
                stock: {
                    include: { stock: true }
                },
            }
        })

        if (!order) throw new Error("ORDER_NOT_FOUND")

        return res.status(200).json({
            success: true,
            order
        })

    } catch (error: any) {
        switch (error.message) {
            case "ORDER_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message: "Houve um erro ao buscar o pedido. Por favor, entre em contato com o administrador do sistema."
                })
            case 'ORDER_ID_NOT_FOUND':
            case 'INVALID_ORDER_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao buscar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido buscar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
            }
        }
}

export const createOrder = async (req: Request, res: Response) => {    
    try {
        const { stock, ...orderInfo } = createOrderSchema.validateSync(req.body)

        const transactions = []

        for (const item of stock) {
            const stockItem = await prisma.stock.findUnique({
                where: { id: item.id },
                select: { quantity: true }
            })

            if (!stockItem) throw new Error("STOCK_ITEM_NOT_FOUND")
            if (stockItem.quantity < item.quantity) throw new Error("STOCK_ITEM_NOT_ENOUGH")

            transactions.push(
                prisma.stock.update({
                    where: { id: item.id },
                    data: { quantity: stockItem.quantity - item.quantity }
                })
            )
        }

        const [order, ..._] = await prisma.$transaction([
            prisma.order.create({
                data: {
                    ...orderInfo,
                    userId: req.authData!.id,
                    stock: {
                        create: stock!.map(stock => {
                            return {
                                stockId: stock.id,
                                quantity: stock.quantity
                            }
                        })
                    }
                }
            }),
            ...transactions
        ])

        return res.status(200).json({
            success: true,
            message: 'Pedido criado com sucesso.',
            order
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_NAME':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar um nome para o pedido.'
                })
            case 'MISSING_DESCRIPTION':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar uma descrição para o pedido.'
                })
            case 'INVALID_STATUS':
            case 'MISSING_STATUS':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar um status válido para o pedido.'
                })
            case 'INVALID_CLIENT_ID':
            case 'MISSING_CLIENT_ID':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o cliente do pedido.'
                })
            case 'INVALID_STOCK_ID':
            case 'MISSING_STOCK_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um problema ao criar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
            case 'INVALID_QUANTITY':
            case 'MISSING_QUANTITY':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar uma quantidade válida para o produto.'
                })
            case 'MISSING_STOCK':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o(s) produtos do pedido.'
                })
            case 'STOCK_ITEM_NOT_FOUND':
                return res.status(404).json({
                    success: false,
                    message: 'Houve um problema ao criar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
            case 'STOCK_ITEM_NOT_ENOUGH':
                return res.status(400).json({
                    success: false,
                    message: 'Não há quantidades suficientes do produto no estoque. Verifique o estoque e tente novamente.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao criar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const { stock, ...orderInfo } = updateOrderSchema.validateSync(req.body)

        const order = await prisma.order.findUnique({
            where: { id: orderInfo.id },
            include: { stock: true }
        })

        if (!order) throw new Error("ORDER_NOT_FOUND")

        const transactions = []
        const stockToUpdate = []

        if (stock && stock.length) {
            for (const itemReq of stock) {
                if (!itemReq.id && !itemReq.quantity) throw new Error("INVALID_STOCK_ITEM")

                const stockDb = await prisma.stock.findUnique({
                    where: { id: itemReq.id },
                    select: { quantity: true }
                })
                const stockPd = order.stock.find(itemPd => itemPd.stockId === itemReq.id)
                if (!stockDb || !stockPd) throw new Error("STOCK_ITEM_NOT_FOUND")

                if ((itemReq.quantity! - stockPd!.quantity) > stockDb.quantity) throw new Error("STOCK_ITEM_NOT_ENOUGH")

                stockToUpdate.push({
                    where: { stockId: itemReq.id },
                    data: { quantity: itemReq.quantity! }
                })

                transactions.push(
                    prisma.stock.update({
                        where: { id: itemReq.id },
                        data: { quantity: stockDb.quantity - (itemReq.quantity! - stockPd.quantity!) }
                    })
                )
            }
        }

        await prisma.$transaction([
            ...transactions,
            
            prisma.order.update({
                where: { id: orderInfo.id },
                data: {
                    ...orderInfo,
                    stock: { updateMany: [ ...stockToUpdate ] }
                }
            })
        ])

        return res.status(200).json({
            success: true,
            message: 'Pedido atualizado com sucesso.'
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
            case 'INVALID_STOCK_ITEM':
            case 'STOCK_ITEM_NOT_FOUND':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao atualizar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
            case 'STOCK_ITEM_NOT_ENOUGH':
                return res.status(400).json({
                    success: false,
                    message: 'Não há quantidades suficientes do(s) produto no estoque. Verifique o estoque e tente novamente.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao atualizar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const id = req.body.id
        if (!id) throw new Error("MISSING_ID")

        const order = await prisma.order.findUnique({
            where: { id },
            include: { stock: true }
        })

        if (order) {
            const transactions = []

            for (const item of order.stock) {
                const stock = await prisma.stock.findUnique({
                    where: { id: item.stockId },
                    select: { quantity: true }
                })

                transactions.push(
                    prisma.stock.update({
                        where: { id: item.stockId },
                        data: { quantity: stock!.quantity + item.quantity }
                    })                    
                )
            }

            await prisma.$transaction([
                ...transactions,

                prisma.order.delete({
                    where: { id }
                })
            ])
        }

        return res.status(200).json({
            success: true,
            message: 'Pedido excluído com sucesso.'
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao deletar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao deletar o pedido. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}
