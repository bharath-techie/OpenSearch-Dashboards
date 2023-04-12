/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import {
  IRouter,
  OpenSearchClient,
  OpenSearchDashboardsRequest,
  RequestHandlerContext,
} from 'opensearch-dashboards/server';

export function registerPitRoutes(router: IRouter) {
  router.post(
    {
      path: '/api/pit/all',
      validate: {
        body: schema.object({
          dataSourceId: schema.string(),
        }),
      },
    },
    async (context, req, res) => {
      const client: OpenSearchClient = await getClient(req, context);
      try {
        const pits = await client.getAllPits({});
        return res.ok({
          body: {
            ok: true,
            resp: pits.body,
          },
        });
      } catch (err: any) {
        return res.ok({
          body: {
            ok: false,
            resp: err.message,
          },
        });
      }
    }
  );

  router.post(
    {
      path: '/api/pit/delete',
      validate: {
        body: schema.object({
          dataSourceId: schema.string(),
          pit_id: schema.arrayOf(schema.string()),
        }),
      },
    },
    async (context, req, res) => {
      const client: OpenSearchClient = await getClient(req, context);
      try {
        const pits = await client.deletePit({ body: { pit_id: req.body.pit_id } });
        return res.ok({
          body: {
            ok: true,
            resp: pits.body,
          },
        });
      } catch (err: any) {
        return res.ok({
          body: {
            ok: false,
            resp: err.message,
          },
        });
      }
    }
  );

  // router.post(
  //     {
  //         path: '/api/geospatial/_search',
  //         validate: {
  //             body: schema.object({
  //                 index: schema.string(),
  //             }),
  //         },
  //     },
  //     async (context, req, res) => {
  //         const client = context.core.opensearch.client.asCurrentUser;
  //         try {
  //             const { index } = req.body;
  //             const params = { index, body: {} };
  //             const results = await client.search(params);
  //             return res.ok({
  //                 body: {
  //                     ok: true,
  //                     resp: results.body,
  //                 },
  //             });
  //         } catch (err: any) {
  //             return res.ok({
  //                 body: {
  //                     ok: false,
  //                     resp: err.message,
  //                 },
  //             });
  //         }
  //     }
  // );

  // router.post(
  //     {
  //         path: '/api/geospatial/_mappings',
  //         validate: {
  //             body: schema.object({
  //                 index: schema.string(),
  //             }),
  //         },
  //     },
  //     async (context, req, res) => {
  //         const client = context.core.opensearch.client.asCurrentUser;
  //         try {
  //             const { index } = req.body;
  //             const mappings = await client.indices.getMapping({ index });
  //             return res.ok({
  //                 body: {
  //                     ok: true,
  //                     resp: mappings.body,
  //                 },
  //             });
  //         } catch (err: any) {
  //             return res.ok({
  //                 body: {
  //                     ok: false,
  //                     resp: err.message,
  //                 },
  //             });
  //         }
  //     }
  // );
}

async function getClient(
  req: OpenSearchDashboardsRequest<
    unknown,
    unknown,
    Readonly<{} & { dataSourceId: string }>,
    'post'
  >,
  context: RequestHandlerContext
): Promise<OpenSearchClient> {
  return req.body.dataSourceId && req.body.dataSourceId !== 'default' && context.dataSource
    ? await context.dataSource.opensearch.getClient(req.body.dataSourceId)
    : context.core.opensearch.client.asCurrentUser;
}
