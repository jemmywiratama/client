import * as I from 'immutable'
import React from 'react'
import * as Sb from '../../../stories/storybook'
import * as Types from '../../../constants/types/fs'
import * as Constants from '../../../constants/fs'
import {isMobile} from '../../../constants/platform'
import {Box} from '../../../common-adapters'
import {WrapRow} from './rows'
import ConnectedStillRow from './still-container'
import TlfTypeRow from './tlf-type'
import TlfRow from './tlf'
import StillRow from './still'
import EditingRow from './editing'
import PlaceholderRow from './placeholder'
import * as RowTypes from './types'
import {commonProvider} from '../../common/index.stories'
import {topBarProvider} from '../../top-bar/index.stories'
import {asRows as topBarAsRow} from '../../top-bar'

export const rowsProvider = {
  ConnectedOpenHOC: (ownProps: any) => ({
    ...ownProps,
    onOpen: Sb.action('onOpen'),
  }),
  ConnectedRows: (o: any) => ({
    destinationPickerIndex: o.destinationPickerIndex,
    emptyMode: 'not-empty',
    items: [
      ...(o.headerRows || []),
      ...topBarAsRow(o.path),
      {
        key: 'me',
        name: 'me',
        path: Types.stringToPath('/keybase/private/me'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,abc',
        name: 'me,abc',
        path: Types.stringToPath('/keybase/private/me,empty'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,abc,def',
        name: 'me,abc,def',
        path: Types.stringToPath('/keybase/private/me,abc,def'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,abc,def,ghi',
        name: 'me,abc,def,ghi',
        path: Types.stringToPath('/keybase/private/me,abc,def,ghi'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,def',
        name: 'me,def',
        path: Types.stringToPath('/keybase/private/me,def'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,def,ghi',
        name: 'me,def,ghi',
        path: Types.stringToPath('/keybase/private/me,def,ghi'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,ghi',
        name: 'me,ghi',
        path: Types.stringToPath('/keybase/private/me,ghi'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: 'me,abc,ghi',
        name: 'me,abc,ghi',
        path: Types.stringToPath('/keybase/private/me,abc,ghi'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '1',
        name: '1',
        path: Types.stringToPath('/keybase/private/meatball/1'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '2',
        name: '2',
        path: Types.stringToPath('/keybase/private/meatball/2'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '3',
        name: '3',
        path: Types.stringToPath('/keybase/private/meatball/3'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '4',
        name: '4',
        path: Types.stringToPath('/keybase/private/meatball/4'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '5',
        name: '5',
        path: Types.stringToPath('/keybase/private/meatball/5'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '6',
        name: '6',
        path: Types.stringToPath('/keybase/private/meatball/dir/6'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '7',
        name: '7',
        path: Types.stringToPath('/keybase/private/meatball/dir/7'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '8',
        name: '8',
        path: Types.stringToPath('/keybase/private/meatball/dir/8'),
        rowType: RowTypes.RowType.Still,
      },
      {
        key: '9',
        name: '9',
        path: Types.stringToPath('/keybase/private/meatball/dir/9'),
        rowType: RowTypes.RowType.Still,
      },
      ...(!isMobile && typeof o.destinationPickerIndex === 'number'
        ? [
            {key: 'empty:0', rowType: RowTypes.RowType.Empty},
            {key: 'empty:1', rowType: RowTypes.RowType.Empty},
          ]
        : []),
    ],
  }),
  ConnectedTlfTypeRow: ({destinationPickerIndex, name}) => ({
    badgeCount: 0,
    destinationPickerIndex,
    name,
    path: Types.stringToPath(`/keybase/${name}`),
  }),
  LoadFilesWhenNeeded: ({path}: any) => ({
    loadFavorites: Sb.action('loadFavorites'),
    loadFolderListWithRefreshTag: Sb.action('loadFolderListWithRefreshTag'),
    loadFolderListWithoutRefreshTag: Sb.action('loadFolderListWithoutRefreshTag'),
    path,
    syncingFoldersProgress: Constants.emptySyncingFoldersProgress,
  }),
  SortBar: () => ({
    folderIsPending: true,
    sortSetting: Types.SortSetting.NameAsc,
    sortSettingToAction: Sb.action('sortSettingToAction'),
  }),
  Still: ({path, destinationPickerIndex}: {destinationPickerIndex?: number; path: Types.Path}) => {
    const pathStr = Types.pathToString(path)
    return {
      destinationPickerIndex,
      isEmpty: pathStr.includes('empty'),
      name: Types.getPathName(path),
      path,
      type: Types.PathType.Folder,
    }
  },
}

const provider = Sb.createPropProviderWithCommon({
  ...commonProvider,
  ...topBarProvider,
  ...rowsProvider,
})

const makeEditingRowNameProps = (name: string) => ({
  hint: name,
  name,
  projectedPath: Types.stringToPath(`/keybase/team/kbkbfstest/${name}`),
})

const load = () =>
  Sb.storiesOf('Files', module)
    .addDecorator(provider)
    .addDecorator(Sb.scrollViewDecorator)
    .add('Rows', () => (
      <Box>
        <WrapRow key="1">
          <ConnectedStillRow path={Types.stringToPath('/keybase/private/meatball/a')} />
        </WrapRow>
        <WrapRow key="2">
          <EditingRow
            {...makeEditingRowNameProps('New Folder (editing)')}
            status={Types.EditStatusType.Editing}
            isCreate={true}
            {...commonRowProps}
          />
        </WrapRow>
        <WrapRow key="3">
          <EditingRow
            {...makeEditingRowNameProps('From Dropbox (rename) (editing)')}
            status={Types.EditStatusType.Editing}
            isCreate={false}
            {...commonRowProps}
          />
        </WrapRow>
        <WrapRow key="4">
          <EditingRow
            {...makeEditingRowNameProps('New Folder (saving)')}
            status={Types.EditStatusType.Saving}
            isCreate={true}
            {...commonRowProps}
          />
        </WrapRow>
        <WrapRow key="5">
          <EditingRow
            {...makeEditingRowNameProps('New Folder (failed)')}
            status={Types.EditStatusType.Failed}
            isCreate={true}
            {...commonRowProps}
          />
        </WrapRow>
        <WrapRow key="6">
          <StillRow
            isEmpty={false}
            path={Types.stringToPath('/keybase/team/kbkbfstest/foo')}
            type={Types.PathType.Folder}
            writingToJournal={true}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="7">
          <StillRow
            isEmpty={false}
            path={Types.stringToPath('/keybase/team/kbkbfstest/dir/foo')}
            type={Types.PathType.File}
            writingToJournal={true}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="8">
          <StillRow
            isEmpty={false}
            path={Types.stringToPath('/keybase/team/kbkbfstest/dir/foo')}
            type={Types.PathType.File}
            writingToJournal={true}
            uploading={true}
          />
        </WrapRow>
        <WrapRow key="9">
          <StillRow
            isEmpty={false}
            path={Types.stringToPath(
              '/keybase/team/kbkbfstest/dir/foo-obnoxiously-long-aslkdjhfalskjdhfaklsjdfhalksdjfhasdf-asdflkasjdfhlaksdjfh-asdhflaksjdhfaskd.mpeg4'
            )}
            type={Types.PathType.File}
            writingToJournal={false}
            uploading={true}
          />
        </WrapRow>
        <WrapRow key="10">
          <StillRow
            isEmpty={false}
            path={Types.stringToPath('/keybase/team/kbkbfstest/dir/foo')}
            type={Types.PathType.File}
            writingToJournal={false}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="11">
          <StillRow
            isEmpty={false}
            path={Types.stringToPath('/keybase/team/kbkbfstest/dir/foo')}
            type={Types.PathType.File}
            writingToJournal={false}
            uploading={false}
            uploadErrorRetry={Sb.action('uploadErrorRetry')}
          />
        </WrapRow>
        <WrapRow key="download-normal">
          <StillRow
            path={Types.stringToPath('/keybase/private/foo/dir/bar')}
            type={Types.PathType.File}
            intentIfDownloading={Types.DownloadIntent.None}
            onOpen={Sb.action('onOpen')}
            isEmpty={false}
            writingToJournal={false}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="download-save">
          <StillRow
            path={Types.stringToPath('/keybase/private/foo/dir/bar')}
            type={Types.PathType.File}
            intentIfDownloading={Types.DownloadIntent.CameraRoll}
            onOpen={Sb.action('onOpen')}
            isEmpty={false}
            writingToJournal={false}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="download-share">
          <StillRow
            path={Types.stringToPath('/keybase/private/foo/dir/bar')}
            type={Types.PathType.File}
            intentIfDownloading={Types.DownloadIntent.Share}
            onOpen={Sb.action('onOpen')}
            isEmpty={false}
            writingToJournal={false}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="13">
          <PlaceholderRow type={Types.PathType.Folder} />
        </WrapRow>
        <WrapRow key="14">
          <PlaceholderRow type={Types.PathType.File} />
        </WrapRow>
        <WrapRow key="15">
          <ConnectedStillRow path={Types.stringToPath('/keybase/private/meatball/empty')} />
        </WrapRow>
        <WrapRow key="16">
          <StillRow
            path={Types.stringToPath('/keybase/private/foo/bar/baz')}
            type={Types.PathType.File}
            onOpen={Sb.action('onOpen')}
            isEmpty={false}
            writingToJournal={false}
            uploading={false}
          />
        </WrapRow>
        <WrapRow key="17">
          <TlfTypeRow
            path={Types.stringToPath('/keybase/private')}
            badgeCount={0}
            onOpen={Sb.action('onOpen')}
          />
        </WrapRow>
        <WrapRow key="18">
          <TlfTypeRow
            path={Types.stringToPath('/keybase/private')}
            badgeCount={3}
            onOpen={Sb.action('onOpen')}
          />
        </WrapRow>
        <WrapRow key="19">
          <TlfRow
            path={Types.stringToPath('/keybase/private/alice,bob,charlie')}
            isIgnored={false}
            isNew={true}
            onOpen={Sb.action('onOpen')}
            usernames={I.List(['bob', 'charlie'])}
          />
        </WrapRow>
        <WrapRow key="20">
          <TlfRow
            path={Types.stringToPath('/keybase/private/alice,bob,charlie')}
            isIgnored={false}
            isNew={true}
            onOpen={Sb.action('onOpen')}
            usernames={I.List(['bob', 'charlie'])}
          />
        </WrapRow>
        <WrapRow key="21">
          <TlfRow
            path={Types.stringToPath('/keybase/private/alice,bob,charlie,david,eve,felicity,george')}
            isIgnored={false}
            isNew={true}
            onOpen={Sb.action('onOpen')}
            usernames={I.List(['bob', 'charlie', 'david', 'eve', 'felicity', 'george'])}
          />
        </WrapRow>
      </Box>
    ))

const commonRowProps = {
  onCancel: Sb.action('onCancel'),
  onSubmit: Sb.action('onSubmit'),
  onUpdate: Sb.action('onUpdate'),
}

export default load
