import * as yup from 'yup' 

export const createStockSchema = yup.object().shape({
    name: yup.string()
        .max(255)
        .required("MISSING_NAME"),

    description: yup.string()
        .max(255)
        .required("MISSING_DESCRIPTION"),

    quantity: yup.number()
        .positive("INVALID_QUANTITY")
        .required("MISSING_QUANTITY"),

}).noUnknown()

export const updateStockSchema = yup.object().shape({
    id: yup.number()
        .positive("INVALID_ID")
        .integer("INVALID_ID")
        .truncate()
        .required("MISSING_ID"),

    name: yup.string()
        .max(255),

    description: yup.string()
        .max(255),

    quantity: yup.number()
        .positive("INVALID_QUANTITY")

}).noUnknown()