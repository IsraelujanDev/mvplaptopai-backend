import {Request, Response} from 'express';
import mongoose from 'mongoose'; //Necesario para validar el ID
import Laptop from '../models/Laptop';
import { LaptopSchema } from '../validators/laptopValidator';
import {ZodError} from "zod";

//Funcion para obtener una laptop por su ID
export const getLaptopByID =async (req: Request, res: Response) => {
    try {
        const id: string =req.params.id as string;

        //Validar que el ID tenga formato correcto de MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: 'Invalid ID format'});
        }

        //Buscamos en la base de datos por ID
        const laptop = await Laptop.findById(id);

        //Si no se encontro ninguna laptop respondemos con error 404
        if (!laptop){
            return res.status(404).json ({message: 'Laptop not found'});
        }

        //si la encontramos la regresamos
        res.status(200).json(laptop); 
    } catch (error) {
        //Si ocurre algun error interno, regresa 500
        res.status(500).json({message: 'Error retrieving laptop', error});
    }
}

/*
LaptopSchema.parse(req.body)	Valida la estructura completa del body
validatedData	Solo contiene datos válidos ya verificados
ZodError	Error especial que lanza Zod si algo está mal
err.issues	Lista clara y usable de errores (campo por campo)
*/

//Controlador para crear una laptop
export const createLaptop = async (req: Request, res: Response) => {
    try{
        //Validamos el body usando Zod
        const validatedData = LaptopSchema.parse(req.body);

        //Creamos la nueva laptop con los datos validados
        const newLaptop = new Laptop(req.body);// Crea la laptop con los datos del body
        const savedLaptop = await newLaptop.save();// Guarda en MongoDB

        //Esta linea imprime en consola lo que se guardo despues de peticion
        console.log('laptop guardada', savedLaptop);// Devuelve la laptop guardada
        
        //Respondemos con la laptop guardada
        res.status(201).json(savedLaptop);

    } catch (err: any){
        //Si la validacion falla con zod
        if (err instanceof ZodError){
            return res.status(400).json({
                message: "Validation Error",
                errors: err.issues, //Array detallado de errores de cada campo
            });
        }
        //Otro tipo de error por ejemplo Mongo DB
        res.status(500).json({
            message: "Error saving laptop", 
            details: err,
        });
    }
}

//Controlador para obtener todas las laptops
export const getAllLaptops =async (_req: Request, res: Response) => {
    try{
        const laptops = await Laptop.find();// Busca todas las laptops en la base de datos
        res.status(200).json(laptops); // Las devuelve en formato JSON
    } catch (err){
        res.status(500).json({error: 'Error fetching laptops', details: err});

    }
}

export const updateLaptop = async (req: Request, res: Response) => {

    //Para esecificar que efectivamente es de tipo string
    const id: string =req.params.id as string;

    //Validar formato de ID
        
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message: 'Invalid ID format'});
    }

    try {
        //Validar el body con Zod
        const validatedData =LaptopSchema.parse(req.body);

        //actualizar y retornar la laptop actualizada
        const updatedLaptop = await Laptop.findByIdAndUpdate(id, validatedData,
            {
                new: true, //Devuelve Laptop actualizada
                runValidators:true,
            }
        );
        if (!updatedLaptop){
            return res.status(404).json({message: 'Laptop not found'});
        }

        return res.status(200).json(updatedLaptop);

    } catch (err: any){
        if (err instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation Error',
                errors: err.issues,
            });
        }

        return res.status(500).json(
            {
                message: 'Error updating laptop',
                details: err,
            }
        );

    }
};

export const deleteLaptop = async (req: Request, res: Response) => {

     const {id} = req.params;


    try{
       
        const deletedLaptop = await Laptop.findByIdAndDelete (id);

        if (!deletedLaptop){
            return res.status(404).json({message: 'Laptop Not Found'});
        }
        res.status(200).json({message: 'Laptop Deleted Succesfully', deletedLaptop});
    } catch (err){
        res.status(500).json({
            message: 'Error deleting laptop',
            details: err,            
        });

    }
    
};

