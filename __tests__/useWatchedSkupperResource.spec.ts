import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useWatchedSkupperResource } from '../src/console/hooks/useSkupperWatchResource';
import { ISO8601Timestamp } from '../src/console/interfaces/CRD_Base';

const mockUseK8sWatchResource = vi.hoisted(() => vi.fn());

vi.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sWatchResource: mockUseK8sWatchResource
}));

const mockGetNamespace = vi.hoisted(() => vi.fn().mockReturnValue('test-namespace'));

vi.mock('../src/console/config/db', () => ({
  NamespaceManager: {
    getNamespace: mockGetNamespace
  }
}));

describe('useWatchedSkupperResource', () => {
  const mockTimestamp = '2024-02-01T12:00:00Z' as ISO8601Timestamp;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Site resource', () => {
    it('converts site data correctly', () => {
      const mockSiteData = {
        kind: 'SiteList',
        items: [
          {
            kind: 'Site',
            metadata: {
              uid: 'test-uid',
              name: 'test-site',
              namespace: 'test-namespace',
              resourceVersion: '1',
              creationTimestamp: mockTimestamp
            }
          }
        ]
      };

      mockUseK8sWatchResource.mockReturnValue([mockSiteData.items, true, '']);

      const { data, loaded, error } = useWatchedSkupperResource({
        kind: 'Site'
      });

      expect(loaded).toBe(true);
      expect(error).toBe('');
      expect(data?.[0]).toMatchObject({
        identity: 'test-uid',
        name: 'test-site'
      });
    });
  });

  describe('AccessGrant resource', () => {
    it('converts access grant data correctly', () => {
      const mockGrantData = {
        kind: 'AccessGrantList',
        items: [
          {
            kind: 'AccessGrant',
            metadata: {
              uid: 'grant-uid',
              name: 'test-grant',
              namespace: 'test-namespace',
              resourceVersion: '1',
              creationTimestamp: mockTimestamp
            },
            spec: {
              redemptionsAllowed: 1
            }
          }
        ]
      };

      mockUseK8sWatchResource.mockReturnValue([mockGrantData.items, true, '']);

      const { data } = useWatchedSkupperResource({
        kind: 'AccessGrant'
      });

      expect(data?.[0]).toMatchObject({
        id: 'grant-uid',
        name: 'test-grant'
      });
    });
  });

  describe('Error handling', () => {
    it('returns null data when error occurs', () => {
      mockUseK8sWatchResource.mockReturnValue([null, true, 'Error message']);

      const { data, loaded, error } = useWatchedSkupperResource({
        kind: 'Site'
      });

      expect(data).toBeNull();
      expect(loaded).toBe(true);
      expect(error).toBe('Error message');
    });

    it('returns null data when not loaded', () => {
      mockUseK8sWatchResource.mockReturnValue([null, false, '']);

      const { data, loaded, error } = useWatchedSkupperResource({
        kind: 'Site'
      });

      expect(data).toBeNull();
      expect(loaded).toBe(false);
      expect(error).toBe('');
    });
  });

  describe('Resource type handling', () => {
    it('handles single resource correctly', () => {
      const mockData = {
        kind: 'Listener',
        metadata: {
          uid: 'listener-uid',
          name: 'test-listener',
          namespace: 'test-namespace',
          resourceVersion: '1',
          creationTimestamp: mockTimestamp
        },
        spec: {
          routingKey: 'test-key',
          port: 8080
        }
      };

      mockUseK8sWatchResource.mockReturnValue([mockData, true, '']);

      const { data } = useWatchedSkupperResource({
        kind: 'Listener',
        isList: false
      });

      expect(Array.isArray(data)).toBe(true);
      expect(data?.[0]).toMatchObject({
        id: 'listener-uid',
        name: 'test-listener'
      });
    });
  });
});
