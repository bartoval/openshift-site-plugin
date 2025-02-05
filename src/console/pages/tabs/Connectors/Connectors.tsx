import { useCallback, useMemo, useState } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { Connector } from '@interfaces/REST.interfaces';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
import {
  Button,
  Modal,
  ModalVariant,
  Alert,
  Stack,
  StackItem,
  AlertActionCloseButton,
  DrawerPanelContent,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
  DrawerHead,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Card,
  CardBody
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import ConnectorDetails from './ConnectorDetails';
import LoadingPage from '../../../core/components/Loading';
import ConnectorForm from '../../components/forms/ConnectorForm';

const Connectors = function () {
  const { t } = useTranslation(I18nNamespace);

  const [areDetailsOpen, setAreDetailsOpen] = useState<boolean>(false);
  const [nameSelected, setNameSelected] = useState<string | undefined>();
  const [showAlert, setShowAlert] = useState<string>(sessionStorage.getItem('showConnectorAlert') || 'show');

  const { data: connectors, loaded } = useWatchedSkupperResource({ kind: 'Connector' });

  const mutationDelete = useMutation({
    mutationFn: (name: string) => RESTApi.deleteConnector(name),
    onSuccess: () => handleCloseDetails()
  });

  const handleDelete = useCallback(
    (name: string) => {
      mutationDelete.mutate(name);
    },
    [mutationDelete]
  );

  const handleModalClose = useCallback(() => {
    setAreDetailsOpen(false);
  }, []);

  const handleOpenDetails = useCallback((name: string) => {
    setNameSelected(name);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setNameSelected(undefined);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setShowAlert('hide');
    sessionStorage.setItem('showConnectorAlert', 'hide');
  }, []);

  const Columns: SKColumn<Connector>[] = [
    {
      name: t('Name'),
      prop: 'name',
      customCellName: 'linkCell'
    },
    {
      name: t('Status'),
      prop: 'status',
      customCellName: 'StatusCell'
    },
    {
      name: t('Message'),
      prop: 'statusMessage'
    },
    {
      name: t('Routing key'),
      prop: 'routingKey'
    },
    {
      name: t('Selector'),
      prop: 'selector'
    },
    {
      name: t('Host'),
      prop: 'host'
    },
    {
      name: t('Port'),
      prop: 'port'
    },
    {
      name: t('Has listeners'),
      prop: 'connected',
      customCellName: 'connectedCell'
    },
    {
      name: '',
      customCellName: 'actions',
      modifier: 'fitContent'
    }
  ];

  const customCells = useMemo(
    () => ({
      linkCell: ({ data }: SKComponentProps<Connector>) => (
        <Button variant="link" onClick={handleOpenDetails.bind(null, data.name)}>
          {data.name}
        </Button>
      ),
      StatusCell,
      connectedCell: ({ data }: SKComponentProps<Connector>) => `${data.connected}`,
      actions: ({ data }: SKComponentProps<Connector>) => (
        <Button onClick={handleDelete.bind(null, data.name)} variant="link">
          {t('Delete')}
        </Button>
      )
    }),
    [handleDelete, handleOpenDetails, t]
  );

  const panelContent = (
    <DrawerPanelContent isResizable minSize="30%">
      <DrawerHead>
        <DrawerActions>
          <DrawerCloseButton onClick={handleCloseDetails} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        {nameSelected && <ConnectorDetails name={nameSelected} onUpdate={handleModalClose} />}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  if (!loaded) {
    return <LoadingPage />;
  }

  return (
    <Card isPlain isFullHeight>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            {showAlert === 'show' && (
              <Alert
                hidden={true}
                variant="info"
                actionClose={<AlertActionCloseButton onClose={handleCloseAlert} />}
                isInline
                title={t(
                  'A connector binds local servers (pods, containers, or processes) to connection listeners in remote sites. Connectors are linked to listeners by a matching routing key.'
                )}
              />
            )}
          </StackItem>

          <StackItem isFilled>
            <Button onClick={() => setAreDetailsOpen(true)}>{t('Create a connector')}</Button>{' '}
            <Drawer isExpanded={!!nameSelected} isInline>
              <DrawerContent panelContent={panelContent}>
                <DrawerContentBody>
                  <SkTable
                    columns={Columns}
                    rows={connectors || []}
                    alwaysShowPagination={false}
                    customCells={customCells}
                    isPlain
                  />
                </DrawerContentBody>
              </DrawerContent>
            </Drawer>
          </StackItem>
        </Stack>

        <Modal
          hasNoBodyWrapper
          isOpen={areDetailsOpen}
          variant={ModalVariant.medium}
          aria-label="Form create connector"
          showClose={false}
        >
          <ConnectorForm onSubmit={handleModalClose} onCancel={handleModalClose} title={t('Create a Connector')} />
        </Modal>
      </CardBody>
    </Card>
  );
};

export default Connectors;
