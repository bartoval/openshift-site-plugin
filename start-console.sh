#!/usr/bin/env bash
set -euo pipefail

# Check if 'oc' is available, otherwise exit with an error
OC=$(which oc 2>/dev/null || echo "MISSING-OC-FROM-PATH")
if [ "${OC}" = "MISSING-OC-FROM-PATH" ]; then
    echo "Missing 'oc' command. Ensure OpenShift CLI is installed and available in your PATH."
    exit 1
fi

# Ensure the user is logged into an OpenShift cluster
if ! ${OC} whoami &> /dev/null; then
    echo "You are not logged into an OpenShift cluster. Run 'oc login' before continuing."
    exit 1
fi

# Fetch OpenShift version
OPENSHIFT_VERSON=$(oc version | grep "Server Version: " | awk '{print $3}' | cut -d. -f-2)
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:$OPENSHIFT_VERSON"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
CONSOLE_IMAGE_PLATFORM=${CONSOLE_IMAGE_PLATFORM:="linux/amd64"}

echo "Starting local OpenShift console..."


# Set environment variables for the OpenShift console
BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
# Using CRC for development, so Thanos and AlertManager may require a lot of resources, disable them by default
# BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}')
# BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}')
BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_I18N_NAMESPACES="plugin__${npm_package_name}"

BRIDGE_PLUGINS="${npm_package_name}=http://host.docker.internal:9001"


# Output console information
echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"
echo "Console Platform: $CONSOLE_IMAGE_PLATFORM"

# Prefer podman if installed. Otherwise, fall back to docker.
if [ -x "$(command -v podman)" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        # Use host networking on Linux since host.containers.internal is unreachable in some environments.
        BRIDGE_PLUGINS="${npm_package_name}=http://localhost:9001"
        podman run --pull always --platform $CONSOLE_IMAGE_PLATFORM --rm --network=host --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    else
        BRIDGE_PLUGINS="${npm_package_name}=http://host.containers.internal:9001"
        podman run --pull always --platform $CONSOLE_IMAGE_PLATFORM --rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${npm_package_name}=http://host.docker.internal:9001"
    docker run --pull always --platform $CONSOLE_IMAGE_PLATFORM--rm -p "$CONSOLE_PORT":9000 --env-file <(set | grep BRIDGE) $CONSOLE_IMAGE
fi
