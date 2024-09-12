export interface Follows {
  ANIO: string;
  NUMERO_EMISION: string;
  TIPO_DOCUMENTO: string;
  NUMERO_DOC: string;
  SIGLA_DOC: string;
  DEP_EMISOR: string;
  EMISOR: string;
  FECHA_EMISION: Date;
  ASUNTO: string;
  DEP_DESTINO: string;
  PERSONA_DESTINO: string;
  PERSONA_RECIBIDO: string;
  ESTADO: string;
  FECHA_RECEPCION: Date;
  FECHA_DERIVACION: Date;
  FECHA_ARCHIVAMIENTO: Date;
  ANIO_EXP: string;
}

export interface Report {
  coDepDes: string;
  dependencias: string;
  depAbreviatura: string;
  pendienteDespachar: number;
  noLeidos: number;
  recibidosSinAtender: number;
  totalPendientes: number;
}

export interface IPaginadoReporte {
  anio: string;
  mes: string;
  dependencia: string;
  first?: number; // Propiedad opcional para el índice de la primera fila
  rows?: number;
}
