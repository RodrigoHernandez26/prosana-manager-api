import * as yup from 'yup';

export const createUserSchema = yup.object().shape({
    name: yup.string()
        .max(255)
        .required("MISSING_NAME"),

    email: yup.string()
        .max(255)
        .email("INVALID_EMAIL")
        .required("MISSING_EMAIL"),

    cpf: yup.string()
        .max(15)
        .required("MISSING_CPF"),

    password: yup.string()
        .required("MISSING_PASSWORD")

}).noUnknown();

export const updateUserSchema = yup.object().shape({
    id: yup.number()
        .positive("INVALID_ID")
        .integer("INVALID_ID")
        .truncate()
        .required("MISSING_ID"),
    
    name: yup.string()
        .max(255),

    email: yup.string()
        .max(255)
        .email("INVALID_EMAIL"),

    cpf: yup.string().max(15),
    password: yup.string()
}).noUnknown();