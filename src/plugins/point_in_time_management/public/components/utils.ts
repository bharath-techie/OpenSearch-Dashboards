/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */



import { HttpSetup, HttpStart, SavedObjectReference, SavedObjectsClientContract, SavedObjectsStart } from 'src/core/public';
import { DataSourceAttributes } from 'src/plugins/data_source/common/data_sources';
import { PointInTimeAttributes } from '../types';
import { ResolveIndexResponse } from 'src/plugins/index_pattern_management/public/components/create_index_pattern_wizard/types';
import { getServices } from '../services';
import { DataPublicPluginStart } from 'src/plugins/data/public';
import { PointInTimeFlyoutItem } from './create_pit/create_pit';

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

export interface PointInTime {
  name: string;
  keepAlive: number;
  pit_id: string;
  creation_time: number;
  id?: string;
  delete_on_expiry: boolean;
}

export async function getIndexPatterns(savedObjectsClient: SavedObjectsClientContract) {
  return (
    savedObjectsClient
      .find({
        type: 'index-pattern',
        fields: ['title', 'type'],
        perPage: 10000,
      })
      .then((response) =>
        response.savedObjects
          .map((pattern) => {
            const id = pattern.id;
            const title = pattern.get('title');

            return {
              id,
              title,
              // the prepending of 0 at the default pattern takes care of prioritization
              // so the sorting will but the default index on top
              // or on bottom of a the table
              sort: `${title}`,
            };
          })
          .sort((a, b) => {
            if (a.sort < b.sort) {
              return -1;
            } else if (a.sort > b.sort) {
              return 1;
            } else {
              return 0;
            }
          })
      ) || []
  );
}

export async function getSavedPits(client: SavedObjectsClientContract) {
  const savedObjects = await client.find({
    type: 'point-in-time',
    perPage: 1000,
    fields: ['id', 'creation_time', 'keepAlive', 'name', 'pit_id', 'delete_on_expiry'],
  });

  return savedObjects.savedObjects;
}

export async function findById(client: SavedObjectsClientContract, id: string) {
  if (id) {
    console.log(id);
    const savedObjects = await client.find({
      type: 'point-in-time',
      perPage: 1000,
      fields: [],
    });
    return savedObjects.savedObjects.find((obj) => obj.id === id);
  }
}

export async function updatePointInTimeById(
  savedObjectsClient: SavedObjectsClientContract,
  id: string,
  attributes: PointInTimeAttributes
) {
  return savedObjectsClient.update('point-in-time', id, attributes);
}

export async function updatePointInTimeSavedObject(
  savedObjectsClient: SavedObjectsClientContract,
  id: string,
  attributes: PointInTimeAttributes,
  reference: SavedObjectReference[]
) {
  return savedObjectsClient.update('point-in-time', id, attributes, { references: reference });
}

export async function deletePointInTimeById(
  savedObjectsClient: SavedObjectsClientContract,
  id: string
) {
  return savedObjectsClient.delete('point-in-time', id);
}

export async function updatePointInTimeKeepAlive(
  savedObjectsClient: SavedObjectsClientContract,
  id: string,
  addTime: number
) { }

export async function createSavedObject(
  pointintime: PointInTime,
  client: SavedObjectsClientContract,
  reference: SavedObjectReference
) {
  const dupe = await findById(client, pointintime.pit_id);
  console.log('This is dupe output');
  console.log(dupe);
  if (dupe) {
    throw new Error(`Duplicate Point in time: ${pointintime.pit_id}`);
  }

  const body = pointintime;
  const references = [{ ...reference }];
  const savedObjectType = 'point-in-time';
  const response = await client.create(savedObjectType, body, {
    references,
  });
  console.log('This is the response');
  console.log(response);
  pointintime.id = response.id;
  console.log(pointintime);
  return pointintime;
}
export async function getIndicesViaResolve(
  http: HttpStart,
  //getIndexTags: IndexPatternCreationConfig['getIndexTags'],
  pattern: string,
  showAllIndices: boolean,
  dataSourceId?: string
) {
  const query = {} as any;
  if (showAllIndices) {
    query.expand_wildcards = 'all';
  }
  if (dataSourceId) {
    query.data_source = dataSourceId;
  }

  return http
    .get<ResolveIndexResponse>(`/internal/index-pattern-management/resolve_index/${pattern}`, {
      query,
    })
    .then((response) => {
      if (!response) {
        return [];
      } else {
        const source: any[] | PromiseLike<any[]> = [];

        (response.indices || []).forEach((index) => {

          source.push({
            name: index.name,
            item: index,
          });
        });
        return source;
      }
    });
};

export async function getFieldsForWildcard(indexPattern: string, capabilities: any, indexPatternsService: any) {

  return await indexPatternsService!.getFieldsForWildcard({
    pattern: indexPattern,
    fieldCapsOptions: { allowNoIndices: true },
  });
}

export async function createIndexPattern(indexPatternTitle: string, indexPatternsService: any, dataSourceRef: any) {
  try {
    return await indexPatternsService.createAndSave({
      title: indexPatternTitle,
      id: "",
      dataSourceRef,
    });
  } catch (err) {
    throw err;
  }
};

export async function createPitSavedObject(pointintime, client, reference) {
  const body = pointintime;
  body.id = pointintime.id;
  body.title = pointintime.name;
  body.name = pointintime.name;
  const references = [{ ...reference }];
  const savedObjectType = "point-in-time";
  return await client.create(savedObjectType, body, {
    references,
  });
}

export async function createPit(selectedIndexOptions, selectedIndexPattern, indexPatterns: PointInTimeFlyoutItem[], 
  dataSource: string, data: DataPublicPluginStart, http: HttpSetup, keepAlive: string, 
  makedashboardschecked: boolean, pitName: string, savedObjects: SavedObjectsStart, deletepitchecked: boolean) {
      let indexPatternObj;
  if (selectedIndexOptions.length > 0) {
      const indices = selectedIndexOptions.flatMap(a => a.label).join(",");
      indexPatternObj = indexPatterns.find(x => x.title == indices);
      const ds = {
          id: dataSource,
          type: "data-source",
          name: "DataSource",
      };
      if (!indexPatternObj) {
          indexPatternObj = await createIndexPattern(indices, data.indexPatterns, ds);
      }
  } else {
      indexPatternObj = indexPatterns.find(x => x.id == selectedIndexPattern);
  }

  const reference: SavedObjectReference = {
      id: indexPatternObj.id,
      type: 'index-pattern',
      name: indexPatternObj.title
  };
  const service = getServices(http);
  const createdPit = await service.createPit(indexPatternObj.title, keepAlive, true, dataSource);
  if (makedashboardschecked) {
      const pit: PointInTime = {
          name: pitName,
          keepAlive: createdPit.keep_alive,
          pit_id: createdPit.pit_id,
          creation_time: createdPit.creation_time,
          delete_on_expiry: deletepitchecked,
          id: '',
      };
      await createSavedObject(pit, savedObjects.client, reference);
  }
}


