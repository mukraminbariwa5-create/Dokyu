/** Web: phones get local notifications (lib/reminders.ts); the web shows the same reminders inside My Docs. */
import type { TrackedDoc } from './mydocs';

export async function scheduleReminders(_doc: TrackedDoc): Promise<string[]> {
  return [];
}

export async function cancelReminders(_ids: string[]): Promise<void> {}
