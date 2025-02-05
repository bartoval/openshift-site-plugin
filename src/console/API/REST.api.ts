import { AccessGrantCrdResponse, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { AccessTokenCrdParams, AccessTokenCrdResponse } from '@interfaces/CRD_AccessToken';
import { ConnectorCrdResponse, ConnectorParams } from '@interfaces/CRD_Connector';
import { ListenerCrdParams, ListenerCrdResponse } from '@interfaces/CRD_Listener';
import { SiteCrdParams, SiteCrdResponse } from '@interfaces/CRD_Site';

import { axiosFetch } from './apiMiddleware';
import {
  deploymentPath,
  sitePath,
  sitesPath,
  accessGrantPath,
  accessGrantsPath,
  linksPath,
  accessTokensPath,
  accessTokenPath,
  listenerPath,
  listenersPath,
  connectorsPath,
  connectorPath,
  certificatePath,
  rolePath,
  roleBindPath,
  deploymentsPath,
  servicePath,
  serviceAccountPath,
  configMapPath,
  routePath,
  linkPath
} from './REST.paths';
import { convertSiteCRToSite } from './REST.utils';
import certificateData from '../deployment/Certificate.json';
import configMapPromData from '../deployment/ConfigMap-Prom.json';
import configMapData from '../deployment/ConfigMap.json';
import deploymentPromData from '../deployment/Deployment-Prom.json';
import deploymentData from '../deployment/Deployment.json';
import roleData from '../deployment/Role.json';
import roleBindingData from '../deployment/RoleBinding.json';
import RouteData from '../deployment/Route.json';
import servicePromData from '../deployment/Service-Prom.json';
import serviceData from '../deployment/Service.json';
import serviceAccountData from '../deployment/ServiceAccount.json';
import { ListCrdResponse, PartialDeploymentResponse } from '../interfaces/CRD_Base';
import { SiteView } from '../interfaces/REST.interfaces';

export const RESTApi = {
  isOldVersion: async (): Promise<boolean> => {
    const [skupperInstance, sites] = await Promise.all([
      axiosFetch<PartialDeploymentResponse>(deploymentPath('skupper-router')),
      RESTApi.getSites()
    ]);

    const skupperProgresses = skupperInstance.status.conditions;

    if (skupperProgresses && skupperProgresses[0].status === 'True' && !sites.items.length) {
      return true;
    }

    return false;
  },
  getSites: async (): Promise<ListCrdResponse<SiteCrdResponse>> =>
    axiosFetch<ListCrdResponse<SiteCrdResponse>>(sitesPath()),

  findSiteView: async (): Promise<SiteView | null> => {
    const sites = await RESTApi.getSites();

    if (!sites.items.length) {
      return null;
    }

    return convertSiteCRToSite(sites.items[0]);
  },

  createOrUpdateSite: async (data: SiteCrdParams, name?: string): Promise<SiteCrdResponse> => {
    const path = name ? `${sitePath(name)}` : sitesPath();
    const method = name ? 'PUT' : 'POST';

    const response = await axiosFetch<SiteCrdResponse>(path, {
      method,
      data
    });

    return response;
  },

  deleteSite: async (name: string, removeAllResources: boolean): Promise<void> => {
    await axiosFetch<SiteCrdResponse>(sitePath(name), {
      method: 'DELETE'
    });

    RESTApi.deleteDeployment();

    if (removeAllResources) {
      await Promise.all([
        axiosFetch(accessGrantsPath(), {
          method: 'DELETE'
        }),
        axiosFetch(accessTokensPath(), {
          method: 'DELETE'
        }),
        axiosFetch(linksPath(), {
          method: 'DELETE'
        }),
        axiosFetch(listenersPath(), {
          method: 'DELETE'
        }),
        axiosFetch(connectorsPath(), {
          method: 'DELETE'
        })
      ]);
    }
  },

  createGrant: async (data?: AccessGrantParams): Promise<AccessGrantCrdResponse> =>
    axiosFetch<AccessGrantCrdResponse>(accessGrantsPath(), {
      method: 'POST',
      data
    }),

  deleteGrant: async (name: string): Promise<void> => {
    await axiosFetch<AccessGrantCrdResponse>(accessGrantPath(name), {
      method: 'DELETE'
    });
  },

  createAccessToken: async (data?: AccessTokenCrdParams): Promise<void> =>
    axiosFetch<void>(accessTokensPath(), {
      method: 'POST',
      data
    }),

  deleteAccessToken: async (name: string): Promise<void> => {
    await axiosFetch<AccessTokenCrdResponse>(accessTokenPath(name), {
      method: 'DELETE'
    });
  },

  deleteLink: async (name: string): Promise<void> => {
    await axiosFetch<void>(linkPath(name), {
      method: 'DELETE'
    });
  },
  createOrUpdateListener: async (data?: ListenerCrdParams, name?: string): Promise<'Updated' | 'Created'> => {
    const path = name ? `${listenerPath(name)}` : listenersPath();
    const method = name ? 'PUT' : 'POST';

    await axiosFetch<ListenerCrdResponse>(path, {
      method,
      data
    });

    return method === 'PUT' ? 'Updated' : 'Created';
  },

  deleteListener: async (name: string): Promise<void> => {
    await axiosFetch<void>(listenerPath(name), {
      method: 'DELETE'
    });
  },

  createOrUpdateConnector: async (data?: ConnectorParams, name?: string): Promise<'Updated' | 'Created'> => {
    const path = name ? `${connectorPath(name)}` : connectorsPath();
    const method = name ? 'PUT' : 'POST';

    await axiosFetch<ConnectorCrdResponse>(path, {
      method,
      data
    });

    return method === 'PUT' ? 'Updated' : 'Created';
  },

  deleteConnector: async (name: string): Promise<void> => {
    await axiosFetch<void>(connectorPath(name), {
      method: 'DELETE'
    });
  },

  createDeployment: async (): Promise<void> => {
    const requests = [
      { path: rolePath(), data: roleData },
      { path: roleBindPath(), data: roleBindingData },
      { path: certificatePath(), data: certificateData },
      { path: deploymentsPath(), data: deploymentData },
      { path: deploymentsPath(), data: deploymentPromData },
      { path: servicePath(), data: serviceData },
      { path: servicePath(), data: servicePromData },
      { path: serviceAccountPath(), data: serviceAccountData },
      { path: configMapPath(), data: configMapData },
      { path: configMapPath(), data: configMapPromData },
      { path: routePath(), data: RouteData }
    ];

    const promises = requests.map(({ path, data }) =>
      axiosFetch(path, {
        method: 'POST',
        data
      }).catch((error) => {
        if (error.response && error.response.status === 409) {
          return null;
        }
        throw error;
      })
    );

    await Promise.all(promises);
  },
  // TODO : wait for a BE solution. Just for dev scope
  deleteDeployment: async (): Promise<void> => {
    const requests = [
      { path: `${routePath()}/${RouteData.metadata.name}` },
      { path: `${rolePath()}/${roleData.metadata.name}` },
      { path: `${roleBindPath()}/${roleBindingData.metadata.name}` },
      { path: `${certificatePath()}/${certificateData.metadata.name}` },
      { path: `${deploymentsPath()}/${deploymentData.metadata.name}` },
      { path: `${deploymentsPath()}/${deploymentPromData.metadata.name}` },
      { path: `${servicePath()}/${serviceData.metadata.name}` },
      { path: `${servicePath()}/${servicePromData.metadata.name}` },
      { path: `${serviceAccountPath()}/${serviceAccountData.metadata.name}` },
      { path: `${configMapPath()}/${configMapData.metadata.name}` },
      { path: `${configMapPath()}/${configMapPromData.metadata.name}` }
    ];

    const promises = requests.map(({ path }) =>
      axiosFetch(path, {
        method: 'DELETE'
      }).catch((error) => {
        if (error.response && error.response.status === 409) {
          return null;
        }
        throw error;
      })
    );

    await Promise.all(promises);
  }
};
