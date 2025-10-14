export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  lugar: string;
  precioPorPersona: number;
  duracionMinutos: number;
  capacidadMaxima?: number | null;
  imagenesUrls?: string[];
}
