import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';

/** "Not affiliated with any government agency" (plan §4.2 originality rules). */
export function Disclaimer({ align = 'center' }: { align?: 'center' | 'left' }) {
  const { t } = useTranslation();
  return (
    <AppText variant="caption" tone="subtle" style={{ textAlign: align }}>
      {t('common.disclaimer')}
    </AppText>
  );
}
