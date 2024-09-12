import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

import { BreadcrumbComponent } from '../../layout/breadcrumb/breadcrumb.component';
import { SeguimientoService } from '../../shared/services/sgd-seguimiento/seguimiento.service';
import { IPaginadoReporte } from '../../shared/interfaces/seguimiento';

import pdfMake from 'pdfMake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-pendientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    CardModule,
    TableModule,
    DropdownModule,
    ButtonModule,
  ],
  templateUrl: './pendientes.component.html',
  styleUrls: ['./pendientes.component.css'],
})
export default class PendientesComponent {
  public showEntries!: FormGroup;
  public anio: Array<{ label: string; value: any }> = [];
  public selectedYear!: string;
  public months: Array<{ name: string }> = [];
  public dependencia: Array<{ idDependencia: string; deDependencia: string }> =
    [];
  public selectedDependenciaId: string = '';

  public totalPendienteDespachar = 0;
  public totalRecibidosSinAtender = 0;
  public totalNoLeidosDespachar = 0;
  public totalPendiente = 0;
  public totalRecords = 0;

  public dd: any;

  public reporte: any = [];
  public isLoading = false;
  public selectedDependency: string = '';
  private readonly allMonths = [
    { id: '01', name: 'ENERO' },
    { id: '02', name: 'FEBRERO' },
    { id: '03', name: 'MARZO' },
    { id: '04', name: 'ABRIL' },
    { id: '05', name: 'MAYO' },
    { id: '06', name: 'JUNIO' },
    { id: '07', name: 'JULIO' },
    { id: '08', name: 'AGOSTO' },
    { id: '09', name: 'SETIEMBRE' },
    { id: '10', name: 'OCTUBRE' },
    { id: '11', name: 'NOVIEMBRE' },
    { id: '12', name: 'DICIEMBRE' },
  ];

  constructor(
    private fb: FormBuilder,
    private seguimientoService: SeguimientoService
  ) {
    this.initializeForm();
    this.searchReporte();
  }

  public ngOnInit(): void {
    this.paginatePermission();
    this.loadYears();
    this.listDependencia();
  }

  private initializeForm(): void {
    this.showEntries = this.fb.group({
      anio: [''],
      mes: [''],
      oficina: [''],
    });
  }

  private loadYears(): void {
    this.seguimientoService.getSeguimientoAnio().subscribe((res: any) => {
      this.anio = res.map((year: any) => ({
        label: year.anio,
        value: year,
      }));
    });
  }

  public onTypeSystemSelectionChange(event: any): void {
    this.selectedYear = event.value.anio;
    this.updateMonthsForSelectedYear(this.selectedYear);

    this.showEntries.get('mes')?.enable();
  }

