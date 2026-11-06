import { IconName } from '../../../../shared/ui/icon/icon';
import { EstadoSolicitud } from '../../models/solicitud-vista.model';

/** Texto e icono: el significado no depende únicamente del color. */
export const SOLICITUD_ESTADOS: Record<
  EstadoSolicitud,
  { etiqueta: string; icono: IconName; tono: string; borde: string }
> = {
  pendiente: {
    etiqueta: 'Pendiente',
    icono: 'clock',
    tono: 'bg-warning-50 text-amber-800',
    borde: 'border-warning/50',
  },
  aprobado: {
    etiqueta: 'Aprobado',
    icono: 'circle-check',
    tono: 'bg-success-50 text-success-700',
    borde: 'border-success/50',
  },
  rechazado: {
    etiqueta: 'Rechazado',
    icono: 'x',
    tono: 'bg-danger-50 text-danger-700',
    borde: 'border-destructive/50',
  },
  reembolsado: {
    etiqueta: 'Reembolsado',
    icono: 'banknote',
    tono: 'bg-success-50 text-success-700',
    borde: 'border-success/50',
  },
};
