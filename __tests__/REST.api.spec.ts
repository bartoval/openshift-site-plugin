import { describe, it, expect, vi, beforeEach } from 'vitest';

import { axiosFetch } from '../src/console/API/apiMiddleware';
import { RESTApi } from '../src/console/API/REST.api';
import { AccessTokenCrdParams } from '../src/console/interfaces/CRD_AccessToken';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';
import { ListenerCrdParams } from '../src/console/interfaces/CRD_Listener';
import { SiteCrdParams } from '../src/console/interfaces/CRD_Site';

const mockAxiosFetch = vi.hoisted(() => vi.fn());

vi.mock('../src/console/API/apiMiddleware', () => ({ axiosFetch: mockAxiosFetch }));

describe('RESTApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosFetch.mockResolvedValue({});
  });

  describe('isOldVersion', () => {
    it('returns true when skupper instance is ready but no sites exist', async () => {
      mockAxiosFetch.mockImplementation((path) => {
        if (path.includes('deployments/skupper-router')) {
          return {
            status: {
              conditions: [{ status: 'True' }]
            }
          };
        }
        if (path.includes('sites')) {
          return { items: [] };
        }

        return Promise.resolve({});
      });

      const result = await RESTApi.isOldVersion();
      expect(result).toBe(true);
    });

    it('returns false when sites exist', async () => {
      mockAxiosFetch.mockImplementation((path) => {
        if (path.includes('deployments/skupper-router')) {
          return {
            status: {
              conditions: [{ status: 'True' }]
            }
          };
        }
        if (path.includes('sites')) {
          return {
            items: [
              {
                metadata: {
                  name: 'test-site',
                  uid: 'test-uid',
                  namespace: 'test-namespace',
                  resourceVersion: '1',
                  creationTimestamp: '2024-02-01T12:00:00Z' as ISO8601Timestamp
                }
              }
            ]
          };
        }

        return Promise.resolve({});
      });

      const result = await RESTApi.isOldVersion();
      expect(result).toBe(false);
    });
  });

  describe('createOrUpdateSite', () => {
    it('creates a new site when no name provided', async () => {
      const siteData: SiteCrdParams = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Site',
        metadata: { name: 'new-site' },
        spec: {
          serviceAccount: 'test-account',
          defaultIssuer: 'test-issuer',
          ha: false
        }
      };

      await RESTApi.createOrUpdateSite(siteData);

      expect(axiosFetch).toHaveBeenCalledWith(expect.stringContaining('sites'), {
        method: 'POST',
        data: siteData
      });
    });

    it('updates existing site when name provided', async () => {
      const siteName = 'existing-site';
      const siteData: SiteCrdParams = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Site',
        metadata: { name: siteName },
        spec: {
          serviceAccount: 'test-account',
          defaultIssuer: 'test-issuer',
          ha: false
        }
      };

      await RESTApi.createOrUpdateSite(siteData, siteName);

      expect(axiosFetch).toHaveBeenCalledWith(expect.stringContaining(`sites/${siteName}`), {
        method: 'PUT',
        data: siteData
      });
    });
  });

  describe('deleteSite', () => {
    it('deletes site and related resources when removeAllResources is true', async () => {
      await RESTApi.deleteSite('test-site', true);

      expect(axiosFetch).toHaveBeenCalledWith(expect.stringContaining('sites/test-site'), {
        method: 'DELETE'
      });
      expect(axiosFetch).toHaveBeenCalledWith(expect.stringContaining('accessgrants'), {
        method: 'DELETE'
      });
      expect(axiosFetch).toHaveBeenCalledWith(expect.stringContaining('links'), {
        method: 'DELETE'
      });
    });

    it('only deletes site when removeAllResources is false', async () => {
      await RESTApi.deleteSite('test-site', false);

      expect(axiosFetch).toHaveBeenCalledWith(expect.stringContaining('sites/test-site'), {
        method: 'DELETE'
      });
      expect(axiosFetch).not.toHaveBeenCalledWith(expect.stringContaining('accessgrants'));
      expect(axiosFetch).not.toHaveBeenCalledWith(expect.stringContaining('links'));
    });
  });

  describe('findSiteView', () => {
    it('returns null when no sites exist', async () => {
      mockAxiosFetch.mockResolvedValue({ items: [] });
      const result = await RESTApi.findSiteView();
      expect(result).toBeNull();
    });

    it('returns converted site when found', async () => {
      mockAxiosFetch.mockResolvedValue({
        items: [
          {
            metadata: {
              uid: 'test-uid',
              name: 'test-site',
              namespace: 'test',
              resourceVersion: '1',
              creationTimestamp: '2024-02-01T12:00:00Z' as ISO8601Timestamp
            },
            spec: {
              serviceAccount: 'sa',
              defaultIssuer: 'issuer',
              ha: false
            }
          }
        ]
      });

      const result = await RESTApi.findSiteView();
      expect(result).toMatchObject({
        identity: 'test-uid',
        name: 'test-site'
      });
    });
  });

  describe('createGrant', () => {
    it('creates grant with data', async () => {
      const grantData = {
        metadata: { name: 'test-grant' },
        spec: {
          redemptionsAllowed: 1,
          expirationWindow: '1h',
          code: 'test-code'
        }
      };

      await RESTApi.createGrant(grantData);
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('accessgrants'), {
        method: 'POST',
        data: grantData
      });
    });
  });

  describe('createAccessToken', () => {
    it('creates access token', async () => {
      const tokenData: AccessTokenCrdParams = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'AccessToken',
        metadata: { name: 'test-token' },
        spec: {
          linkCost: 1,
          url: 'test-url',
          code: 'test-code',
          ca: 'test-ca'
        }
      };

      await RESTApi.createAccessToken(tokenData);
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('accesstokens'), {
        method: 'POST',
        data: tokenData
      });
    });
  });

  describe('createOrUpdateListener', () => {
    it('creates new listener', async () => {
      const listenerData: ListenerCrdParams = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Listener',
        metadata: { name: 'test-listener' },
        spec: {
          routingKey: 'test-key',
          port: 8080
        }
      };

      await RESTApi.createOrUpdateListener(listenerData);
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('listeners'), {
        method: 'POST',
        data: listenerData
      });
    });

    it('updates existing listener', async () => {
      const listenerData: ListenerCrdParams = {
        apiVersion: 'skupper.io/v2alpha1',
        kind: 'Listener',
        metadata: { name: 'test-listener' },
        spec: {
          routingKey: 'test-key',
          port: 8080
        }
      };

      await RESTApi.createOrUpdateListener(listenerData, 'test-listener');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('listeners/test-listener'), {
        method: 'PUT',
        data: listenerData
      });
    });
  });

  describe('createDeployment', () => {
    it('creates all required deployment resources', async () => {
      await RESTApi.createDeployment();

      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('roles'), expect.any(Object));
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('rolebindings'), expect.any(Object));
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('certificates'), expect.any(Object));
    });

    it('handles 409 conflict errors', async () => {
      mockAxiosFetch.mockRejectedValueOnce({
        response: { status: 409 }
      });

      await expect(RESTApi.createDeployment()).resolves.not.toThrow();
    });
  });

  describe('deleteGrant', () => {
    it('deletes a grant', async () => {
      await RESTApi.deleteGrant('test-grant');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('accessgrants/test-grant'), {
        method: 'DELETE'
      });
    });
  });

  describe('deleteAccessToken', () => {
    it('deletes an access token', async () => {
      await RESTApi.deleteAccessToken('test-token');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('accesstokens/test-token'), {
        method: 'DELETE'
      });
    });
  });

  describe('deleteLink', () => {
    it('deletes a link', async () => {
      await RESTApi.deleteLink('test-link');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('links/test-link'), { method: 'DELETE' });
    });
  });

  describe('deleteListener', () => {
    it('deletes a listener', async () => {
      await RESTApi.deleteListener('test-listener');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('listeners/test-listener'), {
        method: 'DELETE'
      });
    });
  });

  describe('createOrUpdateConnector', () => {
    it('creates a new connector', async () => {
      const connectorData = {
        metadata: { name: 'test-connector' },
        spec: {
          routingKey: 'test-key',
          port: 8080,
          includeNotReadyPods: false
        }
      };
      await RESTApi.createOrUpdateConnector(connectorData);
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('connectors'), {
        method: 'POST',
        data: connectorData
      });
    });

    it('updates existing connector', async () => {
      const connectorData = {
        metadata: { name: 'test-connector' },
        spec: {
          routingKey: 'test-key',
          port: 8080,
          includeNotReadyPods: false
        }
      };
      await RESTApi.createOrUpdateConnector(connectorData, 'test-connector');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('connectors/test-connector'), {
        method: 'PUT',
        data: connectorData
      });
    });
  });

  describe('deleteConnector', () => {
    it('deletes a connector', async () => {
      await RESTApi.deleteConnector('test-connector');
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.stringContaining('connectors/test-connector'), {
        method: 'DELETE'
      });
    });
  });

  describe('error handling', () => {
    it('throws error for non-409 status codes', async () => {
      mockAxiosFetch.mockRejectedValueOnce({
        response: { status: 500 }
      });
      await expect(RESTApi.deleteDeployment()).rejects.toThrow();
    });
  });

  describe('deleteDeployment normal flow', () => {
    it('successfully deletes deployment with no errors', async () => {
      mockAxiosFetch.mockResolvedValue({});
      await RESTApi.deleteDeployment();
      expect(mockAxiosFetch).toHaveBeenCalledWith(expect.any(String), { method: 'DELETE' });
    });
  });
});
