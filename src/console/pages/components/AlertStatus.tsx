import { I18nNamespace } from '@config/config';
import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

const AlertStatus = function () {
  const { t } = useTranslation(I18nNamespace);

  const { data: sites } = useWatchedSkupperResource({ kind: 'Site' });
  const site = sites?.[0];

  return (
    <>
      {site?.isConfigured && !site?.isReady && (
        <Alert
          data-testid="testid"
          variant="warning"
          isInline
          title={t(
            'The site is Configured: you can create resources, but until the router is ready the effect is not usable'
          )}
        />
      )}

      {site?.status === 'Error' && (
        <Alert
          variant="danger"
          isInline
          title={t('There is one or more errors. Please check the conditions on the Details page for more information')}
        />
      )}
    </>
  );
};

export default AlertStatus;
