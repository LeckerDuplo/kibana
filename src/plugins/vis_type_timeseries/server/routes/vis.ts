/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { IRouter, KibanaRequest } from 'kibana/server';
import { schema } from '@kbn/config-schema';
import { ensureNoUnsafeProperties } from '@kbn/std';
import { getVisData, GetVisDataOptions } from '../lib/get_vis_data';
import { visPayloadSchema } from '../../common/vis_schema';
import { ROUTES } from '../../common/constants';
import { Framework } from '../plugin';

const escapeHatch = schema.object({}, { unknowns: 'allow' });

export const visDataRoutes = (router: IRouter, framework: Framework) => {
  router.post(
    {
      path: ROUTES.VIS_DATA,
      validate: {
        body: escapeHatch,
      },
    },
    async (requestContext, request, response) => {
      try {
        ensureNoUnsafeProperties(request.body);
      } catch (error) {
        return response.badRequest({
          body: error.message,
        });
      }

      try {
        visPayloadSchema.validate(request.body);
      } catch (error) {
        framework.logger.debug(
          `Request validation error: ${error.message}. This most likely means your TSVB visualization contains outdated configuration. You can report this problem under https://github.com/elastic/kibana/issues/new?template=Bug_report.md`
        );
      }

      try {
        const results = await getVisData(
          requestContext,
          request as KibanaRequest<{}, {}, GetVisDataOptions>,
          framework
        );
        return response.ok({ body: results });
      } catch (error) {
        return response.internalError({
          body: error.message,
        });
      }
    }
  );
};
