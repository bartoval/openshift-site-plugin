import { API_VERSION, GROUP } from '@config/config';
import { describe, it, expect } from 'vitest';

import {
  createSiteData,
  createAccessGrantRequest,
  createAccessTokenRequest,
  createListenerRequest,
  createConnectorRequest
} from '../src/console/core/utils/createCRD';
import { AccessGrantParams } from '../src/console/interfaces/CRD_AccessGrant';
import { AccessTokenParams } from '../src/console/interfaces/CRD_AccessToken';
import { ConnectorParams } from '../src/console/interfaces/CRD_Connector';
import { ListenerParams } from '../src/console/interfaces/CRD_Listener';
import { SiteParams } from '../src/console/interfaces/CRD_Site';

const apiGroupVersion = `${GROUP}/${API_VERSION}`;

describe('CRD Creation Functions', () => {
  it('creates Site CRD data correctly', () => {
    const siteParams: SiteParams = {
      metadata: {
        name: 'test-site'
      },
      spec: {
        serviceAccount: 'skupper',
        defaultIssuer: 'test-issuer',
        ha: false
      }
    };

    const result = createSiteData(siteParams);

    expect(result).toEqual({
      apiVersion: apiGroupVersion,
      kind: 'Site',
      metadata: {
        name: 'test-site'
      },
      spec: {
        serviceAccount: 'skupper',
        defaultIssuer: 'test-issuer',
        ha: false
      }
    });
  });

  it('creates AccessGrant CRD request correctly', () => {
    const accessGrantParams: AccessGrantParams = {
      metadata: {
        name: 'test-access-grant'
      },
      spec: {
        redemptionsAllowed: 1,
        expirationWindow: '24h',
        code: 'test-code'
      }
    };

    const result = createAccessGrantRequest(accessGrantParams);

    expect(result).toEqual({
      apiVersion: apiGroupVersion,
      kind: 'AccessGrant',
      metadata: {
        name: 'test-access-grant'
      },
      spec: {
        redemptionsAllowed: 1,
        expirationWindow: '24h',
        code: 'test-code'
      }
    });
  });

  it('creates AccessToken CRD request correctly', () => {
    const accessTokenParams: AccessTokenParams = {
      metadata: {
        name: 'test-token'
      },
      spec: {
        linkCost: 1,
        url: 'test-url',
        code: 'test-code',
        ca: 'test-ca'
      }
    };

    const result = createAccessTokenRequest(accessTokenParams);

    expect(result).toEqual({
      apiVersion: apiGroupVersion,
      kind: 'AccessToken',
      metadata: {
        name: 'test-token'
      },
      spec: {
        linkCost: 1,
        url: 'test-url',
        code: 'test-code',
        ca: 'test-ca'
      }
    });
  });

  it('creates Listener CRD request correctly', () => {
    const listenerParams: ListenerParams = {
      metadata: {
        name: 'test-listener'
      },
      spec: {
        routingKey: 'test-key',
        port: 8080,
        host: 'localhost'
      }
    };

    const result = createListenerRequest(listenerParams);

    expect(result).toEqual({
      apiVersion: apiGroupVersion,
      kind: 'Listener',
      metadata: {
        name: 'test-listener'
      },
      spec: {
        routingKey: 'test-key',
        port: 8080,
        host: 'localhost'
      }
    });
  });

  it('creates Connector CRD request correctly', () => {
    const connectorParams: ConnectorParams = {
      metadata: {
        name: 'test-connector'
      },
      spec: {
        routingKey: 'test-key',
        port: 8080,
        includeNotReadyPods: false
      }
    };

    const result = createConnectorRequest(connectorParams);

    expect(result).toEqual({
      apiVersion: apiGroupVersion,
      kind: 'Connector',
      metadata: {
        name: 'test-connector'
      },
      spec: {
        routingKey: 'test-key',
        port: 8080,
        includeNotReadyPods: false
      }
    });
  });

  it('creates Site CRD with all optional fields', () => {
    const siteParams: SiteParams = {
      metadata: {
        name: 'test-site',
        resourceVersion: '123'
      },
      spec: {
        serviceAccount: 'skupper',
        defaultIssuer: 'test-issuer',
        ha: true,
        linkAccess: 'public',
        name: 'test-site-name'
      }
    };

    const result = createSiteData(siteParams);

    expect(result).toEqual({
      apiVersion: apiGroupVersion,
      kind: 'Site',
      metadata: {
        name: 'test-site',
        resourceVersion: '123'
      },
      spec: {
        serviceAccount: 'skupper',
        defaultIssuer: 'test-issuer',
        ha: true,
        linkAccess: 'public',
        name: 'test-site-name'
      }
    });
  });
});
