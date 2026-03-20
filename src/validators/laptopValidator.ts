import { z } from "zod"

//Creamos el esquema de validación para una laptop

/*
z.object({...})	Define un objeto tipo JSON esperado en req.body
z.string().min(1)	Asegura que sea un string no vacío
z.number().positive()	Asegura que sea un número positivo
z.number().int()	Asegura que no tenga decimales
z.string().url()	Valida que el string sea una URL válida
*/

export const LaptopSchema = z.object(
    {
        brand: z.string().min(1, "Brand is required"),
        model: z.string().min(1, "Model is required"),
        cpu: z.string().min(1, "CPU is required"),
        gpu: z.string().min(1, "GPU is required"),
        ram: z.number().int().positive(),
        storage: z.string().min(1),
        screenSize: z.number().positive(),
        refreshRate: z.number().int().positive(),
        priceUSD: z.number().positive(),
        priceMXN: z.number().positive(),
        store: z.string().min(1),
        link: z.string().url({message: "El link debe ser una URL válida que comience con http:// o https://"}),
    }
);