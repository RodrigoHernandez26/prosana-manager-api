import * as yup from 'yup';

export const createClientSchema = yup.object().shape({
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

    phone: yup.string()
        .max(255)
        .required("MISSING_PHONE"),

    address: yup.object().shape({
        street: yup.string()
            .max(255)
            .required("MISSING_STREET"),

        number: yup.number()
            .positive("INVALID_NUMBER")
            .integer("INVALID_NUMBER")
            .truncate()
            .required("MISSING_NUMBER"),

        complement: yup.string()
            .max(255),

        neighborhood: yup.string()
            .max(255)
            .required("MISSING_NEIGHBORHOOD"),

        city: yup.string()
            .max(255)
            .required("MISSING_CITY"),
        
        state: yup.string()
            .max(255)
            .required("MISSING_STATE"),

        zipcode: yup.string()
            .max(255)
            .required("MISSING_ZIPCODE"),
        
        country: yup.string()
            .max(255)
            .required("MISSING_COUNTRY")
    })
        .required("MISSING_ADDRESS")
        .noUnknown()
}).noUnknown()

export const updateClientSchema = yup.object().shape({
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

    cpf: yup.string()
        .max(15),

    phone: yup.string()
        .max(255),

    address: yup.object().shape({
        id: yup.number()
            .positive("INVALID_ID")
            .integer("INVALID_ID")
            .truncate(),

        street: yup.string()
            .max(255),

        number: yup.number()
            .positive("INVALID_NUMBER")
            .integer("INVALID_NUMBER")
            .truncate(),

        complement: yup.string()
            .max(255),

        neighborhood: yup.string()
            .max(255),

        city: yup.string()
            .max(255),
        
        state: yup.string()
            .max(255),

        zipcode: yup.string()
            .max(255),
        
        country: yup.string()
            .max(255),
    }).noUnknown()
}).noUnknown()