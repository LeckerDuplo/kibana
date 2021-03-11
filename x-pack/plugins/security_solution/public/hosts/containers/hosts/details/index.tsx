/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getOr } from 'lodash/fp';
import React from 'react';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { inputsModel, inputsSelectors, State } from '../../../../common/store';
import { getDefaultFetchPolicy } from '../../../../common/containers/helpers';
import { QueryTemplate, QueryTemplateProps } from '../../../../common/containers/query_template';

import { HostOverviewQuery } from './host_overview.gql_query';
import { GetHostOverviewQuery, HostItem } from '../../../../graphql/types';

const ID = 'hostOverviewQuery';

export interface HostOverviewArgs {
  id: string;
  inspect: inputsModel.InspectQuery;
  hostOverview: HostItem;
  loading: boolean;
  refetch: inputsModel.Refetch;
  startDate: string;
  endDate: string;
}

export interface HostOverviewReduxProps {
  isInspected: boolean;
}

export interface OwnProps extends QueryTemplateProps {
  children: (args: HostOverviewArgs) => React.ReactNode;
  hostName: string;
  startDate: string;
  endDate: string;
}

type HostsOverViewProps = OwnProps & HostOverviewReduxProps;

class HostOverviewByNameComponentQuery extends QueryTemplate<
  HostsOverViewProps,
  GetHostOverviewQuery.Query,
  GetHostOverviewQuery.Variables
> {
  public render() {
    const {
      id = ID,
      indexNames,
      isInspected,
      children,
      hostName,
      skip,
      sourceId,
      startDate,
      endDate,
    } = this.props;
    return (
      <Query<GetHostOverviewQuery.Query, GetHostOverviewQuery.Variables>
        query={HostOverviewQuery}
        fetchPolicy={getDefaultFetchPolicy()}
        notifyOnNetworkStatusChange
        skip={skip}
        variables={{
          sourceId,
          hostName,
          timerange: {
            interval: '12h',
            from: startDate,
            to: endDate,
          },
          defaultIndex: indexNames,
          inspect: isInspected,
        }}
      >
        {({ data, loading, refetch }) => {
          const hostOverview = getOr([], 'source.HostOverview', data);
          return children({
            id,
            inspect: getOr(null, 'source.HostOverview.inspect', data),
            refetch,
            loading,
            hostOverview,
            startDate,
            endDate,
          });
        }}
      </Query>
    );
  }
}

const makeMapStateToProps = () => {
  const getQuery = inputsSelectors.globalQueryByIdSelector();
  const mapStateToProps = (state: State, { id = ID }: OwnProps) => {
    const { isInspected } = getQuery(state, id);
    return {
      isInspected,
    };
  };
  return mapStateToProps;
};

export const HostOverviewByNameQuery = compose<React.ComponentClass<OwnProps>>(
  connect(makeMapStateToProps)
)(HostOverviewByNameComponentQuery);
