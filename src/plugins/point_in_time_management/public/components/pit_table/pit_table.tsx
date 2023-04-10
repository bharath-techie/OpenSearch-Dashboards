/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useEffectOnce, useMount } from 'react-use';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiPageContent,
  EuiPageContentBody,
  EuiSpacer,
  EuiSearchBarProps,
  Query,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { FormattedMessage } from '@osd/i18n/react';
import { getListBreadcrumbs } from '../breadcrumbs';
import { PointInTimeManagementContext } from '../../types';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import { getDataSources } from '../utils';
import { EmptyState } from './empty_state';
import { PageHeader } from './page_header';
import { getServices, Services } from '../../services';
// import { dataSource } from 'src/plugins/data_source/server/saved_objects';

export interface DataSourceItem {
  id: string;
  title: string;
  sort: string;
}

export interface PitItem {
  pit_id: string;
  creation_time: number;
  keep_alive: number;
}

const PITTable = ({ history }: RouteComponentProps) => {
  const {
    setBreadcrumbs,
    savedObjects,
    notifications: { toasts },
    http,
  } = useOpenSearchDashboards<PointInTimeManagementContext>().services;

  useMount(() => {
    setBreadcrumbs(getListBreadcrumbs());
  });

  const services: Services = getServices(http);

  // TODO: update this for cases when some data source name is default
  const defaultDataSource: DataSourceItem = { id: '', title: 'Default', sort: '0' };

  // TODO: use APIs to fetch PITs and update the table and message
  const [loading, setLoading] = useState(false);
  const [pits, setPits] = useState<PitItem[]>([]);
  const [message, setMessage] = useState(<EmptyState />);

  const [dataSources, setDataSources] = useState<DataSourceItem[]>([defaultDataSource]);
  const [dataSource, setDataSource] = useState('default');

  useEffectOnce(() => {
    fetchDataSources();
  });

  useEffect(() => {
    getPits(dataSource);
  }, [dataSource]);

  const fetchDataSources = () => {
    getDataSources(savedObjects.client)
      .then((fetchedDataSources) => {
        if (fetchedDataSources?.length) {
          setDataSources(
            fetchedDataSources
              .concat([defaultDataSource])
              .sort((a, b) => a.sort.localeCompare(b.sort))
          );
        }
      })
      .catch(() => {
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to find existing data sources',
          })
        );
      });
  };

  const getPits = (dataSourceId?: string) => {
    // setMessage(<>Loading PITs...</>);
    setLoading(true);
    if (dataSourceId === 'default') {
      dataSourceId = undefined;
    }
    services
      .getAllPits(dataSourceId)
      .then((fetchedPits) => {
        setLoading(false);
        setPits(fetchedPits?.resp?.pits);
      })
      .catch(() => {
        setLoading(false);
        toasts.addDanger(
          i18n.translate('pitManagement.pitTable.fetchDataSourceError', {
            defaultMessage: 'Unable to fetch point in time objects.',
          })
        );
      });
  };

  const columns = [
    {
      field: 'pit_id',
      name: i18n.translate('pitManagement.pitTable.nameColumnName', {
        defaultMessage: 'Name',
      }),
    },
    {
      field: 'expires',
      name: i18n.translate('pitManagement.pitTable.expiresColumnName', {
        defaultMessage: 'Expires',
      }),
      sortable: true,
    },
    {
      field: 'dataSource',
      name: i18n.translate('pitManagement.pitTable.dataSourceColumnName', {
        defaultMessage: 'Data Source',
      }),
    },
    {
      field: 'creation_time',
      name: i18n.translate('pitManagement.pitTable.createdColumnName', {
        defaultMessage: 'Created',
      }),
      sortable: true,
    },
    {
      field: 'actions',
      name: i18n.translate('pitManagement.pitTable.actionsColumnName', {
        defaultMessage: 'Actions',
      }),
    },
  ];

  const renderToolsRight = () => {
    return [
      <EuiButton
        iconType="trash"
        key="loadUsers"
        isDisabled={pits.length === 0}
        data-test-subj="deletePITBtnInPitTable"
      >
        <FormattedMessage id="pitManagement.pitTable.deletePitButton" defaultMessage="Delete" />
      </EuiButton>,
    ];
  };

  function onQueryChange({ query }: { query: Query }) {
    if (query.ast.getFieldClauses('dataSource')) {
      const selectedDataSource = query.ast.getFieldClauses('dataSource')[0].value as string;
      setDataSource(selectedDataSource);
    }
  }

  const search: EuiSearchBarProps = {
    toolsRight: renderToolsRight(),
    defaultQuery: 'dataSource:""',
    onChange: onQueryChange,
    box: {
      incremental: true,
      schema: true,
      disabled: pits.length === 0,
    },
    filters: [
      {
        type: 'field_value_selection',
        searchThreshold: 5,
        field: 'dataSource',
        name: i18n.translate('pitManagement.pitTable.dataSourceFilterName', {
          defaultMessage: 'Data Source',
        }),
        multiSelect: false,
        options: dataSources.map((source) => ({
          value: source.id,
          name: source.title,
          view: `${source.title}`,
        })),
      },
    ],
  };

  const pagination = {
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  };

  return (
    <>
      <EuiPageContent
        className="pitTable"
        horizontalPosition="center"
        data-test-subj="pointInTimeTable"
      >
        <PageHeader />
        <EuiSpacer size="m" />
        <EuiPageContentBody>
          <EuiInMemoryTable
            items={pits}
            itemId="pit_id"
            loading={loading}
            message={message}
            columns={columns}
            search={search}
            pagination={pagination}
            sorting={true}
            isSelectable={true}
          />
        </EuiPageContentBody>
      </EuiPageContent>
    </>
  );
};

export const PITTableWithRouter = withRouter(PITTable);