//Controlador para buscar laptops por filtros dinamicos
/*
export const searchLaptops = async (req: Request, res: Response) => {

     
    
    Operadores en MongoDB:

    $gte → Greater Than or Equal 

    $lte → Less Than or Equal

    $regex → Regular Expression Search
    
    $options: 'i' → Case-Insensitive; Ignora mayúsculas y minúsculas

    
    try {
        //Extraemos todos los posibles filtros desde la query del request
        const {
            brand,
            model,
            cpu,
            gpu,
            store,
            minPriceUSD,
            maxPriceUSD,
            minRam,
            maxRam,
            minRefreshRate,
            maxRefreshRate,
        } = req.query;

        //Creamos un objeto vacio que se ira llenando con los filtros aplicados

        const filter: any ={};

        //Filtro exacto por marca 

        if (brand) filter.brand = brand;

        //Filtro parcial por modelo utilizando expresiones regulares (Regex, Case-In Sentsitive)
        
        if (model) filter.model = {$regex: model, $options: 'i'};

        //Filtro parcial por CPU Tambien con Regex

        if (cpu) filter.cpu = {$regex: cpu, $options: 'i'};

        //Filtro parcial por GPU        

        if (gpu) filter.gpu = {$regex: gpu, $options: 'i'};

        //Filtro exacto por tienda 

        if (store) filter.store = store;

        //Filtro por rango de precio USD

        if (minPriceUSD || maxPriceUSD) {

            filter.priceUSD = {}; //Se crea un subobjeto
            //Max precio USD
            if (minPriceUSD) filter.priceUSD.$gte = Number(minPriceUSD);
            //Min Precio USD
            if (maxPriceUSD) filter.priceUSD.$lte = Number(maxPriceUSD);
            
        }

        //Filtro por rango de Memoria RAM

        if (minRam || maxRam) {

            filter.ram = {};//Se crea un sobobjeto
            //Min ram
            if (minRam) filter.ram.$gte = Number(minRam);
            //Max ram
            if(maxRam) filter.ram.$lte = Number(maxRam);
            
        }

        //Filtro por rango de tasas de refresco 

        if (minRefreshRate || maxRefreshRate) {

            filter.refreshRate = {}; //Se crea un subobjeto
            //Min refresh rate
            if (minRefreshRate) filter.refreshRate.$gte = Number(minRefreshRate);
            //Max refresh rate
            if(maxRefreshRate) filter.refreshRate.$lte = Number(maxRefreshRate);
            
        }

        //Realizamos la busqueda en la base de datos utilizando el objeto de filtros
        const Laptops = await Laptop.find(filter);

        //Devolvemos las laptops encontradas como respuesta
        res.status(200).json(Laptops);       
    } catch(err) {

        //Si algo falla por ejemplo MongoDB no responde devolvemos error 500

        res.status(500).json({
            error:'error searching laptops',
            details: err,
        });

    }
}; 

*/


// searchLaptops Editado para paginacion: Controlador para buscar laptops con filtros y paginación

