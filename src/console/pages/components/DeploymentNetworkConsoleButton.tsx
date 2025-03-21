import { useEffect, useState } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { NamespaceManager } from '@config/db';
import ExternalLink from '@core/components/ExternalLink';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const groupVersionKind = {
  group: 'route.openshift.io',
  version: 'v1',
  kind: 'Route'
};

const groupVersionKindPod = {
  group: '',
  version: 'v1',
  kind: 'Pod'
};

interface RouteResource extends K8sResourceCommon {
  spec?: {
    host?: string;
    port?: {
      targetPort?: string;
    };
  };
  status?: {
    ingress?: unknown[];
  };
}

interface PodResource extends K8sResourceCommon {
  status?: {
    phase?: string;
  };
}

const POD_SELECTOR = { 'app.kubernetes.io/part-of': 'skupper-network-observer' };
const POD_LOADED_STATUS = 'Running';

const DeploymentNetworkConsoleButton = function () {
  const { t } = useTranslation(I18nNamespace);
  const [url, setUrl] = useState<string | undefined>();

  const watchResource = {
    groupVersionKind,
    namespace: NamespaceManager.getNamespace(),
    isList: false,
    selector: {
      matchLabels: POD_SELECTOR
    }
  };

  const watchResourcePod = {
    groupVersionKind: groupVersionKindPod,
    namespace: NamespaceManager.getNamespace(),
    isList: true,
    selector: {
      matchLabels: POD_SELECTOR
    }
  };

  const [route] = useK8sWatchResource<RouteResource>(watchResource);
  const [deployments] = useK8sWatchResource<PodResource[]>(watchResourcePod);

  const mutationCreate = useMutation({
    mutationFn: () => RESTApi.createDeployment()
  });

  const mutationDelete = useMutation({
    mutationFn: () => RESTApi.deleteDeployment(),
    onSuccess: () => {
      setUrl(undefined);
    }
  });

  const handleDeployConsole = async () => {
    mutationCreate.mutate();
  };

  const handleDeleteConsole = async () => {
    mutationDelete.mutate();
  };
  useEffect(() => {
    if (route?.spec?.host && route?.spec?.port?.targetPort) {
      const newUrl = route?.spec?.host ? `${route?.spec?.port?.targetPort}://${route?.spec?.host}` : undefined;
      setUrl(newUrl);
    }
  }, [route]);

  const deployment = deployments?.[0];
  const loaded = deployment?.status?.phase === POD_LOADED_STATUS && !!url;

  return (
    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      {!loaded && (
        <Button
          isDisabled={!!url && !!deployment?.status && !(deployment?.status?.phase === POD_LOADED_STATUS)}
          onClick={handleDeployConsole}
          isLoading={!!url && !!deployment?.status && !(deployment?.status?.phase === POD_LOADED_STATUS)}
          icon={<CubesIcon />}
        >
          {t('Deploy the Network Console')}
        </Button>
      )}

      {loaded && <ExternalLink href={url} text={t('Open the Network Console')} />}
      {loaded && (
        <Button onClick={handleDeleteConsole} variant="secondary" icon={<CubesIcon />}>
          {t('Delete the Network Console')}
        </Button>
      )}
    </Flex>
  );
};

export default DeploymentNetworkConsoleButton;
