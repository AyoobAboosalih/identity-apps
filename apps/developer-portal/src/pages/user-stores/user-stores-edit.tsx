/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import { TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { ResourceTab } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Image } from "semantic-ui-react";
import { getAType, getAUserStore } from "../../api";
import {
    EditBasicDetailsUserStore,
    EditConnectionDetails,
    EditGroupDetails,
    EditUserDetails
} from "../../components";
import { DatabaseAvatarGraphic } from "../../configs";
import { history } from "../../helpers";
import { PageLayout } from "../../layouts"
import { AlertLevels, CategorizedProperties, UserStore, UserstoreType } from "../../models";
import { reOrganizeProperties } from "../../utils";

/**
 * Props for the Userstores edit page.
 */
type UserStoresEditPageInterface = TestableComponentInterface;

/**
 * Route parameters interface.
 */
interface RouteParams {
    id: string;
}

/**
 * This renders the userstore edit page.
 *
 * @param {UserStoresEditPageInterface & RouteComponentProps<RouteParams>} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const UserStoresEditPage: FunctionComponent<UserStoresEditPageInterface> = (
    props: UserStoresEditPageInterface & RouteComponentProps<RouteParams>
): ReactElement => {

    const {
        match,
        [ "data-testid" ]: testId
    } = props;

    const userStoreId = match.params.id;

    const [ userStore, setUserStore ] = useState<UserStore>(null);
    const [ type, setType ] = useState<UserstoreType>(null);
    const [ properties, setProperties ] = useState<CategorizedProperties>(null);

    const dispatch = useDispatch();

    const { t } = useTranslation();

    /**
     * Fetches the userstore by its id
     */
    const getUserStore = () => {
        getAUserStore(userStoreId).then(response => {
            setUserStore(response);
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description
                        || t("devPortal:components.userstores.notifications.fetchUserstores.genericError.description"),
                    level: AlertLevels.ERROR,
                    message: error?.message
                        || t("devPortal:components.userstores.notifications.fetchUserstores.genericError.message")
                }
            ));
        })
    };

    useEffect(() => {
        getUserStore();
    }, []);

    useEffect(() => {
        if (userStore) {
            getAType(userStore?.typeId, null).then((response) => {
                setType(response);
            }).catch(error => {
                dispatch(addAlert({
                    description: error?.description
                        || t("devPortal:components.userstores.notifications.fetchUserstoreMetadata." +
                            "genericError.description"),
                    level: AlertLevels.ERROR,
                    message: error?.message
                        || t("devPortal:components.userstores.notifications.fetchUserstoreMetadata" +
                            ".genericError.message")
                }));
            });
        }
    }, [ userStore ]);

    useEffect(() => {
        if (type) {
            setProperties(reOrganizeProperties(type.properties, userStore.properties));
        }
    }, [ type ]);

    /**
     * The tab panes
     */
    const panes = [
        {
            menuItem:  t ("devPortal:components.userstores.pageLayout.edit.tabs.general"),
            render: () => (
                <EditBasicDetailsUserStore
                    properties={ properties?.basic }
                    userStore={ userStore }
                    update={ getUserStore }
                    id={ userStoreId }
                    data-testid={ `${ testId }-userstore-basic-details-edit` }
                />
            )
        },
        {
            menuItem: t("devPortal:components.userstores.pageLayout.edit.tabs.connection"),
            render: () => (
                <EditConnectionDetails
                    update={ getUserStore }
                    type={ type }
                    id={ userStoreId }
                    properties={ properties?.connection }
                    data-testid={ `${ testId }-userstore-connection-details-edit` }
                />
            )
        },
        {
            menuItem: t("devPortal:components.userstores.pageLayout.edit.tabs.user"),
            render: () => (
                <EditUserDetails
                    update={ getUserStore }
                    type={ type }
                    id={ userStoreId }
                    properties={ properties?.user }
                    data-testid={ `${ testId }-userstore-user-details-edit` }
                />
            )
        },
        {
            menuItem: t("devPortal:components.userstores.pageLayout.edit.tabs.group"),
            render: () => (
                <EditGroupDetails
                    update={ getUserStore }
                    type={ type }
                    id={ userStoreId }
                    properties={ properties?.group }
                    data-testid={ `${ testId }-userstore-group-details-edit` }
                />
            )
        }
    ];

    return (
        <PageLayout
            image={
                <Image
                    floated="left"
                    verticalAlign="middle"
                    rounded
                    centered
                    size="tiny"
                >
                    <DatabaseAvatarGraphic.ReactComponent />
                </Image>
            }
            title={ userStore?.name }
            description={ t("devPortal:components.userstores.pageLayout.edit.description") }
            backButton={ {
                onClick: () => {
                    history.push("/user-stores");
                },
                text: t ("devPortal:components.userstores.pageLayout.edit.back") 
            } }
            titleTextAlign="left"
            bottomMargin={ false }
            data-testid={ `${ testId }-page-layout` }
        >
            <ResourceTab panes={ panes } data-testid={ `${ testId }-tabs` }/>
        </PageLayout>
    )
};

/**
 * Default props for the component.
 */
UserStoresEditPage.defaultProps = {
    "data-testid": "userstores-edit"
};
