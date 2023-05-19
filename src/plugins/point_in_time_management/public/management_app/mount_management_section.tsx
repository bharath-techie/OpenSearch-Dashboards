/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { I18nProvider } from '@osd/i18n/react';
import { Route, Router, Switch } from 'react-router-dom';
import { ManagementAppMountParams } from '../../../management/public';
import { PointInTimeManagementStartDependencies } from '../plugin';
import { StartServicesAccessor } from '../../../../core/public';
import { PointInTimeManagementContext } from '../types';
import { OpenSearchDashboardsContextProvider } from '../../../opensearch_dashboards_react/public';
import { PITTableWithRouter } from '../components';
import { PITEditWithRouter } from '../components/pit_edit';
import { CreatePitWithRouter } from '../components/create_pit/create_pit';

export async function mountManagementSection(
  getStartServices: StartServicesAccessor<PointInTimeManagementStartDependencies>,
  params: ManagementAppMountParams
) {
  const [
    { chrome, application, savedObjects, notifications, http },
    { data },
  ] = await getStartServices();
  const deps: PointInTimeManagementContext = {
    chrome,
    application,
    notifications,
    savedObjects,
    http,
    data,
    setBreadcrumbs: params.setBreadcrumbs,
  };
  ReactDOM.render(
    <OpenSearchDashboardsContextProvider services={deps}>
      <I18nProvider>
        <Router history={params.history}>
          <Switch>
            <Route path={['/create']}>
              <CreatePitWithRouter />
            </Route>
            <Route path={['/:id']}>
              <PITEditWithRouter />
            </Route>

            {/* <Route path={['/:id']}>
              <PointInTimeEditForm />
            </Route> */}
            <Route path={['/']}>
              <PITTableWithRouter />
            </Route>
          </Switch>
        </Router>
      </I18nProvider>
    </OpenSearchDashboardsContextProvider>,
    params.element
  );

  return () => {
    chrome.docTitle.reset();
    ReactDOM.unmountComponentAtNode(params.element);
  };
}
