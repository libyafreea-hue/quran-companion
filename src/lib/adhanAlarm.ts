import { registerPlugin } from '@capacitor/core';

// Native alarms own playback: no web view or network is required at prayer time.
export const AdhanAlarm = registerPlugin<{
  schedule(options: { alarms: { id: number; at: number; title: string }[] }): Promise<void>;
  stop(): Promise<void>;
}>('AdhanAlarm');