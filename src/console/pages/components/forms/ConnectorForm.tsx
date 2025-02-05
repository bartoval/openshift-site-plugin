import { useState, FC, KeyboardEvent } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import { createConnectorRequest } from '@core/utils/createCRD';
import useValidatedInput from '@hooks/useValidation';
import { ConnectorCrdParams, ConnectorParams, ConnectorSpec } from '@interfaces/CRD_Connector';
import { HTTPError } from '@interfaces/REST.interfaces';
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
  FormAlert,
  Alert,
  Checkbox,
  Card,
  CardTitle,
  Title,
  CardBody
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface ConnectorCrdAttributes extends ConnectorSpec {
  name?: string;
  resourceVersion?: string;
}

const ConnectorForm: FC<{
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  connectorName?: string;
  attributes?: ConnectorCrdAttributes;
}> = function ({ onSubmit, onCancel, connectorName, attributes, title }) {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState(attributes?.name || '');
  const [routingKey, setRoutingKey] = useState(attributes?.routingKey || '');
  const [selector, setSelector] = useState(attributes?.selector || '');
  const [host, setHost] = useState(attributes?.host || '');
  const [port, setPort] = useState<number | string | undefined>(attributes?.port);
  const [tlsCredentials, setTlsCredentials] = useState(attributes?.tlsCredentials || '');
  const [includeNotReadyPods, setIncludeNotReadyPod] = useState(attributes?.includeNotReadyPods || false);

  const { validated, validateInput } = useValidatedInput();

  const mutationCreate = useMutation({
    mutationFn: (data: ConnectorParams) => RESTApi.createOrUpdateConnector(data, connectorName),
    onError: (data: HTTPError) => {
      validateInput(data.descriptionMessage);
    },
    onSuccess: onSubmit
  });

  const handleSubmit = () => {
    const key = selector ? 'selector' : 'host';
    const value = selector || host;

    const data: ConnectorCrdParams = createConnectorRequest({
      metadata: {
        name,
        resourceVersion: attributes?.resourceVersion
      },
      spec: {
        routingKey,
        [key]: value,
        port: Number(port),
        tlsCredentials,
        includeNotReadyPods
      }
    });

    mutationCreate.mutate(data);
  };

  const handleChangeName = (value: string) => {
    //validateInput(value, [validateRFC1123Subdomain]);
    setName(value);
  };

  const handleChangeSelector = (value: string) => {
    //validateInput(value, [startsWithApp, validateRFC1123Subdomain], false);
    setSelector(value);
  };

  const handleChangeHost = (value: string) => {
    //validateInput(value, [validateRFC1123SubdomainWithIP], false);
    setHost(value);
  };

  const handleChangeRoutingKey = (value: string) => {
    //validateInput(value, [validateRFC1123Subdomain]);
    setRoutingKey(value);
  };

  const handleChangePort = (value: string) => {
    //validateInput(value, [validatePort]);
    setPort(value);
  };

  const handleChangeTlsCredentials = (value: string) => {
    //validateInput(value, [validateRFC1123Subdomain]);
    setTlsCredentials(value);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !!(name && port)) {
      event.preventDefault(); // Prevents the default Enter key behavior
      handleSubmit();
    }
  };

  const canSubmit = !!(name && port); //&& !validated;

  return (
    <Card isPlain>
      <CardTitle>
        <Title headingLevel="h1">{t(title)}</Title>
      </CardTitle>
      <CardBody>
        <Form isHorizontal onKeyDown={handleKeyPress}>
          <FormGroup fieldId="name-input" isRequired label={t('Name')} title="">
            <TextInput
              aria-label="form name input"
              value={name}
              onChange={(_, value) => handleChangeName(value)}
              isDisabled={!!connectorName}
            />
          </FormGroup>

          <FormGroup fieldId="include-not-ready-checkbox">
            <Checkbox
              aria-label="form include not ready checkbox"
              id="include-not-ready checkbox"
              label={t('Include server pods that are not in the ready state')}
              onClick={() => setIncludeNotReadyPod(!includeNotReadyPods)}
              isChecked={includeNotReadyPods}
            />
          </FormGroup>

          <FormGroup
            fieldId="port-input"
            isRequired
            label={t('Port')}
            labelIcon={<TooltipInfoButton content={t('tooltipPort')} />}
            title=""
          >
            <TextInput aria-label="form port input" value={port} onChange={(_, value) => handleChangePort(value)} />
          </FormGroup>

          <FormGroup
            fieldId="routing-key-input"
            label={t('Routing key')}
            labelIcon={<TooltipInfoButton content={t('tooltipRoutingKey')} />}
            title=""
          >
            <TextInput
              aria-label="form routing key input"
              value={routingKey}
              onChange={(_, value) => handleChangeRoutingKey(value)}
            />
          </FormGroup>

          <FormGroup
            fieldId="selector-input"
            label={t('Selector')}
            labelIcon={<TooltipInfoButton content={t('tooltipConnectorSelector')} />}
            title=""
          >
            <TextInput
              aria-label="form selector input"
              value={selector}
              onChange={(_, value) => handleChangeSelector(value)}
              placeholder="app="
            />
          </FormGroup>

          <FormGroup
            fieldId="host-input"
            label={t('Host')}
            labelIcon={<TooltipInfoButton content={t('tooltipConnectorHost')} />}
            title=""
          >
            <TextInput aria-label="form host input" value={host} onChange={(_, value) => handleChangeHost(value)} />
          </FormGroup>

          <FormGroup
            fieldId="tls-secret-input"
            label={t('TLS secret')}
            labelIcon={<TooltipInfoButton content={t('tooltipTlsCredentials')} />}
            title=""
          >
            <TextInput
              aria-label="form TLS secret input"
              value={tlsCredentials}
              onChange={(_, value) => handleChangeTlsCredentials(value)}
            />
          </FormGroup>

          {validated && (
            <FormAlert>
              <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
                {validated}
              </Alert>
            </FormAlert>
          )}

          <ActionGroup style={{ display: 'flex' }}>
            <Button variant="primary" onClick={handleSubmit} isDisabled={!canSubmit}>
              {t('Submit')}
            </Button>
            <Button variant="link" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          </ActionGroup>
        </Form>
      </CardBody>
    </Card>
  );
};

export default ConnectorForm;
