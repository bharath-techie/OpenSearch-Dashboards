/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreStart, HttpFetchError } from 'opensearch-dashboards/public';

export interface Services {
  getAllPits: (dataSourceId?: string) => Promise<undefined | HttpFetchError>;
}

export function getServices(http: CoreStart['http']): Services {
  return {
    getAllPits: async (dataSourceId?: string) => {
      try {
        const response = await http.post('/api/pit/all', {
          body: JSON.stringify({
            dataSourceId: dataSourceId ? dataSourceId : '',
          }),
        });
        return response;
      } catch (e) {
        return e;
      }
    },
  };
}
