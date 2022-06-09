import * as yup from 'yup' 

export const createOrderSchema = yup.object().shape({
    name: yup.string()
        .max(255)
        .required("MISSING_NAME"),

    description: yup.string()
        .max(255)
        .required("MISSING_DESCRIPTION"),

    status: yup.number()
        .min(0, "INVALID_STATUS")
        .max(3, "INVALID_STATUS")
        .required("MISSING_STATUS"),

    clientId: yup.number()
        .positive("INVALID_CLIENT_ID")
        .integer("INVALID_CLIENT_ID")
        .truncate()
        .required("MISSING_CLIENT_ID"),

    price: yup.number()
        .positive("INVALID_PRICE")
        .required("MISSING_PRICE"),

    stock: yup.array().of(
        yup.object().shape({
            id: yup.number()
                .positive("INVALID_STOCK_ID")
                .integer("INVALID_STOCK_ID")
                .truncate()
                .required("MISSING_STOCK_ID"),

            quantity: yup.number()
                .positive("INVALID_QUANTITY")
                .required("MISSING_QUANTITY"),
        })
            .required("MISSING_STOCK")
    )
        .required("MISSING_STOCK")

}).noUnknown()

export const updateOrderSchema = yup.object().shape({
    id: yup.number()
        .positive("INVALID_ID")
        .integer("INVALID_ID")
        .truncate()
        .required("MISSING_ID"),

    name: yup.string()
        .max(255),

    description: yup.string()
        .max(255),

    status: yup.number()
        .min(0, "INVALID_STATUS")
        .max(3, "INVALID_STATUS"),

    price: yup.number()
        .positive("INVALID_PRICE"),

    clientId: yup.number()
        .positive("INVALID_CLIENT_ID")
        .integer("INVALID_CLIENT_ID")
        .truncate(),

    stock: yup.array().of(yup.object().shape({
        id: yup.number()
            .positive("INVALID_STOCK_ID")
            .integer("INVALID_STOCK_ID")
            .truncate(),

        quantity: yup.number()
            .positive("INVALID_QUANTITY")

    }))

}).noUnknown()