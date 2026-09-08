// Datos de ejemplo migrados del prototipo (portal React). Se reemplazan por
// `GET /productos` cuando el backend defina el endpoint.

import { Producto } from '../models/producto.model';

export const CATEGORIAS = ['Todos', 'Snacks salados', 'Snacks dulces', 'Frutos secos'];
export const PRESENTACIONES = ['Todos', '90g', '500g', '1kg'];
export const ORDENAMIENTOS = ['Relevancia', 'Precio: menor a mayor', 'Precio: mayor a menor'];

export const PRODUCTOS_MOCK: Producto[] = [
  { id: 1, name: 'Garbanzo Frita Salado', desc: 'Garbanzo seleccionado 100% peruano', category: 'Snacks salados', price: 4.9, weight: '90g', img: '/productos/garbanzo-frita-salado.png', available: true, promo: '3x2', stock: 18 },
  { id: 2, name: 'Garbanzo Frita Salado', desc: 'Garbanzo seleccionado 100% peruano', category: 'Snacks salados', price: 18.9, weight: '500g', img: '/productos/garbanzo-frita-salado.png', available: true, promo: null, stock: 3 },
  { id: 3, name: 'Garbanzo Frita Salado', desc: 'Garbanzo seleccionado 100% peruano', category: 'Snacks salados', price: 34.9, weight: '1kg', img: '/productos/garbanzo-frita-salado.png', available: true, promo: null, stock: 1 },
  { id: 4, name: 'Chifle Dulce', desc: 'Plátano seleccionado 100% peruano', category: 'Snacks dulces', price: 3.5, weight: '90g', img: '/productos/chifle-dulce.png', available: true, promo: null, stock: 25 },
  { id: 5, name: 'Chifle Dulce', desc: 'Plátano seleccionado 100% peruano', category: 'Snacks dulces', price: 14.9, weight: '500g', img: '/productos/chifle-dulce.png', available: true, promo: '3x2', stock: 2 },
  { id: 6, name: 'Arveja Frita Salada', desc: 'Arveja verde seleccionada 100% peruana', category: 'Snacks salados', price: 4.5, weight: '90g', img: '/productos/arveja-frita-salada.png', available: true, promo: '2x1', stock: 12 },
  { id: 7, name: 'Arveja Frita Salada', desc: 'Arveja verde seleccionada 100% peruana', category: 'Snacks salados', price: 17.9, weight: '500g', img: '/productos/arveja-frita-salada.png', available: true, promo: null, stock: 4 },
  { id: 8, name: 'Maní Confitado', desc: 'Maní seleccionado con cobertura dulce', category: 'Frutos secos', price: 5.5, weight: '90g', img: '/productos/mani-confitado.png', available: true, promo: null, stock: 8 },
  { id: 9, name: 'Maní Confitado', desc: 'Maní seleccionado con cobertura dulce', category: 'Frutos secos', price: 21.9, weight: '500g', img: '/productos/mani-confitado.png', available: false, promo: null, stock: 0 },
  { id: 10, name: 'Hojuelas de Papas', desc: 'Hojuelas de papas fritas con sal', category: 'Snacks salados', price: 3.9, weight: '90g', img: '/productos/hojuelas-papas.png', available: true, promo: '4x3', stock: 20 },
  { id: 11, name: 'Hojuelas de Papas', desc: 'Hojuelas de papas fritas con sal', category: 'Snacks salados', price: 15.9, weight: '500g', img: '/productos/hojuelas-papas.png', available: true, promo: null, stock: 2 },
  { id: 12, name: 'Chifle Salado', desc: 'Plátano seleccionado 100% peruano', category: 'Snacks salados', price: 3.5, weight: '90g', img: '/productos/chifle-salado.png', available: true, promo: null, stock: 15 },
  { id: 13, name: 'Chifle Salado', desc: 'Plátano seleccionado 100% peruano', category: 'Snacks salados', price: 14.9, weight: '500g', img: '/productos/chifle-salado.png', available: true, promo: '3x2', stock: 3 },
  { id: 14, name: 'Chifle Salado', desc: 'Plátano seleccionado 100% peruano', category: 'Snacks salados', price: 27.9, weight: '1kg', img: '/productos/chifle-salado.png', available: true, promo: null, stock: 1 },
  { id: 15, name: 'Maní Tostado Salado', desc: 'Maní tostado con toque de sal marina', category: 'Frutos secos', price: 4.9, weight: '90g', img: '/productos/mani-tostado-salado.png', available: true, promo: null, stock: 6 },
  { id: 16, name: 'Maní Tostado Salado', desc: 'Maní tostado con toque de sal marina', category: 'Frutos secos', price: 19.9, weight: '500g', img: '/productos/mani-tostado-salado.png', available: true, promo: null, stock: 0 },
];
