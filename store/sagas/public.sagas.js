import { put, take, takeLatest, all } from 'redux-saga/effects';
import * as actions from '../actions/public.actions';

export function* getSiteSettings({ domain }) {
  yield put({ type: actions.PUBLIC_GET_SITE_SETTINGS_START });
  yield put({
    type: 'REQUEST',
    payload: {
      url: `http://${domain}/wp-json/dt-public/dt-core/v1/settings`,
      data: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      action: actions.PUBLIC_GET_SITE_SETTINGS_RESPONSE,
    },
  });

  try {
    let response = yield take(actions.PUBLIC_GET_SITE_SETTINGS_RESPONSE);
    response = response.payload;
    const jsonData = response.data;
    if (response.status === 200) {
      yield put({
        type: actions.PUBLIC_GET_SITE_SETTINGS_SUCCESS,
        settings: jsonData,
      });
    } else {
      yield put({
        type: actions.PUBLIC_GET_SITE_SETTINGS_FAILURE,
        error: {
          code: jsonData.code,
          message: jsonData.message,
        },
      });
    }
  } catch (error) {
    console.log(error);
    yield put({
      type: actions.CONTACTS_GETALL_FAILURE,
      error: {
        code: '400',
        message: 'Unable to process the request. Please try again later.',
      },
    });
  }
}

export default function* publicSaga() {
  yield all([takeLatest(actions.PUBLIC_GET_SITE_SETTINGS, getSiteSettings)]);
}
