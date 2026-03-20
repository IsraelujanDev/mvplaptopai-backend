import express from 'express'; 
import { createLaptop, deleteLaptop, getAllLaptops, getLaptopByID, updateLaptop, searchLaptops} from '../controllers/laptopController';

/*

Express evalúa las rutas en orden, desde arriba hacia abajo.

Rutas específicas (estáticas) SIEMPRE van primero

Ejemplos:

/search
/filter
/top
/details
/create
...

Rutas con parámetros dinámicos van hasta el FINAL

Ejemplos:

/:id
/:slug
/:name
/:year

------------------------------------------------

Express utiliza un sistema de coincidencia basado en patrones:

Una ruta como /search solo coincide con ese texto literal.

Una ruta como /:id coincide con cualquier cosa.

Por tanto:

→ Si las pones al revés, la primera que coincida es /:id
→ Y /:id SIEMPRE va a coincidir antes que /search

Esto se llama route shadowing (sombreado de rutas).
La ruta dinámica “sombrea” la ruta estática.

*/

const router = express.Router();

// PRIMERO las rutas específicas

router.get('/search', searchLaptops);//End Point para buscar laptops

router.post('/', createLaptop);//Ruta para crear una laptop

router.get('/', getAllLaptops);//Ruta para obtener todas las laptops


// LUEGO las rutas que reciben parámetros

router.get('/:id',getLaptopByID);//Ruta para obtener laptop por ID

router.put('/:id', updateLaptop);// Endpoint PUT /laptops/:id

router.delete('/:id', deleteLaptop);//Endpoint para hacer DELETE

export default router;