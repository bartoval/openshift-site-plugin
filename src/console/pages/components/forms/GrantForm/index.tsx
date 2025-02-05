import { useState, FC, useCallback, useMemo, useRef, useEffect, memo } from 'react';

import { RESTApi } from '@API/REST.api';
import { I18nNamespace } from '@config/config';
import { createAccessGrantRequest } from '@core/utils/createCRD';
import useValidatedInput from '@hooks/useValidation';
import { AccessGrantCrdParams, AccessGrantParams } from '@interfaces/CRD_AccessGrant';
import { HTTPError } from '@interfaces/REST.interfaces';
import {
  Button,
  Alert,
  Wizard,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
  PageSection,
  PageSectionVariants
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { DownloadGrant } from './DownloadGrant';
import { FormPage } from './FormPage';

const DEFAULT_EXPIRATION = 15;
const DEFAULT_CLAIMS = 1;

enum ValidForUnit {
  Minutes = 'm',
  Hours = 'h'
}

const ButtonName: string[] = ['Create', 'Done'];

const GrantForm: FC<{ onSubmit?: () => void; onCancel?: () => void }> = memo(({ onCancel }) => {
  const { t } = useTranslation(I18nNamespace);

  const [name, setName] = useState('');
  const [step, setStep] = useState(1);

  const { validated: validationError, validateInput: setValidationError } = useValidatedInput();

  const validForRef = useRef<number | undefined>(DEFAULT_EXPIRATION);
  const validForUnitRef = useRef<ValidForUnit>(ValidForUnit.Minutes);
  const claimsRef = useRef<number | undefined>(DEFAULT_CLAIMS);
  const codeRef = useRef<string>('');

  const mutationCreate = useMutation({
    mutationFn: (data: AccessGrantParams) => RESTApi.createGrant(data),
    onError: (data: HTTPError) => {
      setValidationError(data.descriptionMessage);
    },
    onSuccess: () => {
      setValidationError(undefined);
      setStep(step + 1);
    }
  });

  const handleSubmit = useCallback(() => {
    const data: AccessGrantCrdParams = createAccessGrantRequest({
      metadata: {
        name
      },
      spec: {
        expirationWindow: `${validForRef.current || DEFAULT_EXPIRATION}${validForUnitRef.current}`,
        redemptionsAllowed: claimsRef.current || DEFAULT_CLAIMS,
        code: codeRef.current
      }
    });

    mutationCreate.mutate(createAccessGrantRequest(data));
  }, [mutationCreate, name]);

  const handleNextStep = useCallback(() => {
    if (step === 1) {
      handleSubmit();
    }

    if (step === 2) {
      onCancel?.();
    }
  }, [handleSubmit, onCancel, step]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleNextStep();
      }
    },
    [handleNextStep]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress); // Cleanup listener on unmount
    };
  }, [handleKeyPress]);

  const steps = useMemo(
    () => [
      <WizardStep name={t('Configuration')} id="1-step" key="1-step">
        <FormPage
          name={name}
          onSetName={(value: string) => setName(value)}
          onSetValidFor={(value: number | undefined) => (validForRef.current = value)}
          onSetValidForUnit={(value: ValidForUnit) => (validForUnitRef.current = value)}
          onSetClaims={(value: number | undefined) => (claimsRef.current = value)}
          onSetCode={(value: string) => (codeRef.current = value)}
        />
      </WizardStep>,
      <WizardStep name={t('Create token')} id="2-step" key="2-step">
        <DownloadGrant name={name} />
      </WizardStep>
    ],
    [name, t]
  );

  return (
    <Wizard
      key={step}
      startIndex={step}
      title=""
      header={
        <WizardHeader
          title={t('Create token')}
          description={t('A token indicating authorization to generate a link.')}
          isCloseHidden={true}
        />
      }
      footer={
        <>
          {validationError && step === 1 && (
            <PageSection variant={PageSectionVariants.light}>
              <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
                {validationError}
              </Alert>
            </PageSection>
          )}

          <WizardFooterWrapper>
            <Button onClick={handleNextStep}>{t(ButtonName[step - 1])}</Button>
            {step === 1 && (
              <Button variant="link" onClick={onCancel}>
                {t('Cancel')}
              </Button>
            )}
          </WizardFooterWrapper>
        </>
      }
    >
      {...steps}
    </Wizard>
  );
});

export default GrantForm;
