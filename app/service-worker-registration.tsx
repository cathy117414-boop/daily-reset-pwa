"use client";

import { useEffect } from "react";
import { registerPwaUpdates } from '../src/registerServiceWorker';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return registerPwaUpdates('/');
  }, []);

  return null;
}
