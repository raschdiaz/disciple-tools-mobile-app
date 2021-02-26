import { REHYDRATE } from 'redux-persist/lib/constants';

import * as publicActions from '../actions/public.actions';

const initialState = {
  loading: false,
  error: null,
  settings: {},
};

export default function publicReducer(state = initialState, action) {
  let newState = {
    ...state,
    error: null,
  };

  switch (action.type) {
    case REHYDRATE: {
      return {
        ...newState,
        loading: false,
      };
    }
    case publicActions.PUBLIC_GET_SITE_SETTINGS_START: {
      return {
        ...newState,
        settings: {},
        loading: true,
      };
    }
    case publicActions.PUBLIC_GET_SITE_SETTINGS_SUCCESS: {
      let { settings } = action;
      return {
        ...newState,
        settings,
        loading: false,
      };
    }
    case publicActions.PUBLIC_GET_SITE_SETTINGS_FAILURE: {
      return {
        ...newState,
        error: action.error,
        loading: false,
      };
    }
    default:
      return newState;
  }
}
