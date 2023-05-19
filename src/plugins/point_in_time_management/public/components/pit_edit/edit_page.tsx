/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useEffectOnce, useMount } from 'react-use';
import { i18n } from '@osd/i18n';
import {
  EuiBottomBar,
  EuiButton,
  EuiButtonEmpty,
  EuiCheckbox,
  EuiDescribedFormGroup,
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiPageContent,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import { PointInTimeAttributes, PointInTimeManagementContext } from '../../types';
import { getEditBreadcrumbs } from '../breadcrumbs';
import { EditPitForm } from './edit_pit_form';
import {
  findById,
  findPointInTimeSavedObject,
  updatePointInTimeById,
  updatePointInTimeKeepAlive,
} from '../utils';
import { ToastMessageItem } from '../../../../data_source_management/public/types';
import { getServices, Services } from '../../services';

const defaultPitSavedObject: PointInTimeAttributes = {
  pit_id: '',
  creation_time: 0,
  id: '',
  keepAlive: 0,
  name: '',
  addtime: 0,
  delete_on_expiry: false,
};

export const PITEdit: React.FunctionComponent<RouteComponentProps<{ id: string }>> = (
  props: RouteComponentProps<{ id: string }>
) => {
  const {
    setBreadcrumbs,
    savedObjects,
    notifications: { toasts },
    http,
  } = useOpenSearchDashboards<PointInTimeManagementContext>().services;
  const PitID: string = props.match.params.id;
  const [pitSavedObject, setPitSavedObject] = useState<PointInTimeAttributes>(
    defaultPitSavedObject
  );
  const [isLoading, setIsLoading] = useState(false);
  const [newProp, setNewProp] = useState(false);
  const services: Services = getServices(http);
  useEffectOnce(() => {
    console.log(PitID);
    setBreadcrumbs(getEditBreadcrumbs());
    setIsLoading(true);
    (async function () {
      await fetchPitSavedObject();
    })();
  });

  const fetchPitSavedObject = async () => {
    const tempPitSavedObject = await findById(savedObjects.client, PitID);
    setNewProp(true);
    const pointInTimeAttributes: PointInTimeAttributes = {
      creation_time: tempPitSavedObject.attributes.creation_time,
      name: tempPitSavedObject.attributes.name,
      keepAlive: tempPitSavedObject.attributes.keepAlive,
      pit_id: tempPitSavedObject.attributes.pit_id,
      id: tempPitSavedObject.id,
      addtime: 0,
      delete_on_expiry: tempPitSavedObject.attributes.delete_on_expiry,
    };
    console.log('This is teh attributes');
    console.log(pointInTimeAttributes);
    setPitSavedObject(pointInTimeAttributes);
    setIsLoading(false);
  };

  const handleSubmit = async (attributes: PointInTimeAttributes) => {
    console.log('These are the attributes', attributes);
    const new_keep_alive_proposal = attributes.addtime.toString() + 'm';
    console.log(attributes.pit_id, new_keep_alive_proposal);
    await services.addPitTime(attributes.pit_id, new_keep_alive_proposal);
    await updatePointInTimeById(savedObjects.client, attributes.id, attributes);
  };

  const handleDisplayToastMessage = ({ id, defaultMessage, success }: ToastMessageItem) => {
    if (success) {
      toasts.addSuccess(i18n.translate(id, { defaultMessage }));
    } else {
      toasts.addWarning(i18n.translate(id, { defaultMessage }));
    }
  };

  return (
    <>
      {!isLoading ? (
        <EditPitForm
          existingPointInTime={pitSavedObject}
          newProp={newProp}
          handleSubmit={handleSubmit}
          displayToastMessage={handleDisplayToastMessage}
        />
      ) : null}
    </>
  );
};

export const PITEditWithRouter = withRouter(PITEdit);
