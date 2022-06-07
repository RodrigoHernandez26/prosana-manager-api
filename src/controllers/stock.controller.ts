import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import { createStockSchema, updateStockSchema } from "../schemas/stock.schemas";

const prisma = new PrismaClient()

export const getAllStock = async (req: Request, res: Response) => {
    try {
        const stocks = await prisma.stock.findMany()

        return res.status(200).json({
            success: true,
            stocks
        })
    } catch (error: any) {
        switch (error.message) {
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido buscar os produtos. Por favor, entre em contato com o administrador do sistema.'
                })
            }
        }
}

export const getStock = async (req: Request, res: Response) => {
    try {
        if (!req.params.id) throw new Error("STOCK_ID_NOT_FOUND")
        const id = parseInt(req.params.id)
        if (isNaN(id)) throw new Error("INVALID_STOCK_ID")

        const stock = await prisma.stock.findUnique({
            where: { id },
        })

        if (!stock) throw new Error("STOCK_NOT_FOUND")

        return res.status(200).json({
            success: true,
            stock
        })

    } catch (error: any) {
        switch (error.message) {
            case "STOCK_NOT_FOUND":
                return res.status(404).json({
                    success: false,
                    message: "Houve um erro ao buscar o estoque. Por favor, entre em contato com o administrador do sistema."
                })
            case 'STOCK_ID_NOT_FOUND':
            case 'INVALID_STOCK_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao buscar o estoque. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido buscar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const createStock = async (req: Request, res: Response) => {
    try {
        req.body = createStockSchema.validateSync(req.body)

        const stock = await prisma.stock.create({
            data: req.body
        })

        return res.status(200).json({
            success: true,
            message: 'Produto criado com sucesso.',
            stock
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_NAME':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar o nome do produto.'
                })
            case 'MISSING_DESCRIPTION':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar a descrição do produto.'
                })
            case 'MISSING_QUANTITY':
            case 'INVALID_QUANTITY':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar uma quantidade valida do produto.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao criar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const updateStock = async (req: Request, res: Response) => {
    try {
        const { id, ...updateInfo } = updateStockSchema.validateSync(req.body)

        const stock = await prisma.stock.update({
            where: { id: id },
            data: updateInfo
        })

        return res.status(200).json({
            success: true,
            message: 'Produto atualizado com sucesso.',
            stock
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
            case 'INVALID_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao atualizar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
            case 'INVALID_QUANTITY':
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar uma quantidade valida do produto.'
                })
            default:
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao atualizar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}

export const deleteStock = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) throw new Error("MISSING_ID")

        await prisma.stock.delete({
            where: { id: req.body.id }
        })

        return res.status(200).json({
            success: true,
            message: 'Produto excluído com sucesso.'
        })

    } catch (error: any) {
        switch (error.message) {
            case 'MISSING_ID':
                return res.status(400).json({
                    success: false,
                    message: 'Houve um erro ao deletar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
            default:
                return res.status(500).json({
                    success: false,
                    message: 'Erro desconhecido ao deletar o produto. Por favor, entre em contato com o administrador do sistema.'
                })
        }
    }
}