// Controlador: buscar laptops con filtros + paginación + ordenamiento seguro
export const searchLaptops = async (req: Request, res: Response) => {
  try {
    // =========================
    // 1) LEER QUERY PARAMETERS
    // =========================

    // Extraemos parámetros desde la query string (todo llega como string | undefined normalmente)
    const { brand, minRam, maxPriceUSD, sortBy, order } = req.query;

    // =========================
    // 2) CONSTRUIR FILTROS
    // =========================

    // Creamos un objeto vacío para armar filtros dinámicamente para Mongo/Mongoose
    const filters: any = {};

    // Si viene brand, filtramos con regex case-insensitive (ignora mayúsculas/minúsculas)
    if (brand) {
      // Convertimos brand a string (por typing de Express puede venir ParsedQs)
      const brandStr = String(brand); // Fuerza a texto
      // Construimos un regex con la marca, con bandera "i" = case-insensitive
      filters.brand = { $regex: new RegExp(brandStr, "i") }; // Ej: ASUS, asus, AsUs...
    }

    // Si viene minRam, aplicamos "ram >= minRam"
    if (minRam) {
      // Convertimos el valor a número
      const minRamNumber = Number(minRam); // Ej: "16" -> 16
      // Validamos que sea número válido (si mandan abc, será NaN)
      if (Number.isNaN(minRamNumber)) {
        // Cortamos si no es número
        return res.status(400).json({ error: 'Parámetro "minRam" inválido. Debe ser numérico.' });
      }
      // Aplicamos el filtro $gte (greater than or equal)
      filters.ram = { $gte: minRamNumber }; // Ej: { ram: { $gte: 16 } }
    }

    // Si viene maxPriceUSD, aplicamos "priceUSD <= maxPriceUSD"
    if (maxPriceUSD) {
      // Convertimos a número
      const maxPriceNumber = Number(maxPriceUSD); // Ej: "1800" -> 1800
      // Validamos que sea número
      if (Number.isNaN(maxPriceNumber)) {
        // Cortamos si no es número
        return res.status(400).json({ error: 'Parámetro "maxPriceUSD" inválido. Debe ser numérico.' });
      }
      // IMPORTANTE: el campo real es priceUSD, NO maxPriceUSD
      filters.priceUSD = { $lte: maxPriceNumber }; // Ej: { priceUSD: { $lte: 1800 } }
    }

    // =========================
    // 3) PAGINACIÓN (DEFAULTS + VALIDACIÓN)
    // =========================

    // Tomamos page tal cual viene (puede ser undefined si no lo mandan)
    const pageRaw = req.query.page; // Ej: "2" | "abc" | undefined

    // Tomamos limit tal cual viene (puede ser undefined si no lo mandan)
    const limitRaw = req.query.limit; // Ej: "10" | "100" | undefined

    // Definimos defaults si NO vienen
    let page = 1; // Default: página 1
    let limit = 10; // Default: 10 resultados por página

    // Si el usuario SÍ mandó page, entonces validamos y lo usamos
    if (pageRaw !== undefined) {
      // Convertimos page a número
      const pageNumber = Number(pageRaw); // "2" -> 2, "abc" -> NaN
      // Validamos: que sea número, entero, y >= 1
      if (Number.isNaN(pageNumber) || pageNumber < 1 || !Number.isInteger(pageNumber)) {
        // Si no cumple, devolvemos 400
        return res.status(400).json({
          error: 'Parámetro "page" inválido. Debe ser un entero mayor o igual a 1.',
        });
      }
      // Si pasó validación, asignamos page
      page = pageNumber; // Ej: page = 2
    }

    // Si el usuario SÍ mandó limit, entonces validamos y lo usamos
    if (limitRaw !== undefined) {
      // Convertimos limit a número
      const limitNumber = Number(limitRaw); // "10" -> 10, "abc" -> NaN
      // Validamos: que sea número, entero, >=1 y <= 50 (protección)
      if (
        Number.isNaN(limitNumber) ||
        limitNumber < 1 ||
        limitNumber > 50 ||
        !Number.isInteger(limitNumber)
      ) {
        // Si no cumple, devolvemos 400
        return res.status(400).json({
          error: 'Parámetro "limit" inválido. Debe ser un entero entre 1 y 50.',
        });
      }
      // Si pasó validación, asignamos limit
      limit = limitNumber; // Ej: limit = 20
    }

    // Calculamos cuántos documentos saltar para llegar a la página
    const skip = (page - 1) * limit; // Ej: page=2, limit=10 => skip=10

    // =========================
    // 4) ORDENAMIENTO SEGURO (WHITELIST)
    // =========================

    // Lista blanca de campos por los que SÍ permitimos ordenar (seguridad)
    const allowedSortFields = ["priceUSD", "priceMXN", "createdAt", "ram", "screenSize", "refreshRate"];

    // Lista blanca de órdenes permitidas
    const allowedOrders = ["asc", "desc"];

    // Creamos el objeto sort vacío (si no hay sortBy, se queda vacío)
    const sort: any = {};

    // Si mandaron sortBy, validamos que sea string y esté en la whitelist
    if (sortBy !== undefined) {
      // Forzamos a string (por si Express lo tipa raro)
      const sortByStr = String(sortBy); // Ej: "priceUSD"
      // Si NO está permitido, devolvemos 400
      if (!allowedSortFields.includes(sortByStr)) {
        return res.status(400).json({ error: `Campo de ordenamiento no válido: '${sortByStr}'` });
      }

      // Si mandaron order, lo validamos; si no lo mandaron, default será "asc"
      let orderStr = "asc"; // Default: ascendente
      if (order !== undefined) {
        // Convertimos order a string
        orderStr = String(order); // Ej: "desc"
        // Validamos si es asc/desc
        if (!allowedOrders.includes(orderStr)) {
          return res.status(400).json({ error: `Orden '${orderStr}' no permitido. Usa 'asc' o 'desc'.` });
        }
      }

      // Convertimos "asc/desc" a lo que Mongo/Mongoose entiende: 1 o -1
      const sortOrder = orderStr === "desc" ? -1 : 1; // desc=-1, asc=1

      // Construimos el objeto sort dinámicamente, seguro ya validado
      sort[sortByStr] = sortOrder; // Ej: { priceUSD: -1 }
    }

    // =========================
    // 5) CONTAR RESULTADOS (PARA PAGINACIÓN)
    // =========================

    // Contamos cuántos documentos cumplen el filtro (sin paginar)
    const totalResults = await Laptop.countDocuments(filters); // Ej: 24

    // Calculamos el total de páginas
    const totalPages = Math.ceil(totalResults / limit); // Ej: 24/10 => 3

    // =========================
    // 6) CONSULTA FINAL (FILTROS + SORT + SKIP + LIMIT)
    // =========================

    // Hacemos la consulta con filtros, ordenamiento y paginación
    const laptops = await Laptop.find(filters) // Aplicamos filtros (brand/minRam/maxPriceUSD/etc.)
      .sort(sort) // Aplicamos sort si existe (si sort está vacío, no afecta)
      .skip(skip) // Saltamos documentos para caer en la página correcta
      .limit(limit); // Limitamos el número de resultados

    // =========================
    // 7) RESPUESTA
    // =========================

    // Respondemos con resultados + metadata de paginación
    return res.status(200).json({
      results: laptops, // Array de laptops encontradas
      pagination: {
        totalResults, // Total de documentos que cumplen filtros
        totalPages, // Total de páginas disponibles
        currentPage: page, // Página actual
        limit, // Tamaño de página usado
        hasNextPage: page < totalPages, // true si existe una página siguiente
        hasPrevPage: page > 1, // true si existe una página anterior
      },
    });
  } catch (error) {
    // Si algo se rompe inesperadamente (DB, etc.), devolvemos 500
    return res.status(500).json({ message: "Error during laptop search", error });
  }
};
