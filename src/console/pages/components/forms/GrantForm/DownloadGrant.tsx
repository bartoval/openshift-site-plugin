import { FC, useCallback } from 'react';

import cStep1 from '@assets/cstep1.png';
import cStep2 from '@assets/cstep2.png';
import cStep3 from '@assets/cstep3.png';
import { I18nNamespace } from '@config/config';
import InstructionBlock from '@core/components/InstructionBlock';
import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { Button, Title, Stack, StackItem, Spinner } from '@patternfly/react-core';
import { DownloadIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { stringify } from 'yaml';

export const DownloadGrant: FC<{
  name?: string;
}> = function ({ name = '' }) {
  const { t } = useTranslation(I18nNamespace);

  const { data: grants } = useWatchedSkupperResource({ kind: 'AccessGrant', isList: false, name });
  const grant = grants?.[0]?.rawData;

  const handleDownload = useCallback(() => {
    if (grant) {
      const blob = new Blob([stringify(grant)], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${grant.metadata.name}.yaml`;
      link.setAttribute('download', `${grant.metadata.name}.yaml`);

      document.body.appendChild(link).click();
      document.body.removeChild(link);
    }
  }, [grant]);

  const isDisabled = grant?.status?.status !== 'Ready';

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1">{t('Create token - How to')}</Title>
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep1}
          title={t('Step 1 - Download the grant file')}
          description={t('Click the button to download the grant file.')}
          component={
            <Button
              variant="link"
              onClick={handleDownload}
              style={{ paddingLeft: 0 }}
              icon={<DownloadIcon />}
              isDisabled={isDisabled}
            >
              <small>
                {isDisabled ? t('Generating the grant, please wait...') : t('Download the grant')}
                {isDisabled && <Spinner size="md" />}
              </small>
            </Button>
          }
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep2}
          title={t('Step 2 - Navigate to a remote Openshift cluster')}
          description={t('Access the plugin TAB of a remote OpenShift cluster to establish a link with this site.')}
        />
      </StackItem>

      <StackItem>
        <InstructionBlock
          img={cStep3}
          title={t('Step 3 - Upload the token file')}
          description={t(
            'Navigate to the Link section, then click on the Create Link button and follow the provided steps.'
          )}
        />
      </StackItem>
    </Stack>
  );
};
