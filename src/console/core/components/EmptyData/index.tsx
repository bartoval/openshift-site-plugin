import { ComponentType, FC } from 'react';

import { I18nNamespace } from '@config/config';
import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface EmptyDataProps {
  message?: string;
  description?: string;
  icon?: ComponentType;
}

const EmptyData: FC<EmptyDataProps> = function ({ message, description, icon }) {
  const { t } = useTranslation(I18nNamespace);

  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.lg} isFullHeight data-testid="sk-emptydata">
        {icon && <EmptyStateIcon icon={icon} />}
        <Title headingLevel="h2" size="lg">
          {message || t('Data not found')}
        </Title>
        {description && <EmptyStateBody>{description}</EmptyStateBody>}
      </EmptyState>
    </Bullseye>
  );
};

export default EmptyData;
