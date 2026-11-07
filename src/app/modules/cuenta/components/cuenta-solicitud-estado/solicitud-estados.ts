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
    tono: 'bg-[#FFF4D6] text-amber-800',
    borde: 'border-[#F4D98A]',
  },
  aprobado: {
    etiqueta: 'Aprobado',
    icono: 'circle-check',
    tono: 'bg-[#E3F6E8] text-success-700',
    borde: 'border-[#A9E2BC]',
  },
  rechazado: {
    etiqueta: 'Rechazado',
    icono: 'x',
    tono: 'bg-[#FDE4E4] text-danger-700',
    borde: 'border-[#F3A9A9]',
  },
  reembolsado: {
    etiqueta: 'Reembolsado',
    icono: 'banknote',
    tono: 'bg-[#DDF3E4] text-[#25662A]',
    borde: 'border-[#A9E2BC]',
  },
};
