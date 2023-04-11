/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsClientContract } from 'src/core/public';
import { DataSourceAttributes } from 'src/plugins/data_source/common/data_sources';

export async function getDataSources(savedObjectsClient: SavedObjectsClientContract) {
  return savedObjectsClient
    .find<DataSourceAttributes>({
      type: 'data-source',
      fields: ['title', 'id'],
      perPage: 10000,
    })
    .then((response) => {
      return (
        response.savedObjects.map((dataSource) => {
          const id = dataSource.id;
          const title = dataSource.get('title');

          return {
            id,
            title,
            name: title,
            sort: `${title}`,
          };
        }) || []
      );
    });
}

export async function getDashboardPits(savedObjectsClient: SavedObjectsClientContract) {
  return savedObjectsClient
    .find<DataSourceAttributes>({
      type: 'data-source',
      fields: ['title', 'id'],
      perPage: 10000,
    })
    .then((response) => {
      return [
        {
          name: 'PIT-my-index-1',
          id:
            'o463QQEKbXktaW5kZXgtMRZtN2RWMHdaRlNILThIMUVWWDJJMVBRABZxMlNNZVdPZVRGbVR6MUxPc1RZYkx3AAAAAAAAAAAiFmhZdDNoTk9hUlBlVng2RVNIMUNhelEBFm03ZFYwd1pGU0gtOEgxRVZYMkkxUFEAAA==',
        },
        {
          name: 'PIT-my-index-2',
          id:
            'o463QQEKbXktaW5kZXgtMRZtN2RWMHdaRlNILThIMUVWWDJJMVBRABZxMlNNZVdPZVRGbVR6MUxPc1RZYkx3AAAAAAAAAAAjFmhZdDNoTk9hUlBlVng2RVNIMUNhelEBFm03ZFYwd1pGU0gtOEgxRVZYMkkxUFEAAA==',
        },
      ];
    });
}
