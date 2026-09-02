import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { getDatabase } from '@/db/database';
import { getAllLedgerEntries } from '@/db/repositories/ledgerRepo';
import { getProfile } from '@/db/repositories/profileRepo';

export async function exportAllData(): Promise<{ ok: boolean; message: string }> {
  try {
    const [profile, ledger, db] = await Promise.all([
      getProfile(),
      getAllLedgerEntries(),
      getDatabase(),
    ]);

    const appStateRows = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM app_state',
    );
    const appState: Record<string, string> = {};
    for (const row of appStateRows) appState[row.key] = row.value;

    const payload = {
      app: 'GitGud',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      ledger,
      appState,
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const file = new File(Paths.document, `gitgud-backup-${stamp}.json`);
    file.write(JSON.stringify(payload, null, 2));

    if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export GitGud data',
      });
    }
    return { ok: true, message: `Backup written to ${file.uri}` };
  } catch (error) {
    console.error('Export failed', error);
    return { ok: false, message: 'Export failed. See logs.' };
  }
}

export async function exportLedger(): Promise<{ ok: boolean; message: string }> {
  try {
    const ledger = await getAllLedgerEntries();
    const payload = { app: 'GitGud', exportedAt: new Date().toISOString(), ledger };
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const file = new File(Paths.document, `gitgud-ledger-${stamp}.json`);
    file.write(JSON.stringify(payload, null, 2));
    if (Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export GitGud ledger' });
    }
    return { ok: true, message: `Ledger written to ${file.uri}` };
  } catch (error) {
    console.error('Ledger export failed', error);
    return { ok: false, message: 'Ledger export failed. See logs.' };
  }
}