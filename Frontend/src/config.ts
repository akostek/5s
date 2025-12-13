const KEYCLOAK_SETTINGS = {
  baseUrl: `http://${window.location.hostname}:8080`,
  realm: '5s_local',
  clientId: '5s_client'
};

const getKeycloakUrl = () => {
  return `${KEYCLOAK_SETTINGS.baseUrl}/realms/${KEYCLOAK_SETTINGS.realm}/protocol/openid-connect/auth`;
};

export const KEYCLOAK_CONFIG = {
  get url() {
    return getKeycloakUrl();
  },
  clientId: KEYCLOAK_SETTINGS.clientId,
  get redirectUri() {
    return `${window.location.origin}/callback`;
  }
};
