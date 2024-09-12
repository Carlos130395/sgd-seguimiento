import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { Follows, IPaginadoReporte } from '../../interfaces/seguimiento';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SeguimientoService {
  private readonly baseUrl: string = environment.urlSeguimiento; // Base URL
  private readonly retryCount: number = 2; // Número de reintentos

  constructor(private _httpClient: HttpClient) {}

  getSeguimientoFollows(codigo: string): Observable<Follows[]> {
    const url = `${this.baseUrl}/follows/${codigo}`;

    return this._httpClient
      .get<Follows[]>(url)
      .pipe(retry(this.retryCount), catchError(this.handleError));
  }

  getSeguimientoReport(params: IPaginadoReporte) {
    return this._httpClient.get(
      `${this.baseUrl}/report?anio=${params.anio}&mes=${params.mes}&dependencia=${params.dependencia}`
    );
  }

  getDocumentosEmitidos(params: IPaginadoReporte){
    return this._httpClient.get(
      `${this.baseUrl}/documentos-emitidos?anio=${params.anio}&mes=${params.mes}&dependencia=${params.dependencia}`
    )
  }

  getSeguimientoAnio() {
    return this._httpClient.get(`${this.baseUrl}/anio`);
  }

  getSeguimientoDependencia() {
    return this._httpClient.get(`${this.baseUrl}/dependencia`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error al obtener los datos:', error);
    return throwError(
      () =>
        new Error(
          'Ocurrió un error al procesar la solicitud. Inténtalo nuevamente más tarde.'
        )
    );
  }
}
