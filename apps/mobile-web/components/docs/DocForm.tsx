/** Add or edit a tracked document. */
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GUIDES, OFFICES, colors, officesForGuide, pick } from '@dokyu/shared';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ChoiceChip } from '../ui/ChoiceChip';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DateField } from '../ui/DateField';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Input';
import {
  DOC_STATUSES,
  RELATIONS,
  useMyDocs,
  type DocStatus,
  type Relation,
  type TrackedDoc,
} from '../../lib/mydocs';
import { useSettings } from '../../lib/settings';

export function DocForm({
  existing,
  presetGuide,
}: {
  existing?: TrackedDoc;
  presetGuide?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useSettings();
  const { people, saveDoc, removeDoc, addPerson } = useMyDocs();

  const [guide, setGuide] = useState<string | undefined>(
    existing?.guide ?? (GUIDES.some((g) => g.slug === presetGuide) ? presetGuide : undefined),
  );
  const [custom, setCustom] = useState(existing?.title ?? '');
  const [isCustom, setIsCustom] = useState(Boolean(existing && !existing.guide));
  const [personId, setPersonId] = useState(existing?.personId ?? 'me');
  const [status, setStatus] = useState<DocStatus>(existing?.status ?? 'need');
  const [referenceNo, setReferenceNo] = useState(existing?.referenceNo ?? '');
  const [appointmentDate, setAppointmentDate] = useState(existing?.appointmentDate);
  const [appointmentTime, setAppointmentTime] = useState(existing?.appointmentTime);
  const [appointmentPlace, setAppointmentPlace] = useState(existing?.appointmentPlace ?? '');
  const [expires, setExpires] = useState(existing?.expires);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<Relation>('child');

  const placeSuggestions = guide ? officesForGuide(OFFICES, guide).slice(0, 3) : [];

  const save = async () => {
    if (!isCustom && !guide) {
      setError(t('mydocs.pickDocument'));
      return;
    }
    if (isCustom && custom.trim().length < 2) {
      setError(t('mydocs.nameDocument'));
      return;
    }
    setSaving(true);
    await saveDoc({
      id: existing?.id,
      guide: isCustom ? undefined : guide,
      title: isCustom ? custom.trim().slice(0, 80) : undefined,
      personId,
      status,
      referenceNo: referenceNo.trim() || undefined,
      appointmentDate,
      appointmentTime,
      appointmentPlace: appointmentPlace.trim() || undefined,
      expires,
      notes: notes.trim().slice(0, 500) || undefined,
    });
    setSaving(false);
    router.replace('/docs');
  };

  return (
    <View className="gap-5">
      <View className="gap-2">
        <AppText variant="title">{t('mydocs.which')}</AppText>
        <View className="flex-row flex-wrap gap-2">
          {GUIDES.map((g) => (
            <ChoiceChip
              key={g.slug}
              label={pick(g.title, language)}
              selected={!isCustom && guide === g.slug}
              onPress={() => {
                setIsCustom(false);
                setGuide(g.slug);
                setError('');
              }}
            />
          ))}
          <ChoiceChip
            label={t('mydocs.other')}
            selected={isCustom}
            onPress={() => {
              setIsCustom(true);
              setError('');
            }}
          />
        </View>
        {isCustom ? (
          <Input
            label={t('mydocs.otherName')}
            value={custom}
            onChangeText={setCustom}
            placeholder={t('mydocs.otherPlaceholder')}
            maxLength={80}
          />
        ) : null}
      </View>

      <View className="gap-2">
        <AppText variant="title">{t('mydocs.forWhom')}</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          <ChoiceChip
            label={t('mydocs.me')}
            selected={personId === 'me'}
            onPress={() => setPersonId('me')}
          />
          {people.map((p) => (
            <ChoiceChip
              key={p.id}
              label={p.name}
              selected={personId === p.id}
              onPress={() => setPersonId(p.id)}
            />
          ))}
          <ChoiceChip
            label={`+ ${t('mydocs.addPerson')}`}
            selected={false}
            onPress={() => setAdding(true)}
          />
        </ScrollView>
      </View>

      <View className="gap-2">
        <AppText variant="title">{t('mydocs.statusTitle')}</AppText>
        <View className="flex-row flex-wrap gap-2">
          {DOC_STATUSES.map((s) => (
            <ChoiceChip
              key={s}
              label={t(`mydocs.status_${s}`)}
              selected={status === s}
              onPress={() => setStatus(s)}
            />
          ))}
        </View>
      </View>

      <Card className="gap-4">
        <AppText variant="body" weight="semibold">
          {t('mydocs.appointment')}
        </AppText>
        <View className="flex-row flex-wrap gap-3">
          <DateField
            label={t('mydocs.date')}
            value={appointmentDate}
            onChange={setAppointmentDate}
          />
          <DateField
            label={t('mydocs.time')}
            value={appointmentTime}
            onChange={setAppointmentTime}
            mode="time"
          />
        </View>
        <Input
          label={t('mydocs.place')}
          value={appointmentPlace}
          onChangeText={setAppointmentPlace}
          maxLength={120}
        />
        {placeSuggestions.length && !appointmentPlace ? (
          <View className="flex-row flex-wrap gap-2">
            {placeSuggestions.map((o) => (
              <Button
                key={o.slug}
                label={o.name}
                variant="ghost"
                size="md"
                icon={<Icon name="pin" size={16} color={colors.primary} />}
                onPress={() => setAppointmentPlace(o.name)}
              />
            ))}
          </View>
        ) : null}
        <AppText variant="caption" tone="muted">
          {t('mydocs.reminderNote')}
        </AppText>
      </Card>

      <View className="flex-row flex-wrap gap-3">
        <View style={{ flexGrow: 1, minWidth: 180 }}>
          <Input
            label={t('mydocs.reference')}
            value={referenceNo}
            onChangeText={setReferenceNo}
            autoCapitalize="characters"
            maxLength={60}
          />
        </View>
        <DateField label={t('mydocs.expires')} value={expires} onChange={setExpires} />
      </View>

      <Input
        label={t('mydocs.notes')}
        value={notes}
        onChangeText={setNotes}
        multiline
        maxLength={500}
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      {error ? (
        <AppText variant="small" tone="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        <Button label={t('mydocs.save')} onPress={save} loading={saving} />
        {existing ? (
          <Button
            label={t('mydocs.delete')}
            variant="ghost"
            icon={<Icon name="trash" size={18} color={colors.danger} />}
            onPress={() => setConfirmDelete(true)}
          />
        ) : null}
      </View>

      <ConfirmDialog
        visible={confirmDelete}
        title={t('mydocs.deleteTitle')}
        message={t('mydocs.deleteText')}
        confirmLabel={t('mydocs.delete')}
        cancelLabel={t('common.cancel')}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (existing) removeDoc(existing.id);
          setConfirmDelete(false);
          router.replace('/docs');
        }}
      />

      <ConfirmDialog
        visible={adding}
        title={t('mydocs.addPerson')}
        confirmLabel={t('mydocs.add')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setAdding(false)}
        onConfirm={() => {
          if (newName.trim().length < 1) return;
          const p = addPerson(newName, newRelation);
          setPersonId(p.id);
          setNewName('');
          setAdding(false);
        }}
      >
        <Input
          label={t('mydocs.personName')}
          value={newName}
          onChangeText={setNewName}
          maxLength={60}
          autoFocus
        />
        <View className="flex-row flex-wrap gap-2">
          {RELATIONS.map((r) => (
            <ChoiceChip
              key={r}
              label={t(`mydocs.rel_${r}`)}
              selected={newRelation === r}
              onPress={() => setNewRelation(r)}
            />
          ))}
        </View>
      </ConfirmDialog>
    </View>
  );
}
