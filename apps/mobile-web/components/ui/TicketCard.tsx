import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, formatPeso, requestStatusTone, shadow, type RequestStatus } from '@dokyu/shared';
import { AppText } from './AppText';
import { Badge } from './Badge';

export interface TicketCardProps {
  requestNo: string;
  documentName: string;
  barangayName: string;
  status: RequestStatus;
  /** centavos */
  fee: number;
  /** The QR claim code goes here in Phase 5 (react-native-qrcode-svg). */
  qr?: React.ReactNode;
  /** Background behind the ticket, so the notches look cut out. */
  pageColor?: string;
}

/** Barangay claim stub: a ticket with a perforated edge, the request number and the status. */
export function TicketCard({
  requestNo,
  documentName,
  barangayName,
  status,
  fee,
  qr,
  pageColor = colors.surface,
}: TicketCardProps) {
  const { t } = useTranslation();
  return (
    <View
      className="overflow-hidden rounded-card border border-line bg-surface"
      style={{ boxShadow: shadow.raised }}
      accessibilityLabel={`${documentName}, ${t('ticket.requestNo')} ${requestNo}, ${t(`status.${status}`)}`}
    >
      <View className="gap-2 bg-primary p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AppText variant="small" tone="inverse" style={{ opacity: 0.8 }}>
              {barangayName}
            </AppText>
            <AppText variant="title" tone="inverse">
              {documentName}
            </AppText>
          </View>
          <Badge tone={requestStatusTone(status)} label={t(`status.${status}`)} />
        </View>
        <View>
          <AppText
            variant="caption"
            weight="semibold"
            style={{ color: colors.goldBright, letterSpacing: 0.6 }}
          >
            {t('ticket.requestNo').toUpperCase()}
          </AppText>
          <AppText variant="h1" tone="inverse" style={{ letterSpacing: 1 }} selectable>
            {requestNo}
          </AppText>
        </View>
      </View>

      {/* Perforation: two notches and a dashed line */}
      <View className="flex-row items-center" style={{ height: 20 }}>
        <View
          className="h-5 w-5 rounded-full"
          style={{
            marginLeft: -10,
            backgroundColor: pageColor,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />
        <View
          className="mx-1 flex-1"
          style={{ borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.border }}
        />
        <View
          className="h-5 w-5 rounded-full"
          style={{
            marginRight: -10,
            backgroundColor: pageColor,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />
      </View>

      <View className="flex-row items-center gap-4 px-4 pb-4">
        <View className="flex-1 gap-1">
          <AppText variant="small" tone="muted">
            {t('ticket.fee')}
          </AppText>
          <AppText variant="title" tone="primaryDark">
            {fee === 0 ? t('common.free') : formatPeso(fee)}
          </AppText>
          <AppText variant="small" tone="muted">
            {qr ? t('ticket.showAtCounter') : t('ticket.qrSoon')}
          </AppText>
        </View>
        <View
          className="h-24 w-24 items-center justify-center rounded-lg bg-surface-alt"
          style={{ borderWidth: qr ? 0 : 2, borderStyle: 'dashed', borderColor: colors.border }}
        >
          {qr ?? (
            <AppText variant="caption" tone="subtle">
              QR
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
}
