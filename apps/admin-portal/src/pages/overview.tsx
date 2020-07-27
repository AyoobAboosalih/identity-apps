/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { getRolesList } from "@wso2is/core/api";
import { resolveUserDisplayName } from "@wso2is/core/helpers";
import { AlertLevels, ProfileInfoInterface, RolesInterface, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import {
    Heading,
    Jumbotron,
    PageLayout,
    StatsInsightsWidget,
    StatsOverviewWidget,
    StatsQuickLinksWidget,
    UserAvatar
} from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Grid, Icon, Responsive } from "semantic-ui-react";
import { getUserStores, getUsersList } from "../api";
import { RoleList, UsersList } from "../components";
import { OverviewPageIllustrations } from "../configs";
import { AppConstants, UIConstants } from "../constants";
import { history } from "../helpers";
import { QueryParams, UserListInterface } from "../models";
import { AppState } from "../store";

/**
 * Proptypes for the overview page component.
 */
type OverviewPageInterface = TestableComponentInterface;

/**
 * Overview page.
 *
 * @param {OverviewPageInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
const OverviewPage: FunctionComponent<OverviewPageInterface> = (
    props: OverviewPageInterface
): ReactElement => {

    const {
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const profileInfo: ProfileInfoInterface = useSelector((state: AppState) => state.profile.profileInfo);
    const isProfileInfoLoading: boolean = useSelector(
        (state: AppState) => state.loaders.isProfileInfoRequestLoading);
    const [ usersList, setUsersList ] = useState<UserListInterface>({});
    const [ isUserListRequestLoading, setUserListRequestLoading ] = useState<boolean>(false);
    const [ groupList, setGroupsList ] = useState<RolesInterface[]>([]);
    const [ isGroupsListRequestLoading, setGroupsListRequestLoading ] = useState<boolean>(false);
    const [ userstoresCount, setUserstoresCount ] = useState<number>(0);
    const [ userCount, setUsersCount ] = useState<number>(0);
    const [ groupCount, setGroupCount ] = useState<number>(0);

    useEffect(() => {
        getUserstoresList(null, null, null, null);
        getUserList(UIConstants.DEFAULT_STATS_LIST_ITEM_LIMIT, null, null, null, null);
        getGroupsList();
    }, []);

    const getUserList = (limit: number, offset: number, filter: string, attribute: string, domain: string) => {
        setUserListRequestLoading(true);

        getUsersList(limit, offset, filter, attribute, domain)
            .then((response) => {
                setUsersList(response);
                setUsersCount(response?.totalResults);
            })
            .finally(() => {
                setUserListRequestLoading(false);
            });
    };

    const getGroupsList = () => {
        setGroupsListRequestLoading(true);

        getRolesList(undefined)
            .then((response) => {
                if (response.status === 200) {
                    const roleResources = response.data.Resources;
                    if (roleResources && roleResources instanceof Array && roleResources.length !== 0) {
                        const updatedResources = roleResources.filter((role: RolesInterface) => {
                            return !role.displayName.includes("Application/")
                                && !role.displayName.includes("Internal/");
                        });
                        response.data.Resources = updatedResources;
                        setGroupsList(updatedResources);
                        setGroupCount(updatedResources.length);
                        
                        return;
                    }

                    setGroupsList([]);
                }
            })
            .finally(() => {
                setGroupsListRequestLoading(false);
            });
    };

    /**
     * Fetches all userstores.
     *
     * @param {number} limit - List limit.
     * @param {string} sort - Sort strategy.
     * @param {number} offset - List offset.
     * @param {string} filter - Search query.
     */
    const getUserstoresList = (limit?: number, sort?: string, offset?: number, filter?: string) => {
        const params: QueryParams = {
            filter: filter || null,
            limit: limit || null,
            offset: offset || null,
            sort: sort || null
        };

        getUserStores(params)
            .then(response => {
                if (response && response instanceof Array) {
                    setUserstoresCount(response.length)
                }
            })
            .catch(error => {
                dispatch(addAlert(
                    {
                        description: error?.description
                            || t("adminPortal:components.userstores.notifications.fetchUserstores.genericError" +
                                ".description"),
                        level: AlertLevels.ERROR,
                        message: error?.message
                            || t("adminPortal:components.userstores.notifications.fetchUserstores.genericError" +
                                ".message")
                    }
                ));
            });
    };

    const resolveGridContent = () => (
        <>
            <Grid.Column className="with-bottom-gutters">
                <StatsQuickLinksWidget
                    heading={ t("adminPortal:components.overview.widgets.quickLinks.heading") }
                    subHeading={ t("adminPortal:components.overview.widgets.quickLinks.subHeading") }
                    links={ [
                        {
                            description: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".groups.subHeading"),
                            header: t("adminPortal:components.overview.widgets.quickLinks.cards.groups" +
                                ".heading"),
                            image: OverviewPageIllustrations.quickLinks.groups,
                            onClick: () => {
                                history.push(AppConstants.PATHS.get("GROUPS"))
                            }
                        },
                        {
                            description: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".roles.subHeading"),
                            header: t("adminPortal:components.overview.widgets.quickLinks.cards.roles" +
                                ".heading"),
                            image: OverviewPageIllustrations.quickLinks.roles,
                            onClick: () => {
                                history.push(AppConstants.PATHS.get("ROLES"))
                            }
                        },
                        {
                            description: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".dialects.subHeading"),
                            header: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".dialects.heading"),
                            image: OverviewPageIllustrations.quickLinks.dialects,
                            onClick: () => {
                                history.push(AppConstants.PATHS.get("CLAIM_DIALECTS"))
                            }
                        },
                        {
                            description: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".certificates.subHeading"),
                            header: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".certificates.heading"),
                            image: OverviewPageIllustrations.quickLinks.certificates,
                            onClick: () => {
                                history.push(AppConstants.PATHS.get("CERTIFICATES"))
                            }
                        },
                        {
                            description: t("adminPortal:components.overview.widgets.quickLinks" +
                                ".cards.generalConfigs.subHeading"),
                            header: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".generalConfigs.heading"),
                            image: OverviewPageIllustrations.quickLinks.generalConfigs,
                            onClick: () => {
                                history.push(AppConstants.PATHS.get("SERVER_CONFIGS"))
                            }
                        },
                        {
                            description: t("adminPortal:components.overview.widgets.quickLinks" +
                                ".cards.emailTemplates.subHeading"),
                            header: t("adminPortal:components.overview.widgets.quickLinks.cards" +
                                ".emailTemplates.heading"),
                            image: OverviewPageIllustrations.quickLinks.emailTemplates,
                            onClick: () => {
                                history.push(AppConstants.PATHS.get("EMAIL_TEMPLATES"))
                            }
                        }
                    ] }
                />
            </Grid.Column>
            <Grid.Column className="with-bottom-gutters">
                <StatsInsightsWidget
                    heading={ t("adminPortal:components.overview.widgets.insights.groups.heading") }
                    subHeading={ t("adminPortal:components.overview.widgets.insights.groups.subHeading") }
                    primaryAction={ <><Icon name="location arrow"/>{ t("common:explore") }</> }
                    onPrimaryActionClick={ () => history.push(AppConstants.PATHS.get("GROUPS")) }
                    showExtraContent={ groupList instanceof Array && groupList.length > 0 }
                >
                    <RoleList
                        selection
                        defaultListItemLimit={ UIConstants.DEFAULT_STATS_LIST_ITEM_LIMIT }
                        data-testid="group-mgt-groups-list"
                        isGroup={ true }
                        isLoading={ isGroupsListRequestLoading }
                        onEmptyListPlaceholderActionClick={ () => history.push(AppConstants.PATHS.get("GROUPS")) }
                        showListItemActions={ false }
                        actionsColumnWidth={ 1 }
                        descriptionColumnWidth={ 14 }
                        metaColumnWidth={ 1 }
                        showMetaContent={ false }
                        roleList={ groupList }
                    />
                </StatsInsightsWidget>
            </Grid.Column>
            <Grid.Column className="with-bottom-gutters">
                <StatsInsightsWidget
                    heading={ t("adminPortal:components.overview.widgets.insights.users.heading") }
                    subHeading={ t("adminPortal:components.overview.widgets.insights.users.subHeading") }
                    primaryAction={ <><Icon name="location arrow"/>{ t("common:explore") }</> }
                    onPrimaryActionClick={ () => history.push(AppConstants.PATHS.get("USERS")) }
                    showExtraContent={
                        usersList?.Resources
                        && usersList.Resources instanceof Array
                        && usersList.Resources.length > 0
                    }
                >
                    <UsersList
                        selection
                        defaultListItemLimit={ UIConstants.DEFAULT_STATS_LIST_ITEM_LIMIT }
                        isLoading={ isUserListRequestLoading }
                        usersList={ usersList }
                        onEmptyListPlaceholderActionClick={ () => history.push(AppConstants.PATHS.get("USERS")) }
                        showListItemActions={ false }
                        actionsColumnWidth={ 1 }
                        descriptionColumnWidth={ 14 }
                        metaColumnWidth={ 1 }
                        showMetaContent={ false }
                        data-testid={ `${ testId }-list` }
                    />
                </StatsInsightsWidget>
            </Grid.Column>
        </>
    );

    return (
        <PageLayout
            contentTopMargin={ false }
            data-testid={ `${ testId }-page-layout` }
        >
            <Jumbotron
                bordered
                background="white"
                contentInline
                iconOptions={ {
                    fill: "primary"
                } }
                data-testid={ `${ testId }-jumbotron` }
            >
                <div className="inline-flex">
                    <UserAvatar
                        inline
                        profileInfo={ profileInfo }
                        isLoading={ isProfileInfoLoading }
                        spaced="right"
                        size="x60"
                    />
                    <div>
                        <Heading as="h1" ellipsis compact>
                            {
                                t(
                                    "adminPortal:pages.overview.title",
                                    { firstName: resolveUserDisplayName(profileInfo) }
                                )
                            }
                        </Heading>
                        <Heading as="h5" subHeading ellipsis>
                            { t("adminPortal:pages.overview.subTitle") }
                        </Heading>
                    </div>
                </div>
            </Jumbotron>
            <Divider hidden />
            <StatsOverviewWidget
                heading={ t("adminPortal:components.overview.widgets.overview.heading") }
                subHeading={ t("adminPortal:components.overview.widgets.overview.subHeading") }
                stats={ [
                    {
                        icon: OverviewPageIllustrations.statsOverview.users,
                        iconOptions: {
                            background: "accent1",
                            fill: "white"
                        },
                        label: t("adminPortal:components.overview.widgets.overview.cards.users.heading"),
                        value: userCount
                    },
                    {
                        icon: OverviewPageIllustrations.statsOverview.groups,
                        iconOptions: {
                            background: "accent2",
                            fill: "white"
                        },
                        label: t("adminPortal:components.overview.widgets.overview.cards.groups.heading"),
                        value: groupCount
                    },
                    {
                        icon: OverviewPageIllustrations.statsOverview.userstores,
                        iconOptions: {
                            background: "accent3",
                            fill: "white"
                        },
                        label: t("adminPortal:components.overview.widgets.overview.cards.userstores.heading"),
                        value: userstoresCount
                    }
                ] }
            />
            <Divider hidden/>
            <Grid>
                <Responsive
                    as={ Grid.Row }
                    columns={ 3 }
                    minWidth={ Responsive.onlyComputer.minWidth }
                >
                    { resolveGridContent() }
                </Responsive>
                <Responsive
                    as={ Grid.Row }
                    columns={ 1 }
                    maxWidth={ Responsive.onlyComputer.minWidth }
                >
                    { resolveGridContent() }
                </Responsive>
            </Grid>
        </PageLayout>
    );
};

/**
 * Default props for the component.
 */
OverviewPage.defaultProps = {
    "data-testid": "overview-page"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default OverviewPage;
