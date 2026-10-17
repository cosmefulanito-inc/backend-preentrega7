import { Router } from "express"
import { renderBookings, renderServices } from "../controllers/views.controller.js"

const router = Router()

router.get("/services", renderServices)
router.get("/bookings", renderBookings)

export default router
