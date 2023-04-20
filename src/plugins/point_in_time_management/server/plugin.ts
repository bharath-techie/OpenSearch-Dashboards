/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../core/server';

import { PointInTimeManagementPluginSetup, PointInTimeManagementPluginStart } from './types';
import { registerPitRoutes } from './routes';
import { pointInTimeSavedObject } from './saved_objects';

export class PointInTimeManagementPlugin
  implements Plugin<PointInTimeManagementPluginSetup, PointInTimeManagementPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('pointInTimeManagement: Setup');
    const router = core.http.createRouter();
    core.savedObjects.registerType(pointInTimeSavedObject);
    registerPitRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('pointInTimeManagement: Started');
    return {};
  }

  public stop() {}
}
