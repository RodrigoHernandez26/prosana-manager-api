require('dotenv').config();
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express()
const PORT = process.env.PORT

app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof SyntaxError) {
        return res.json({
            success: false,
            message: 'Houve um problema com sistema. Por favor, entre em contato com o administrador do sistema.'
        })
    }

    next()
})

app.use('/', require('./routes/user.routes'))
app.use('/', require('./routes/auth.routes'))
app.use('/', require('./routes/client.routes'))
app.use('/', require('./routes/stock.routes'))
app.use('/', require('./routes/order.routes'))

app.listen(PORT, () => {
    console.log(`API listening PORT ${PORT}`)
})
