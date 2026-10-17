import mongoose from "mongoose"

const serviceSchema = new mongoose.Schema({

    // el id desaparece porque ahora lo asigna mongo
    
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        required: true
    }
})

export default mongoose.model("Service", serviceSchema)