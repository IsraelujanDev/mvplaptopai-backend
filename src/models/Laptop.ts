import mongoose from 'mongoose';

const LaptopSchema = new mongoose.Schema({

    brand: { type:String, required:true },
    model: { type:String, required:true },
    cpu: {type: String, required: true},
    gpu: {type: String, required:true},
    ram: {type: Number, required: true},
    storage: {type: String, required: true}, // Ej: 512GB SSD
    screenSize: {type: Number},               // En pulgadas
    refreshRate: {type: Number},              // Hz
    priceUSD: {type: Number},
    priceMXN: {type: Number},
    score: {type: Number},                    // Costo-beneficio calculado más adelante
    store: {type: String},                    // Amazon, Walmart, etc.
    link: {type: String},                     // URL para comprar

}, {timestamps: true});

export default mongoose.model('Laptop', LaptopSchema);