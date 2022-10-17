import { HttpResources, HttpServiceSetup, IRouter} from '../../../../src/core/server';
import {CREATE_POINT_IN_TIME_PATH} from "../../common";
import {trimEnd} from "lodash";
import {OPENSEARCH_SEARCH_STRATEGY} from "../../../../src/plugins/data/common";
import {from} from "rxjs";
import {schema} from "@osd/config-schema";
import {options} from "joi";

export function createPointInTimeRoute(
  router: IRouter,
  http: HttpServiceSetup & { resources: HttpResources }
) {
  router.post(
    {
      path: `${CREATE_POINT_IN_TIME_PATH}/{index}`,
      validate: {
        params: schema.object({
          index: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      console.log('This is the request for create point in time path');
      console.log(request);
      const { index } = request.params;
      console.log(index);
      const path = trimEnd(
        `/internal/search/create_point_in_time/${index}`,
        '/'
      );
      console.log(context);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const response_local = await context.core.opensearch.client.asCurrentUser.create_pit({
          index,
          keep_alive: '12h',
        },
        {}
      );
      console.log('This is after posting', response_local);
      return response.ok({
        body: {
          pit_id: response_local.body.pit_id,
          creation_time: response_local.body.creation_time,
        },
      });
    }
  );
}
