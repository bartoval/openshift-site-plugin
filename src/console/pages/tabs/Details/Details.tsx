import { FC, useCallback, useState } from 'react';

import {
  DEFAULT_ISSUER,
  DEFAULT_SERVICE_ACCOUNT,
  EMPTY_LINK_ACCESS,
  EMPTY_VALUE_SYMBOL,
  I18nNamespace
} from '@config/config';
import FormatOCPDateCell from '@core/components/FormatOCPDate';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import SkTable from '@core/components/SkTable';
import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { CrdStatusCondition, StatusSiteType } from '@interfaces/CRD_Base';
import { SKColumn, SKComponentProps } from '@interfaces/SkTable.interfaces';
import {
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Card,
  CardHeader,
  CardBody,
  Title,
  Button,
  Modal,
  ModalVariant,
  Icon
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, PenIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

import Header from './Header';
import SiteForm from '../../components/forms/SiteForm';
import Status from '../Links/Status';

const Details: FC<{ onGoTo: (page: number) => void }> = function ({ onGoTo }) {
  const { t } = useTranslation(I18nNamespace);
  const { data: sites } = useWatchedSkupperResource({ kind: 'Site' });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [visibleModalPros, setVisibleModalProps] = useState<Record<string, boolean>>({});

  const handleOpenModal = (props: Record<string, boolean>) => {
    setIsModalOpen(true);
    setVisibleModalProps(props);
  };

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const ConditionsColumns: SKColumn<CrdStatusCondition<StatusSiteType>>[] = [
    {
      name: t('Type'),
      prop: 'type',
      width: 20
    },
    {
      name: t('Status'),
      prop: 'status',
      width: 20,
      customCellName: 'StatusCell'
    },

    {
      name: t('Reason'),
      prop: 'reason',
      customCellName: 'ReasonCell'
    },
    {
      name: t('Message'),
      prop: 'message',
      customCellName: 'ValueOrEmptyCell'
    },
    {
      name: t('Updated'),
      prop: 'lastTransitionTime',
      customCellName: 'FormatOCPDateCell',
      modifier: 'fitContent'
    }
  ];

  const customSiteCells = {
    FormatOCPDateCell,
    ValueOrEmptyCell: ({ value, data }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) =>
      data.reason === 'Error' ? value : EMPTY_VALUE_SYMBOL,
    ReasonCell: ({ data }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) =>
      data.reason === 'Error' || data.reason === 'Pending' ? data.reason : EMPTY_VALUE_SYMBOL,
    StatusCell: ({ data }: SKComponentProps<CrdStatusCondition<StatusSiteType>>) => {
      if (data.reason === 'Error') {
        return (
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
        );
      }

      if (data.reason === 'Pending') {
        return EMPTY_VALUE_SYMBOL;
      }

      return (
        <Icon status="success">
          <CheckCircleIcon />
        </Icon>
      );
    }
  };

  const site = sites?.[0];

  return (
    <>
      <Card isPlain data-testid="details">
        <CardHeader>
          <Header site={site} t={t} />
        </CardHeader>

        <CardBody>
          <DescriptionList
            columnModifier={{
              default: '2Col'
            }}
          >
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
              <DescriptionListDescription>{site?.name}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('Link access')} <TooltipInfoButton content={t('tooltipSiteLinkAccess')} />
              </DescriptionListTerm>
              <DescriptionListDescription>
                {site?.linkAccess || EMPTY_LINK_ACCESS}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ linkAccess: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Service account')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.serviceAccount}` || DEFAULT_SERVICE_ACCOUNT}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ serviceAccount: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Default issuer')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.defaultIssuer}` || DEFAULT_ISSUER}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ defaultIssuer: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('tooltipHighAvailability')}</DescriptionListTerm>
              <DescriptionListDescription>
                {`${site?.ha}`}{' '}
                <Button
                  variant="plain"
                  onClick={() => handleOpenModal({ ha: true })}
                  icon={<PenIcon />}
                  isDisabled={!site?.isConfigured}
                />
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      <Card isPlain>
        <Status site={site} t={t} onGoTo={onGoTo} />
      </Card>
      <Card isPlain>
        <CardHeader>
          <Title headingLevel="h1">{t('Details')}</Title>
        </CardHeader>

        <CardBody>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Platform')}</DescriptionListTerm>
              <DescriptionListDescription>{`${site?.platform}` || EMPTY_VALUE_SYMBOL}</DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>{t('Created at')}</DescriptionListTerm>
              <DescriptionListDescription>
                {site?.isConfigured ? (
                  <FormatOCPDateCell value={new Date(site.creationTimestamp)} />
                ) : (
                  EMPTY_VALUE_SYMBOL
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>

      {site?.conditions && (
        <Card isPlain>
          <CardHeader>
            <Title headingLevel="h1">{t('Conditions')}</Title>
          </CardHeader>

          <CardBody>
            <SkTable
              columns={ConditionsColumns}
              rows={site?.conditions}
              alwaysShowPagination={false}
              isPlain
              customCells={customSiteCells}
              variant="compact"
            />
          </CardBody>
        </Card>
      )}
      <Modal
        title={t('Edit site')}
        variant={ModalVariant.medium}
        isOpen={isModalOpen}
        aria-label="Form edit site"
        showClose={false}
      >
        <SiteForm
          siteName={site?.name}
          linkAccess={site?.linkAccess}
          serviceAccount={site?.serviceAccount}
          defaultIssuer={site?.defaultIssuer}
          ha={site?.ha}
          show={visibleModalPros}
          resourceVersion={site?.resourceVersion}
          onCancel={handleClose}
        />
      </Modal>
    </>
  );
};

export default Details;
