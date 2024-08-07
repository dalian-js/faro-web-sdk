import { createRoutesFromChildren, matchRoutes, Routes, useLocation, useNavigationType } from 'react-router-dom';

import {
  initializeFaro as coreInit,
  getWebInstrumentations,
  ReactIntegration,
  ReactRouterVersion,
} from '@grafana/faro-react';
import type { Faro } from '@grafana/faro-react';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

import { env } from '../utils';

export function initializeFaro(): Faro {
  const faro = coreInit({
    url: `http://localhost:${env.faro.portAppReceiver}/collect`,
    apiKey: env.faro.apiKey,
    trackWebVitalsAttribution: true,
    instrumentations: [
      ...getWebInstrumentations({
        captureConsole: true,
      }),

      new TracingInstrumentation({
        instrumentationOptions: {
          fetchInstrumentationOptions: {
            applyCustomAttributesOnSpan: () => {
              console.log('fetchInstrumentationOptions: applyCustomAttributesOnSpan');
            },
          },
          xhrInstrumentationOptions: {
            applyCustomAttributesOnSpan: () => {
              console.log('xhrInstrumentationOptions: applyCustomAttributesOnSpan');
            },
          },
        },
      }),
      new ReactIntegration({
        router: {
          version: ReactRouterVersion.V6,
          dependencies: {
            createRoutesFromChildren,
            matchRoutes,
            Routes,
            useLocation,
            useNavigationType,
          },
        },
      }),
    ],
    app: {
      name: env.client.packageName,
      namespace: env.client.packageNamespace,
      version: env.package.version,
      environment: env.mode.name,
    },
  });

  faro.api.pushLog(['Faro was initialized']);

  return faro;
}
