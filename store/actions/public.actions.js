/*
 * Action Types
 */

export const PUBLIC_GET_SITE_SETTINGS = 'PUBLIC_GET_SITE_SETTINGS';
export const PUBLIC_GET_SITE_SETTINGS_START = 'PUBLIC_GET_SITE_SETTINGS_START';
export const PUBLIC_GET_SITE_SETTINGS_SUCCESS = 'PUBLIC_GET_SITE_SETTINGS_SUCCESS';
export const PUBLIC_GET_SITE_SETTINGS_RESPONSE = 'PUBLIC_GET_SITE_SETTINGS_RESPONSE';
export const PUBLIC_GET_SITE_SETTINGS_FAILURE = 'PUBLIC_GET_SITE_SETTINGS_FAILURE';

/*
 * Action Creators
 */
/**
 *
 * @param {*} domain
 */
export function getSiteSettings(domain) {
  return {
    type: PUBLIC_GET_SITE_SETTINGS,
    domain,
  };
}
