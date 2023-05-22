/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

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

import React, { useState, useEffect } from 'react';
import { SavedObject } from 'opensearch-dashboards/public';
import { IIndexPattern, IndexPatternAttributes } from 'src/plugins/data/public';
import { I18nProvider } from '@osd/i18n/react';

import { IndexPatternRef, PointInTimeRef } from './types';
import { ChangeIndexPattern } from './change_indexpattern';
import {PointInTimeAttributes} from "../../../../../point_in_time_management/public/types";

export interface DiscoverIndexPatternProps {
  /**
   * list of available index patterns, if length > 1, component offers a "change" link
   */
  indexPatternList: Array<SavedObject<IndexPatternAttributes>>;
  pointInTimeList: Array<SavedObject<PointInTimeAttributes>>;
  /**
   * currently selected index pattern, due to angular issues it's undefined at first rendering
   */
  selectedPointInTime: any;
  selectedIndexPattern: IIndexPattern;
  /**
   * triggered when user selects a new index pattern
   */
  setIndexPattern: (id: string) => void;
  setPointInTime: (id: string) => void;
}

/**
 * Component allows you to select an index pattern in discovers side bar
 */
export function DiscoverIndexPattern({
  indexPatternList,
  pointInTimeList,
  selectedIndexPattern,
  selectedPointInTime,
  setIndexPattern,
  setPointInTime,
}: DiscoverIndexPatternProps) {
  const options: IndexPatternRef[] = (indexPatternList || []).map((entity) => ({
    id: entity.id,
    title: entity.attributes!.title,
    type: entity.type,
  }));

  const point_in_time_options: PointInTimeRef[] = (pointInTimeList || []).map((entity) => ({
    id: entity.id,
    title: entity.attributes!.name,
    type: entity.type,
    references: entity.references,
    pit_id: entity.attributes.pit_id,
  }));
  console.log('this is the selected point in time object');
  console.log(selectedPointInTime);
  // TODO: will have a title attribute in the saved object of Point in time
  if (selectedPointInTime) {

    selectedPointInTime = { ...selectedPointInTime, title: selectedPointInTime?.attributes?.name };
  }
  const selectedPattern = selectedPointInTime || selectedIndexPattern || {};
  const { id: selectedId, title: selectedTitle } = selectedPattern;

  const [selected, setSelected] = useState({
    id: selectedId,
    title: selectedTitle || '',
  });
  useEffect(() => {
    const { id, title } = selectedPattern;
    debugger;
    setSelected({ id, title });
  }, []);
  if (!selectedId) {
    return null;
  }

  return (
    <div className="dscIndexPattern__container">
      <I18nProvider>
        <ChangeIndexPattern
          trigger={{
            label: selected.title,
            title: selected.title,
            'data-test-subj': 'indexPattern-switch-link',
            className: 'dscIndexPattern__triggerButton',
          }}
          indexPatternId={selected.id}
          indexPatternRefs={options}
          pointInTimeRefs={point_in_time_options}
          onChangePattern={(id) => {
            const indexPattern = options.find((pattern) => pattern.id === id);
            if (indexPattern) {
              setIndexPattern(id);
              setSelected(indexPattern);
            }
            const pointInTime = point_in_time_options.find((pattern) => pattern.id === id);
            if (pointInTime) {
              console.log("this is the PIT selected", pointInTime);
              setPointInTime(pointInTime.pit_id);
              const PitId = pointInTimeList[0].attributes.pit_id;
              const title = pointInTimeList[0].attributes.name;
              setSelected({ id: PitId, title });
            }
          }}
        />
      </I18nProvider>
    </div>
  );
}
