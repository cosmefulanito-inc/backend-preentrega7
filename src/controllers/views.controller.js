import * as servicesService from "../services/services.service.js"
import * as bookingsService from "../services/bookings.service.js"

export async function renderServices(req, res) {
  try {
    const services = await servicesService.getServices()
    res.render("services", { title: "Servicios", services })
  } catch (error) {
    res.status(500).send("Error al cargar los servicios")
  }
}

export async function renderBookings(req, res) {
  try {
    const bookings = await bookingsService.getBookings()
    res.render("bookings", { title: "Reservas", bookings })
  } catch (error) {
    res.status(500).send("Error al cargar las reservas")
  }
}