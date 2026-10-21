import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export const Compass = registerPlugin<{
  start(options: { latitude: number; longitude: number }): Promise<void>;
  stop(): Promise<void>;
  addListener(event: 'heading', callback: (data: { heading: number; accuracy: number }) => void): Promise<PluginListenerHandle>;
}>('Compass');