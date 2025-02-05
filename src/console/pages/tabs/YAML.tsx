import { useWatchedSkupperResource } from '@hooks/useSkupperWatchResource';
import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody } from '@patternfly/react-core';
import { stringify } from 'yaml';

const YAML = function () {
  const { data: sites } = useWatchedSkupperResource({ kind: 'Site' });
  const site = sites?.[0].rawData;

  return (
    <Card isFullHeight data-testid="yaml">
      <CardBody>
        <CodeEditor value={stringify(site)} options={{ readOnly: true }} minHeight={'95%'} />
      </CardBody>
    </Card>
  );
};

export default YAML;
