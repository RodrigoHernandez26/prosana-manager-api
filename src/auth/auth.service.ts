import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const generateToken = (data: any): string => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not defined');

    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const decodeToken = (token: string): any => {
    if (!process.env.JWT_SECRET) throw new Error('INVALID_TOKEN');

    try { return jwt.verify(token, process.env.JWT_SECRET) }
    catch { throw new Error('INVALID_TOKEN') }
}

export const hashPassword = (password: string): string => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(12))
}

export const comparePassword = (hashedPassword: string, plainTextPassword: string): boolean => {
    return bcrypt.compareSync(plainTextPassword, hashedPassword)
}
