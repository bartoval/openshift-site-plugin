import { FC, KeyboardEvent, MouseEvent, useEffect } from 'react';

import { I18nNamespace } from '@config/config';
import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

const MenuTabsMapKey = {
  getStarted: 0,
  details: 1,
  yaml: 2,
  links: 3,
  listeners: 4,
  connectors: 5
};

interface TabNavigationProps {
  activeTabKey: string | number;
  setActiveTabKey: (tabIndex: string | number) => void;
}

export const TabNavigation: FC<TabNavigationProps> = function ({ activeTabKey, setActiveTabKey }) {
  const { t } = useTranslation(I18nNamespace);

  const { data: sites } = useWatchedSkupperResource({ kind: 'Site' });
  const site = sites?.[0];

  const isConfigured = site?.isConfigured;

  useEffect(() => {
    if (site?.hasError) {
      setActiveTabKey(1);
    }
  }, [setActiveTabKey, site?.hasError, site?.isConfigured]);

  return (
    <Tabs
      mountOnEnter
      unmountOnExit
      activeKey={activeTabKey}
      onSelect={(_: MouseEvent | KeyboardEvent | MouseEvent, tabIndex: string | number) => setActiveTabKey(tabIndex)}
    >
      <Tab
        eventKey={MenuTabsMapKey.getStarted}
        title={<TabTitleText>{t('GetStartedTab')}</TabTitleText>}
        isDisabled={!isConfigured}
      />
      <Tab eventKey={MenuTabsMapKey.details} title={<TabTitleText>{t('DetailsTab')}</TabTitleText>} />
      <Tab eventKey={MenuTabsMapKey.yaml} title={<TabTitleText>{t('YamlTab')}</TabTitleText>} />
      <Tab
        eventKey={MenuTabsMapKey.links}
        title={<TabTitleText>{t('LinksTab')}</TabTitleText>}
        isDisabled={!isConfigured}
      />
      <Tab
        eventKey={MenuTabsMapKey.listeners}
        title={<TabTitleText>{t('ListenersTab')}</TabTitleText>}
        isDisabled={!isConfigured}
      />
      <Tab
        eventKey={MenuTabsMapKey.connectors}
        title={<TabTitleText>{t('ConnectorsTab')}</TabTitleText>}
        isDisabled={!isConfigured}
      />
    </Tabs>
  );
};
