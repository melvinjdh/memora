import React from 'react';
import { CheckCircle2, Clock3, PackageCheck, UserRound } from 'lucide-react';
import { Button } from './ui/button';
import {
  getFulfillmentStatusDescription,
  getFulfillmentStatusLabel,
  getGuideBookingStatusDescription,
  getGuideBookingStatusLabel,
  getNextFulfillmentStatus,
  updateLocalGuideBookingStatus,
  updateLocalOrderFulfillmentStatus,
} from '../services/orderSimulationService';

type Props = {
  order: any;
  onUpdated?: () => void;
};

export const OrderStatusActions: React.FC<Props> = ({ order, onUpdated }) => {
  const hasMerchandise = order.items?.some((item: any) => item.type === 'merchandise');
  const hasGuide = order.items?.some((item: any) => item.type === 'guide');
  const guideItem = order.items?.find((item: any) => item.type === 'guide');
  const fulfillmentStatus = order.fulfillment?.status;
  const guideStatus = order.guideBooking?.status;

  const refresh = () => {
    if (onUpdated) onUpdated();
    else window.location.reload();
  };

  const moveFulfillmentNext = () => {
    const nextStatus = getNextFulfillmentStatus(fulfillmentStatus);
    updateLocalOrderFulfillmentStatus(order.id, nextStatus);
    refresh();
  };

  const confirmGuide = () => {
    updateLocalGuideBookingStatus(order.id, 'confirmed');
    refresh();
  };

  if (!hasMerchandise && !hasGuide) return null;

  return (
    <div className="mt-3 space-y-2">
      {hasMerchandise && order.fulfillment && (
        <div className="rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-3">
          <div className="mb-2 flex items-start gap-2">
            <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
            <div>
              <p className="text-sm font-bold text-[#f0ebe3]">
                {getFulfillmentStatusLabel(fulfillmentStatus)}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#a09a90]">
                {getFulfillmentStatusDescription(fulfillmentStatus)}
              </p>
            </div>
          </div>

          {fulfillmentStatus === 'preparing' && (
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#a09a90]">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c9ad6e]" />
                Status ini juga akan otomatis berubah menjadi siap diambil setelah jeda simulasi.
              </p>
              <Button
                type="button"
                size="sm"
                className="w-full bg-[#b59a5b] text-xs font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]"
                onClick={moveFulfillmentNext}
              >
                Simulasi Cepat: Pesanan Siap Diambil
              </Button>
            </div>
          )}

          {fulfillmentStatus === 'ready_for_pickup' && (
            <Button
              type="button"
              size="sm"
              className="w-full bg-[#b59a5b] text-xs font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]"
              onClick={moveFulfillmentNext}
            >
              Simulasi: Sudah Diambil
            </Button>
          )}

          {fulfillmentStatus === 'picked_up' && (
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Pesanan selesai.
            </p>
          )}
        </div>
      )}

      {hasGuide && order.guideBooking && (
        <div className="rounded-2xl border border-[#b59a5b]/15 bg-[#0a1f1a]/35 p-3">
          <div className="mb-2 flex items-start gap-2">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#c9ad6e]" />
            <div>
              <p className="text-sm font-bold text-[#f0ebe3]">
                {getGuideBookingStatusLabel(guideStatus)}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#a09a90]">
                {getGuideBookingStatusDescription(guideStatus, {
                  guideName: guideItem?.details?.guideName || guideItem?.name,
                  date: guideItem?.details?.date
                    ? new Date(guideItem.details.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : undefined,
                })}
              </p>
            </div>
          </div>

          {guideStatus === 'waiting_confirmation' && (
            <div className="space-y-2">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#a09a90]">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c9ad6e]" />
                Status ini juga akan otomatis berubah menjadi terkonfirmasi setelah jeda simulasi.
              </p>
              <Button
                type="button"
                size="sm"
                className="w-full bg-[#b59a5b] text-xs font-bold text-[#0a1f1a] hover:bg-[#c9ad6e]"
                onClick={confirmGuide}
              >
                Simulasi Cepat: Pemandu Konfirmasi
              </Button>
            </div>
          )}

          {guideStatus === 'confirmed' && (
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Pemandu sudah mengonfirmasi booking.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
