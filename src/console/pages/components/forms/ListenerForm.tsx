import { useState, FC, KeyboardEvent } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { TooltipInfoButton } from '@core/components/HelpTooltip';
import { createListenerRequest } from '@core/utils/createCRD';
import useValidatedInput from '@hooks/useValidation';
import { ListenerCrdParams, ListenerSpec } from '@interfaces/CRD_Listener';
import { HTTPError } from '@interfaces/REST.interfaces';
import {
  Form,
  FormGroup,
  TextInput,
  ActionGroup,
  Button,
  FormAlert,
  Alert,
  Title,
  Card,
  CardTitle,
  CardBody
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface ListenerCrdAttributes extends ListenerSpec {
  name?: string;
  resourceVersion?: string;
}

const ListenerForm: FC<{
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  listenerName?: string;
  attributes?: ListenerCrdAttributes;
}> = function ({ onSubmit, onCancel, listenerName, attributes, title }) {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState(attributes?.name || '');
  const [routingKey, setRoutingKey] = useState(attributes?.routingKey || '');
  const [host, setHost] = useState(attributes?.host || '');
  const [port, setPort] = useState<string | number | undefined>(attributes?.port);
  const [tlsCredentials, setTlsCredentials] = useState(attributes?.tlsCredentials || '');

  const { validated, validateInput } = useValidatedInput();

  const mutationCreate = useMutation({
    mutationFn: (data: ListenerCrdParams) => RESTApi.createOrUpdateListener(data, listenerName),
    onError: (data: HTTPError) => {
      validateInput(data.descriptionMessage);
    },
    onSuccess: onSubmit
  });

  const handleSubmit = () => {
    const data: ListenerCrdParams = createListenerRequest({
      metadata: {
        name,
        resourceVersion: attributes?.resourceVersion
      },
      spec: {
        routingKey,
        host,
        port: Number(port),
        tlsCredentials
      }
    });

    mutationCreate.mutate(data);
  };

  const handleChangeRoutingKey = (value: string) => {
    //validateInput(value, [validateRFC1123Subdomain]);
    setRoutingKey(value);
  };

  const handleChangeServiceName = (value: string) => {
    //validateInput(value, [validateRFC1123Subdomain]);
    setHost(value);
  };

  const handleChangePort = (value: string) => {
    //validateInput(value, [validatePort]);
    setPort(value);
  };

  const handleChangeName = (value: string) => {
    //validateInput(value, [validateRFC1123Subdomain]);
    setName(value);
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
              isDisabled={!!listenerName}
              aria-label="form name input"
              value={name}
              onChange={(_, value) => handleChangeName(value)}
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
            fieldId="service-name-input"
            label={t('Service name')}
            labelIcon={<TooltipInfoButton content={t('tooltipListenerHost')} />}
          >
            <TextInput
              aria-label="form service name input"
              value={host}
              onChange={(_, value) => handleChangeServiceName(value)}
            />
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

export default ListenerForm;
