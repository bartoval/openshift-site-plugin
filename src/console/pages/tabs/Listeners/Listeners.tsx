import { useCallback, useMemo, useState } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import SkTable from '@core/components/SkTable';
import StatusCell from '@core/components/StatusCell';
import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { Listener } from '@interfaces/REST.interfaces';
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
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  Card,
  CardBody
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import ListenerDetails from './ListenerDetails';
import LoadingPage from '../../../core/components/Loading';
import ListenerForm from '../../components/forms/ListenerForm';

const Listeners = function () {
  const { t } = useTranslation(I18nNamespace);

  const [isOpen, setIsOpen] = useState<boolean>();
  const [showAlert, setShowAlert] = useState<string>(sessionStorage.getItem('showListenerAlert') || 'show');
  const [nameSelected, setNameSelected] = useState<string | undefined>();

  const { data: listeners, loaded } = useWatchedSkupperResource({ kind: 'Listener' });

  const mutationDelete = useMutation({
    mutationFn: (name: string) => RESTApi.deleteListener(name),
    onSuccess: () => handleCloseDetails()
  });

  const handleDelete = useCallback(
    (name: string) => {
      mutationDelete.mutate(name);
    },
    [mutationDelete]
  );

  const handleModalClose = useCallback(() => {
    setIsOpen(undefined);
  }, []);

  const handleOpenDetails = useCallback((name: string) => {
    setNameSelected(name);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setNameSelected(undefined);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setShowAlert('hide');
    sessionStorage.setItem('showListenerAlert', 'hide');
  }, []);

  const Columns: SKColumn<Listener>[] = [
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
      name: t('Service name'),
      prop: 'serviceName'
    },
    {
      name: t('Port'),
      prop: 'port'
    },
    {
      name: t('Has connectors'),
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
      linkCell: ({ data }: SKComponentProps<Listener>) => (
        <Button variant="link" onClick={handleOpenDetails.bind(null, data.name)}>
          {data.name}
        </Button>
      ),
      StatusCell,
      connectedCell: ({ data }: SKComponentProps<Listener>) => `${data.connected}`,
      actions: ({ data }: SKComponentProps<Listener>) => (
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
        {nameSelected && <ListenerDetails name={nameSelected} onUpdate={handleModalClose} />}
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
                isInline
                actionClose={<AlertActionCloseButton onClose={handleCloseAlert} />}
                title={t(
                  'A listener is a local connection endpoint that is associated with remote servers. Listeners expose a host and port for accepting connections. Listeners use a routing key to forward connection data to remote connectors.'
                )}
              />
            )}
          </StackItem>

          <StackItem isFilled>
            <Button onClick={() => setIsOpen(true)}>{t('Create a listener')}</Button>{' '}
            <Drawer isExpanded={!!nameSelected} isInline>
              <DrawerContent panelContent={panelContent}>
                <DrawerContentBody>
                  <SkTable
                    columns={Columns}
                    rows={listeners || []}
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
          isOpen={!!isOpen}
          variant={ModalVariant.medium}
          aria-label="Form create listener"
          showClose={false}
        >
          <ListenerForm onSubmit={handleModalClose} onCancel={handleModalClose} title={t('Create a listener')} />
        </Modal>
      </CardBody>
    </Card>
  );
};

export default Listeners;
