// habitacion-tipo.model.ts
export interface Imagen { id?: string; url: string; }
export interface HabitacionTipo {
  id: string;
  nombre: string;
  descripcion?: string | null;
  aforoMaximo: number;
  precioPorNoche: number;
  activa: boolean;
  imagenes?: Imagen[]; // ← siempre objetos
}
