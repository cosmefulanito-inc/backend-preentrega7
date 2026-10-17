import express from "express"
import servicesRouter from "./routes/services.router.js"
import bookingsRouter from "./routes/bookings.router.js"
import viewsRouter from './routes/views.router.js';

import { engine } from 'express-handlebars';

export const app = express();

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './src/views')

app.use(express.json())
app.use(express.static("./src/public"))

app.use('/views', viewsRouter);
app.use("/api/services", servicesRouter)
app.use("/api/bookings", bookingsRouter)

export default app