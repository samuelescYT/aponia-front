export interface ReservaHabitacionRequest {
  tipoHabitacionId: string;
  entrada: string;
  salida: string;
  numeroHuespedes: number;
  notas?: string;
}
