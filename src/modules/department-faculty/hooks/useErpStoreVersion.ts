import { useSyncExternalStore } from 'react';
import { erpService } from '../services/erpService';

export function useErpStoreVersion(): number {
  return useSyncExternalStore(
    erpService.subscribe,
    erpService.getVersion,
    erpService.getVersion
  );
}

