import { networkLinks } from '@polymeshassociation/extension-core/constants';
import { NetworkName } from '@polymeshassociation/extension-core/types';
import {
  SvgDotsVertical,
  SvgLockOutline,
  SvgOpenInNew,
  SvgSettingsOutline,
  SvgViewDashboard,
} from '@polymeshassociation/extension-ui/assets/images/icons';
import {
  AccountContext,
  OptionSelector,
  PolymeshContext,
} from '@polymeshassociation/extension-ui/components';
import { Option } from '@polymeshassociation/extension-ui/components/OptionSelector/types';
import useIsPopup from '@polymeshassociation/extension-ui/hooks/useIsPopup';
import {
  setPolyNetwork,
  togglePolyIsDev,
  windowOpen,
} from '@polymeshassociation/extension-ui/messaging';
import {
  Checkbox,
  Flex,
  GrowingButton,
  Icon,
} from '@polymeshassociation/extension-ui/ui';
import {
  Header,
  HeaderProps,
} from '@polymeshassociation/extension-ui/ui/Header/Header';
import React, { ReactElement, useCallback, useContext } from 'react';
import { useHistory } from 'react-router';

import { NetworkSelector } from '../Accounts/NetworkSelector';

export type Props = HeaderProps;

const AppHeader = (props: Props): ReactElement<Props> => {
  const { accounts } = useContext(AccountContext);
  const { children, ...rest } = props;
  const hasNonHardwareAccount = accounts.some((account) => !account.isHardware);
  const {
    networkState: { isDeveloper, selected: selectedNetwork },
  } = useContext(PolymeshContext);
  const history = useHistory();
  const isPopup = useIsPopup();

  const setNetwork = async (_network: NetworkName) => {
    if (_network !== selectedNetwork) {
      await setPolyNetwork(_network);
    }
  };

  const openDashboard = useCallback(() => {
    const url = networkLinks[selectedNetwork].dashboard;

    if (url) chrome.tabs.create({ url });
  }, [selectedNetwork]);

  const topMenuOptions: Option[] = [
    {
      menu: [
        ...(hasNonHardwareAccount
          ? [
              {
                label: 'Change password',
                value: 'changePassword',
                icon: (
                  <Icon
                    Asset={SvgLockOutline}
                    color="gray5"
                    height={24}
                    width={24}
                  />
                ),
              },
            ]
          : []),
        {
          label: 'Open in a new tab',
          value: 'newWindow',
          icon: (
            <Icon Asset={SvgOpenInNew} color="gray5" height={24} width={24} />
          ),
        },
        {
          label: 'Manage connected dApps',
          value: 'manageUrlAuth',
          icon: (
            <Icon
              Asset={SvgSettingsOutline}
              color="gray5"
              height={24}
              width={24}
            />
          ),
        },
        {
          label: 'Display development networks',
          value: 'toggleIsDev',
          icon: (
            <Flex justifyContent="center" width={24}>
              <Checkbox checked={isDeveloper} disabled />
            </Flex>
          ),
        },
      ],
    },
  ];

  const handleTopMenuSelection = (value: string) => {
    switch (value) {
      case 'changePassword':
        return isPopup
          ? windowOpen('/account/change-password')
          : history.push('/account/change-password');
      case 'newWindow':
        return windowOpen('/');
      case 'toggleIsDev':
        return togglePolyIsDev();
      case 'manageUrlAuth':
        return history.push('/settings/url-auth');
    }
  };

  return (
    <Header {...rest}>
      <Flex
        alignItems="center"
        flexDirection="row"
        justifyContent="space-between"
        mb="m"
      >
        <NetworkSelector onSelect={setNetwork} />
        <Flex flexDirection="row" justifyContent="center">
          <GrowingButton icon={SvgViewDashboard} onClick={openDashboard} />
          <OptionSelector
            className="settings-menu"
            minWidth="368px"
            onSelect={handleTopMenuSelection}
            options={topMenuOptions}
            position="bottom-right"
            selector={
              <Icon
                Asset={SvgDotsVertical}
                color="polyIndigo"
                height={32}
                style={{ cursor: 'pointer' }}
                width={32}
              />
            }
          />
        </Flex>
      </Flex>
      {children}
    </Header>
  );
};

export default AppHeader;
