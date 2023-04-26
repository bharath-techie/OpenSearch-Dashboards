/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useMount } from 'react-use';
import { i18n } from '@osd/i18n';
import {
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
import { PointInTimeManagementContext } from '../../types';
import { getEditBreadcrumbs } from '../breadcrumbs';

export const PITEdit: React.FunctionComponent<RouteComponentProps<{ id: string }>> = (
  props: RouteComponentProps<{ id: string }>
) => {
  const { setBreadcrumbs } = useOpenSearchDashboards<PointInTimeManagementContext>().services;
  const PitID: string = props.match.params.id;
  useMount(() => {
    console.log(PitID);
    setBreadcrumbs(getEditBreadcrumbs());
  });
  const [checked, setChecked] = useState(false);
  const onChange = (e) => {
    setChecked(e.target.checked);
  };

  return (
    <>
      <EuiPageContent
        data-test-subj="PitConfiguration"
        role="region"
        aria-label={i18n.translate('pitManagement.editPage', {
          defaultMessage: 'Point in Time',
        })}
      >
        <EuiPageHeader bottomBorder>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Time Configurations</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <EuiSpacer />
        <EuiForm component="form">
          <EuiDescribedFormGroup
            title={<h3>Add time</h3>}
            description={
              <p>
                The keep_alive time is the amount of time the PIT is kept active. The time entered
                will also be the amount of time a PIT is extended by when it is queried. A PITs time
                can not be extended by an amount less than the one entered. The keep alive time can
                not exceed a maximum of X hours.
              </p>
            }
          >
            <EuiFormRow>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFieldNumber placeholder="Hour(s)" />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFieldNumber placeholder="Min(s)" />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          </EuiDescribedFormGroup>
        </EuiForm>
      </EuiPageContent>
      <EuiSpacer />
      <EuiPageContent
        data-test-subj="PitConfiguration"
        role="region"
        aria-label={i18n.translate('pitManagement.editPage', {
          defaultMessage: 'Point in Time',
        })}
      >
        <EuiPageHeader bottomBorder>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Dashboard PIT configurations</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <EuiSpacer />
        <EuiForm component="form">
          <EuiDescribedFormGroup
            title={<h3>PIT name</h3>}
            description={<p>Choose a name for a PIT that is available in OpenSearch Dashboards.</p>}
          >
            <EuiFormRow
              label="PIT name"
              helpText="Specify a unique and descriptive name that is easy to recognize."
            >
              <EuiFieldText name="pit-name" />
            </EuiFormRow>
          </EuiDescribedFormGroup>
          <EuiDescribedFormGroup
            title={<h3>Post-expiration actions</h3>}
            description={
              <p>
                PIT data is lost once it expires you have the option to keep the PIT metadata after
                after expiration. expiration. expiration. expiration. expiration. You can also
                choose to keep the Dashboard Object expiration. This object will be converted to an
                Index Pattern and Pattern and it will reference data.
              </p>
            }
          >
            <EuiFormRow>
              <>
                <EuiCheckbox
                  id="pit-id"
                  label="Delete this PIT at expiration"
                  checked={checked}
                  onChange={(e) => onChange(e)}
                />
                <EuiCheckbox
                  id="pit-id"
                  label="Delete dependent saved objects at PIT expiration"
                  onChange={(e) => onChange(e)}
                  disabled={true}
                />
              </>
            </EuiFormRow>
          </EuiDescribedFormGroup>
        </EuiForm>
      </EuiPageContent>
    </>
  );
};

export const PITEditWithRouter = withRouter(PITEdit);