  private updateMonthsForSelectedYear(year: string) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    this.months =
      parseInt(year) === currentYear
        ? this.allMonths.slice(0, currentMonth + 1)
        : [...this.allMonths];
  }

  public listDependencia() {
    this.seguimientoService
      .getSeguimientoDependencia()
      .subscribe((res: any) => {
        this.dependencia = res.map((item: any) => ({
          coDependencia: item.coDependencia,
          deDependencia: item.deDependencia,
        }));
      });
  }

  public onDependenciaSelectionChange(event: any) {
    this.selectedDependenciaId = event.value;
  }

  public searchReporte(): void {
    this.showEntries.valueChanges.subscribe((data: any) => {
      const params: IPaginadoReporte = {
        anio: this.selectedYear,
        mes: data.mes,
        dependencia: data.oficina,
      };

      this.fetchReportData(params);
    });
  }

  public loadReporte(event: TableLazyLoadEvent) {
    const rowsPerPage = event.rows ?? 10;

    const params: IPaginadoReporte = {
      anio: this.showEntries.value.anio || new Date().getFullYear(),
      mes: this.showEntries.value.mes,
      dependencia: this.showEntries.value.oficina,
      first: event.first || 0,
      rows: rowsPerPage,
    };

    this.fetchReportData(params);
  }

  private fetchReportData(params: IPaginadoReporte): void {
    this.isLoading = true;
    this.seguimientoService.getSeguimientoReport(params).subscribe(
      (res: any) => {
        setTimeout(() => {
          this.reporte = res || [];
          this.totalRecords = res.totalRecords || 0;
          this.calculateTotals(this.reporte);
          this.isLoading = false;
        }, 0);
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  private calculateTotals(reporte: any[]) {
    if (Array.isArray(reporte)) {
      this.totalPendienteDespachar = 0;
      this.totalRecibidosSinAtender = 0;
      this.totalNoLeidosDespachar = 0;
      this.totalPendiente = 0;

      reporte.forEach((data: any) => {
        this.totalPendienteDespachar += data.pendienteDespachar || 0;
        this.totalRecibidosSinAtender += data.recibidosSinAtender || 0;
        this.totalNoLeidosDespachar += data.noLeidos || 0;
        this.totalPendiente += data.totalPendientes || 0;
      });
    }
  }

  public paginatePermission() {
    const anioActual = this.showEntries.value.anio || new Date().getFullYear();

    const params: IPaginadoReporte = {
      anio: anioActual,
      mes: this.showEntries.value.mes,
      dependencia: this.showEntries.value.oficina,
    };

    this.fetchReportData(params);
  }

  public createPdf(): void {
    const params: IPaginadoReporte = {
      anio: this.showEntries.value.anio.anio || this.showEntries.value.anio,
      mes: this.showEntries.value.mes,
      dependencia: this.showEntries.value.oficina,
    };

    this.seguimientoService
      .getSeguimientoReport(params)
      .subscribe((res: any) => {
        let totalPendienteDespachar = 0;
        res.forEach((data: any) => {
          const valorPendienteDespachar =
            parseFloat(data?.pendienteDespachar) || 0;
          totalPendienteDespachar += valorPendienteDespachar;
        });

        let totalRecibidosSinAtender = 0;
        res.forEach((data: any) => {
          const valorRecibidosSinAtender =
            parseFloat(data?.recibidosSinAtender) || 0;
          totalRecibidosSinAtender += valorRecibidosSinAtender;
        });

        let totalNoLeidos = 0;
        res.forEach((data: any) => {
          const valorNoLeidos = parseFloat(data?.noLeidos) || 0;
          totalNoLeidos += valorNoLeidos;
        });

        let totalTotalPendientes = 0;
        res.forEach((data: any) => {
          const valorTotalPendientes = parseFloat(data?.totalPendientes) || 0;
          totalTotalPendientes += valorTotalPendientes;
        });

        this.dd = {
          pageOrientation: 'landscape',
          content: [
            {
              columns: [
                {
                  alignment: 'center',
                  width: 100,
                  text: '',
                },
                {
                  alignment: 'center',
                  width: '*',
                  text: 'Reporte de documentos pendientes de atención INDECI',
                  bold: true,
                },
                {
                  alignment: 'center',
                  width: 100,
                  text: '',
                },
              ],
            },
            {
              text: '\n',
            },
            {
              table: {
                widths: [15, 340, 100, 80, 70, 70, 55],
                body: [
                  [
                    {
                      text: 'Nº',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#fce4d6',
                      fontSize: 10,
                    },
                    {
                      text: 'NOMENCLATURA',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#fce4d6',
                      fontSize: 10,
                    },
                    {
                      text: 'SIGLAS OFICIALES',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#fce4d6',
                      fontSize: 10,
                    },
                    {
                      text: 'Documentos \n  pendiente \n de ser despachados \n (Jefe / Director / Coordinador)',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#fce4d6',
                      fontSize: 10,
                    },
                    {
                      text: 'Documentos \n Recibidos sin \n atender (Servidores)',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#e2efda',
                      fontSize: 10,
                    },
                    {
                      text: 'Documentos No \n leidos \n (Servidores)',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#e2efda',
                      fontSize: 10,
                    },
                    {
                      text: 'Total de pendiente \n (Servidores)',
                      alignment: 'center',
                      bold: true,
                      fillColor: '#e2efda',
                      fontSize: 10,
                    },
                  ],
                  ...res.map((data: any, index: any) => [
                    { text: index + 1, alignment: 'center', fontSize: 10 },
                    {
                      text: data?.dependencias,
                      alignment: 'rigth',
                      fontSize: 10,
                    },
                    {
                      text: data?.depAbreviatura,
                      alignment: 'rigth',
                      fontSize: 10,
                    },
                    {
                      text: data?.pendienteDespachar,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: data?.recibidosSinAtender,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: data?.noLeidos,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: data?.totalPendientes,
                      alignment: 'center',
                      fontSize: 10,
                    },
                  ]),
                ],
              },
            },
            {
              table: {
                widths: [15, 340, 100, 80, 70, 70, 55],
                body: [
                  [
                    {
                      text: '',
                      alignment: 'center',
                      fontSize: 10,
                      colSpan: 2,
                    },
                    {
                      text: '',
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: 'TOTAL',
                      alignment: 'rigth',
                      fontSize: 10,
                    },
                    {
                      text: totalPendienteDespachar,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: totalRecibidosSinAtender,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: totalNoLeidos,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {
                      text: totalTotalPendientes,
                      alignment: 'center',
                      fontSize: 10,
                    },
                  ],
                ],
              },
            },
          ],
          pageMargins: [30, 40, 20, 30],
          footer: (currentPage: any, pageCount: any) => {
            return {
              text: `Página ${currentPage.toString()} de ${pageCount.toString()}`,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 0],
            };
          },
        };
        const pdfDocGenerator = pdfMake.createPdf(this.dd);
        pdfDocGenerator.download('reporte.pdf');
        pdfDocGenerator.open();
        this.limpiarBusqueda();
      });
  }

  public exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.reporte);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(data, 'documentos_pendientes.xlsx');
  }

  public exportarExcel(): void {
    const params: IPaginadoReporte = {
      anio: this.showEntries.value.anio.anio || this.showEntries.value.anio,
      mes: this.showEntries.value.mes,
      dependencia: this.showEntries.value.oficina,
    };
    this.seguimientoService
      .getSeguimientoReport(params)
      .subscribe((res: any) => {
        this.reporte = res;
        this.exportToExcel();
        this.limpiarBusqueda();
      });
  }

  public limpiarBusqueda(): void {
    this.showEntries.reset({
      anio: '',
      mes: '',
      oficina: '',
    });

    this.paginatePermission();
  }
}
