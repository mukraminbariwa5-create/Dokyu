/** Family members whose papers you help with (plan §3.1 C). Kept on this device. */
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@dokyu/shared';
import { Screen } from '../../../components/ui/Screen';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ChoiceChip } from '../../../components/ui/ChoiceChip';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { BackLink } from '../../../components/ui/BackLink';
import { FadeIn } from '../../../lib/motion';
import { RELATIONS, useMyDocs, type Person, type Relation } from '../../../lib/mydocs';

export default function Family() {
  const { t } = useTranslation();
  const { people, docs, addPerson, removePerson } = useMyDocs();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Relation>('child');
  const [toRemove, setToRemove] = useState<Person | null>(null);

  return (
    <Screen>
      <BackLink label={t('nav.docs')} fallback="/docs" />
      <AppText variant="h1">{t('mydocs.family')}</AppText>
      <AppText variant="body" tone="muted">
        {t('mydocs.familyIntro')}
      </AppText>

      <Card className="gap-3">
        <Input label={t('mydocs.personName')} value={name} onChangeText={setName} maxLength={60} />
        <View className="flex-row flex-wrap gap-2">
          {RELATIONS.map((r) => (
            <ChoiceChip
              key={r}
              label={t(`mydocs.rel_${r}`)}
              selected={relation === r}
              onPress={() => setRelation(r)}
            />
          ))}
        </View>
        <Button
          label={t('mydocs.addPerson')}
          size="md"
          icon={<Icon name="plus" size={18} color="#FFFFFF" />}
          disabled={name.trim().length === 0}
          onPress={() => {
            addPerson(name, relation);
            setName('');
          }}
        />
      </Card>

      {people.map((p, n) => (
        <FadeIn key={p.id} delay={n * 40}>
          <Card className="flex-row items-center gap-3">
            <View
              className="items-center justify-center bg-primary-soft"
              style={{ width: 44, height: 44, borderRadius: 22 }}
            >
              <AppText variant="body" weight="bold" tone="primary">
                {p.name.slice(0, 1).toUpperCase()}
              </AppText>
            </View>
            <View className="flex-1">
              <AppText variant="body" weight="semibold">
                {p.name}
              </AppText>
              <AppText variant="caption" tone="muted">
                {t(`mydocs.rel_${p.relation}`)} ·{' '}
                {t('mydocs.docCount', { count: docs.filter((d) => d.personId === p.id).length })}
              </AppText>
            </View>
            <Button
              label={t('mydocs.remove')}
              variant="ghost"
              size="md"
              icon={<Icon name="trash" size={16} color={colors.danger} />}
              onPress={() => setToRemove(p)}
            />
          </Card>
        </FadeIn>
      ))}

      <ConfirmDialog
        visible={toRemove !== null}
        title={t('mydocs.removeTitle', { name: toRemove?.name ?? '' })}
        message={t('mydocs.removeText')}
        confirmLabel={t('mydocs.remove')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setToRemove(null)}
        onConfirm={() => {
          if (toRemove) removePerson(toRemove.id);
          setToRemove(null);
        }}
      />
    </Screen>
  );
}
