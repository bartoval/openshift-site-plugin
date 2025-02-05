import { describe, it, expect } from 'vitest';

import {
  convertAccessGrantCRsToAccessGrants,
  convertAccessGrantCRToAccessGrant,
  convertAccessTokenCRToLink,
  convertConnectorCRToConnector,
  convertLinkCRToLink,
  convertListenerCRToListener,
  convertSiteCRToSite
} from '../src/console/API/REST.utils';
import { EMPTY_VALUE_SYMBOL } from '../src/console/config/config';
import { AccessGrantCrdResponse } from '../src/console/interfaces/CRD_AccessGrant';
import { AccessTokenCrdResponse } from '../src/console/interfaces/CRD_AccessToken';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';
import { ConnectorCrdResponse } from '../src/console/interfaces/CRD_Connector';
import { LinkCrdResponse } from '../src/console/interfaces/CRD_Link';
import { ListenerCrdResponse } from '../src/console/interfaces/CRD_Listener';
import { SiteCrdResponse } from '../src/console/interfaces/CRD_Site';

describe('REST.utils', () => {
  const timestamp = '2024-02-01T12:00:00Z' as ISO8601Timestamp;

  describe('convertSiteCRToSite', () => {
    it('converts a site CR to SiteView correctly', () => {
      const siteCR: SiteCrdResponse = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Site',
        metadata: {
          uid: 'test-uid',
          name: 'test-site',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: '2024-02-01T12:00:00Z' as ISO8601Timestamp
        },
        spec: {
          linkAccess: 'public',
          serviceAccount: 'test-account',
          defaultIssuer: 'test-issuer',
          ha: true
        },
        status: {
          status: 'Ready',
          message: 'Site is ready',
          conditions: [
            {
              type: 'Configured',
              status: 'True',
              lastTransitionTime: '2024-02-01T12:00:00Z' as ISO8601Timestamp,
              message: 'Site configured',
              observedGeneration: 1,
              reason: 'Configured'
            },
            {
              type: 'Ready',
              status: 'True',
              lastTransitionTime: '2024-02-01T12:00:00Z' as ISO8601Timestamp,
              message: 'Site ready',
              observedGeneration: 1,
              reason: 'Ready'
            }
          ],
          network: [
            {
              id: 'test-uid',
              name: 'test-site',
              namespace: 'test-namespace',
              platform: 'kubernetes',
              version: '1.0',
              links: []
            }
          ],
          sitesInNetwork: 1
        }
      };

      const result = convertSiteCRToSite(siteCR);

      expect(result.identity).toBe('test-uid');
      expect(result.name).toBe('test-site');
      expect(result.linkAccess).toBe('public');
      expect(result.isConfigured).toBe(true);
      expect(result.isReady).toBe(true);
      expect(result.statusAlert).toBe('success');
    });
  });

  describe('convertListenerCRToListener', () => {
    it('converts a listener CR to Listener correctly', () => {
      const listenerCR: ListenerCrdResponse = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Listener',
        metadata: {
          uid: 'listener-uid',
          name: 'test-listener',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: '2024-02-01T12:00:00Z' as ISO8601Timestamp
        },
        spec: {
          routingKey: 'test-key',
          port: 8080,
          host: 'test-host'
        },
        status: {
          status: 'Ready',
          message: 'Listener is ready',
          hasMatchingConnector: true,
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              lastTransitionTime: '2024-02-01T12:00:00Z' as ISO8601Timestamp,
              message: 'Listener ready',
              observedGeneration: 1,
              reason: 'Ready'
            }
          ]
        }
      };

      const result = convertListenerCRToListener(listenerCR);

      expect(result.id).toBe('listener-uid');
      expect(result.routingKey).toBe('test-key');
      expect(result.connected).toBe(true);
      expect(result.statusAlert).toBe('success');
    });
  });

  describe('convertConnectorCRToConnector', () => {
    it('converts a connector CR to Connector correctly', () => {
      const connectorCR: ConnectorCrdResponse = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Connector',
        metadata: {
          uid: 'connector-uid',
          name: 'test-connector',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: '2024-02-01T12:00:00Z' as ISO8601Timestamp
        },
        spec: {
          routingKey: 'test-key',
          port: 8080,
          host: 'test-host',
          selector: 'app=test',
          includeNotReadyPods: false
        },
        status: {
          status: 'Ready',
          message: 'Connector is ready',
          hasMatchingListener: true,
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              lastTransitionTime: '2024-02-01T12:00:00Z' as ISO8601Timestamp,
              message: 'Connector ready',
              observedGeneration: 1,
              reason: 'Ready'
            }
          ]
        }
      };

      const result = convertConnectorCRToConnector(connectorCR);

      expect(result.id).toBe('connector-uid');
      expect(result.routingKey).toBe('test-key');
      expect(result.connected).toBe(true);
      expect(result.statusAlert).toBe('success');
    });
  });

  describe('Access Grant conversion', () => {
    it('converts access grant CR correctly', () => {
      const accessGrantCR: AccessGrantCrdResponse = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'AccessGrant',
        metadata: {
          uid: 'grant-uid',
          name: 'test-grant',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: timestamp
        },
        spec: {
          redemptionsAllowed: 1,
          expirationWindow: '24h',
          code: 'test-code'
        },
        status: {
          status: 'Ready',
          message: 'Grant ready',
          redemptions: 0,
          code: 'test-code',
          url: 'test-url',
          ca: 'test-ca',
          expirationTime: timestamp,
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              lastTransitionTime: timestamp,
              message: 'Ready',
              observedGeneration: 1,
              reason: 'Ready'
            }
          ]
        }
      };

      const result = convertAccessGrantCRToAccessGrant(accessGrantCR);
      expect(result.id).toBe('grant-uid');
      expect(result.redemptionsAllowed).toBe(1);
      expect(result.redemptions).toBe(0);
      expect(result.statusAlert).toBe('success');
    });

    it('converts multiple access grants', () => {
      const grants: AccessGrantCrdResponse[] = [
        {
          apiVersion: 'skupper.io/v2alpha1',
          kind: 'AccessGrant',
          metadata: {
            uid: 'grant1',
            name: 'grant1',
            namespace: 'test-namespace',
            resourceVersion: '1',
            creationTimestamp: timestamp
          },
          spec: {
            redemptionsAllowed: 1,
            expirationWindow: '24h',
            code: 'test-code'
          }
        },
        {
          apiVersion: 'skupper.io/v2alpha1',
          kind: 'AccessGrant',
          metadata: {
            uid: 'grant2',
            name: 'grant2',
            namespace: 'test-namespace',
            resourceVersion: '1',
            creationTimestamp: timestamp
          },
          spec: {
            redemptionsAllowed: 1,
            expirationWindow: '24h',
            code: 'test-code'
          }
        }
      ];

      const results = convertAccessGrantCRsToAccessGrants(grants);
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('grant1');
      expect(results[1].id).toBe('grant2');
    });
  });

  describe('Link conversions', () => {
    it('converts link CR correctly', () => {
      const linkCR: LinkCrdResponse = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Link',
        metadata: {
          uid: 'link-uid',
          name: 'test-link',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: timestamp
        },
        spec: {
          endpoints: [],
          cost: 1
        },
        status: {
          status: 'Ready',
          message: 'Link ready',
          remoteSiteName: 'remote-site',
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              lastTransitionTime: timestamp,
              message: 'Ready',
              observedGeneration: 1,
              reason: 'Ready'
            }
          ]
        }
      };

      const result = convertLinkCRToLink(linkCR);
      expect(result.id).toBe('link-uid');
      expect(result.cost).toBe(1);
      expect(result.connectedTo).toBe('remote-site');
    });

    it('converts access token to link correctly', () => {
      const tokenCR: AccessTokenCrdResponse = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'AccessToken',
        metadata: {
          uid: 'token-uid',
          name: 'test-token',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: timestamp
        },
        spec: {
          linkCost: 1,
          url: 'test-url',
          code: 'test-code',
          ca: 'test-ca'
        }
      };

      const result = convertAccessTokenCRToLink(tokenCR);
      expect(result.id).toBe('token-uid');
      expect(result.cost).toBe(EMPTY_VALUE_SYMBOL);
      expect(result.connectedTo).toBe(EMPTY_VALUE_SYMBOL);
    });
  });
});
