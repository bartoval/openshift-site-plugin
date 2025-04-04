import { FC, useCallback, useEffect } from 'react';

import { RESTApi } from '@API/REST.api';
import { createAccessTokenRequest } from '@core/utils/createCRD';
import { AccessTokenCrdParams } from '@interfaces/CRD_AccessToken';
import { HTTPError } from '@interfaces/REST.interfaces';
import {
  Button,
  WizardFooterWrapper,
  Alert,
  PageSectionVariants,
  PageSection,
  useWizardContext
} from '@patternfly/react-core';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parse } from 'yaml';

import { useLinkForm } from './hooks/useLinkForm';
import { I18nNamespace } from '../../../../config/config';

const ButtonName: string[] = ['Next', 'Create', 'Done'];

interface FooterProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export const Footer: FC<FooterProps> = function ({ onCancel, onSubmit }) {
  const { t } = useTranslation(I18nNamespace);
  const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();
  const {
    state: { name, cost, file: fileContent },
    isLoading,
    validated,
    setIsLoading,
    setValidated,
    dispatch
  } = useLinkForm();

  const mutationCreate = useMutation({
    mutationFn: (data: AccessTokenCrdParams) => RESTApi.createAccessToken(data),
    onError: (data: HTTPError) => {
      dispatch({ type: 'SET_NAME', payload: '' });
      dispatch({ type: 'SET_COST', payload: '' });
      dispatch({ type: 'SET_FILE_NAME', payload: '' });
      dispatch({ type: 'SET_FILE_CONTENT', payload: '' });

      setValidated(data.descriptionMessage);
      setIsLoading(false);
    },
    onSuccess: () => {
      setValidated(undefined);
      setIsLoading(true);

      goToNextStep();
    }
  });

  const handleSubmit = useCallback(() => {
    if (!fileContent || !name) {
      setValidated(t('Fill out all required fields before continuing'));

      return;
    }

    try {
      const JsonFile = parse(fileContent) as AccessTokenCrdParams;
      const { spec } = JsonFile;

      if (!spec) {
        setValidated(t('Invalid Access Token format'));

        return;
      }

      const data: AccessTokenCrdParams = createAccessTokenRequest({
        metadata: {
          name
        },
        spec: {
          linkCost: Number(cost),
          ca: spec.ca,
          code: spec.code,
          url: spec.url
        }
      });

      mutationCreate.mutate(data);
    } catch {
      setValidated(t('Invalid Access Token format'));
    }
  }, [cost, fileContent, mutationCreate, name, setValidated, t]);

  const handlePreviousStep = useCallback(() => {
    setValidated(undefined);
    goToPrevStep();
  }, [goToPrevStep, setValidated]);

  const handleNextStep = useCallback(() => {
    setValidated(undefined);

    if (activeStep?.index === 2) {
      handleSubmit();

      return;
    }

    if (activeStep?.index === 3) {
      onSubmit();
    }

    goToNextStep();
  }, [setValidated, activeStep?.index, goToNextStep, handleSubmit, onSubmit]);

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

  return (
    <>
      {validated && activeStep?.index === 2 && (
        <PageSection variant={PageSectionVariants.light}>
          <Alert variant="danger" title={t('An error occurred')} aria-live="polite" isInline>
            {validated}
          </Alert>
        </PageSection>
      )}

      <WizardFooterWrapper>
        <Button
          variant="secondary"
          onClick={handlePreviousStep}
          isDisabled={activeStep?.index === 1 || activeStep?.index === 3 || isLoading}
        >
          {t('Back')}
        </Button>

        <Button onClick={handleNextStep} isDisabled={isLoading || (activeStep?.index === 3 && !!validated)}>
          {t(ButtonName[activeStep?.index - 1])}
        </Button>

        {!(activeStep.index === 3 && !isLoading && !validated) && (
          <Button variant="link" onClick={onCancel}>
            {activeStep?.index === 1 || activeStep?.index === 2 ? t('Cancel') : t('Dismiss')}
          </Button>
        )}
      </WizardFooterWrapper>
    </>
  );
};
