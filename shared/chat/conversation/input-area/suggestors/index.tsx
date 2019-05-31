import * as React from 'react'
import * as Kb from '../../../../common-adapters'
import * as Styles from '../../../../styles'
import {invert} from 'lodash-es'
import SuggestionList from './suggestion-list'

type TransformerData = {
  text: string
  position: {
    start: number
    end: number
  }
}

const standardTransformer = (
  toInsert: string,
  {text, position: {start, end}}: TransformerData,
  preview: boolean
) => {
  const newText = `${text.substring(0, start)}${toInsert}${preview ? '' : ' '}${text.substring(end)}`
  const newSelection = start + toInsert.length + (preview ? 0 : 1)
  return {selection: {end: newSelection, start: newSelection}, text: newText}
}

const matchesMarker = (
  word: string,
  marker: string | RegExp
): {
  marker: string
  matches: boolean
} => {
  if (typeof marker === 'string') {
    return {marker, matches: word.startsWith(marker)}
  }
  const match = word.match(marker)
  if (!match) {
    return {marker: '', matches: false}
  }
  return {marker: match[0] || '', matches: true}
}

type AddSuggestorsProps = {
  dataSources: {[K in string]: (filter: string) => Array<any>}
  keyExtractors?: {[K in string]: (item: any) => string | number}
  renderers: {[K in string]: (item: any, selected: boolean) => React.ElementType}
  suggestionListStyle?: Styles.StylesCrossPlatform
  suggestionOverlayStyle?: Styles.StylesCrossPlatform
  suggestorToMarker: {[K in string]: string | RegExp}
  transformers: {
    [K in string]: (
      item: any,
      marker: string,
      tData: TransformerData,
      preview: boolean
    ) => {
      text: string
      selection: {
        start: number
        end: number
      }
    }
  }
}

type AddSuggestorsState = {
  active: string | null
  filter: string
  selected: number
}

type SuggestorHooks = {
  suggestionsVisible: boolean
  inputRef: {
    current: React.RefObject<typeof Kb.PlainInput> | null
  }
  onChangeText: (arg0: string) => void
  onKeyDown: (event: React.KeyboardEvent, isComposingIME: boolean) => void
  onBlur: () => void
  onFocus: () => void
  onSelectionChange: (arg0: {start: number; end: number}) => void
}

export type PropsWithSuggestorOuter<P> = {} & P & AddSuggestorsProps

export type PropsWithSuggestor<P> = {} & P & SuggestorHooks

const AddSuggestors = <WrappedOwnProps extends {}>(
  // ts is losing the types here anyways
  WrappedComponent: any // React.ComponentType<PropsWithSuggestor<WrappedOwnProps>>
): React.Component<PropsWithSuggestorOuter<WrappedOwnProps>> => {
  type SuggestorsComponentProps = {
    forwardedRef: React.Ref<typeof WrappedComponent> | null
  } & PropsWithSuggestorOuter<WrappedOwnProps>

  class SuggestorsComponent extends React.Component<any /* SuggestorsComponentProps */, AddSuggestorsState> {
    state = {active: null, filter: '', selected: 0}
    _inputRef = React.createRef<Kb.PlainInput>()
    _attachmentRef = React.createRef()
    _lastText = null
    _suggestors = Object.keys(this.props.suggestorToMarker)
    _markerToSuggestor: {[K in string]: string} = invert(this.props.suggestorToMarker)
    _timeoutID: NodeJS.Timer

    componentWillUnmount() {
      clearTimeout(this._timeoutID)
    }

    _setAttachmentRef = (r: null | typeof WrappedComponent) => {
      // @ts-ignore thinks this is ready only: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065
      this._attachmentRef.current = r
      if (typeof this.props.forwardedRef === 'function') {
        // @ts-ignore thinks this is ready only: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065
        this.props.forwardedRef(r)
      } else if (this.props.forwardedRef && typeof this.props.forwardedRef !== 'string') {
        // @ts-ignore thinks this is ready only: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065
        this.props.forwardedRef.current = r
      } // intentionally not supporting string refs
    }

    _getInputRef = () => this._inputRef.current
    _getAttachmentRef = () => this._attachmentRef.current

    _setInactive = () => this.setState(s => (s.active ? {active: null, filter: '', selected: 0} : null))

    _getWordAtCursor = () => {
      if (this._inputRef.current) {
        const input = this._inputRef.current
        const selection = input.getSelection()
        if (!selection || this._lastText === null) {
          return null
        }
        const text = this._lastText
        const upToCursor = text.substring(0, selection.start)
        const words = upToCursor.split(/ |\n/)
        const word = words[words.length - 1]
        const position = {end: selection.start, start: selection.start - word.length}
        return {position, word}
      }
      return null
    }

    _stabilizeSelection = () => {
      const results = this._getResults()
      if (this.state.selected > results.length - 1) {
        this.setState({selected: 0})
      }
    }

    _checkTrigger = text => {
      this._timeoutID = setTimeout(() => {
        // inside a timeout so selection will settle, there was a problem where
        // desktop would get the previous selection on arrowleft / arrowright
        const cursorInfo = this._getWordAtCursor()
        if (!cursorInfo) {
          return
        }
        const {word} = cursorInfo
        if (this.state.active) {
          const activeMarker = this.props.suggestorToMarker[this.state.active]
          const matchInfo = matchesMarker(word, activeMarker)
          if (!matchInfo.matches) {
            // not active anymore
            this._setInactive()
          } else {
            this.setState({filter: word.substring(matchInfo.marker.length)}, this._stabilizeSelection)
            return
          }
        }
        // @ts-ignore we know entries will give this type
        for (let [suggestor, marker]: [string, string | RegExp] of Object.entries(
          this.props.suggestorToMarker
        )) {
          // @ts-ignore
          const matchInfo = matchesMarker(word, marker)
          if (matchInfo.matches && this._inputRef.current && this._inputRef.current.isFocused()) {
            this.setState({active: suggestor, filter: word.substring(matchInfo.marker.length)})
          }
        }
      }, 0)
    }

    _validateProps = () => {
      const {active} = this.state
      if (!active) {
        return
      }
      if (
        !this.props.dataSources[active] ||
        !this.props.renderers[active] ||
        !this.props.suggestorToMarker[active] ||
        !this.props.transformers[active]
      ) {
        throw new Error(
          `AddSuggestors: invalid props for suggestor '${active}', did you miss a key somewhere?`
        )
      }
    }

    _move = (up: boolean) => {
      this.setState(
        s => {
          if (!s.active) {
            return null
          }
          const length = this._getResults().length
          const selected = (((up ? s.selected - 1 : s.selected + 1) % length) + length) % length
          return selected === s.selected ? null : {selected}
        },
        () => this._triggerTransform(this._getSelected(), false)
      )
    }

    _onChangeText = text => {
      this._lastText = text
      // $FlowIssue TODO (DA) but I don't think this is an issue
      this.props.onChangeText && this.props.onChangeText(text)
      this._checkTrigger(text)
    }

    _onKeyDown = (evt: React.KeyboardEvent, ici: boolean) => {
      if (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') {
        this._checkTrigger(this._lastText || '')
      }

      if (!this.state.active || this._getResults().length === 0) {
        // not showing list, bail
        // $FlowIssue TODO (DA) but I don't think this is an issue
        this.props.onKeyDown && this.props.onKeyDown(evt, ici)
        return
      }

      let shouldCallParentCallback = true

      // check trigger keys (up, down, enter, tab)
      if (evt.key === 'ArrowDown') {
        evt.preventDefault()
        this._move(false)
        shouldCallParentCallback = false
      } else if (evt.key === 'ArrowUp') {
        evt.preventDefault()
        this._move(true)
        shouldCallParentCallback = false
      } else if (evt.key === 'Enter') {
        evt.preventDefault()
        this._triggerTransform(this._getResults()[this.state.selected])
        shouldCallParentCallback = false
      } else if (evt.key === 'Tab') {
        evt.preventDefault()
        if (this.state.filter.length) {
          this._triggerTransform(this._getSelected())
        } else {
          // shift held -> move up
          this._move(evt.shiftKey)
        }
        shouldCallParentCallback = false
      }

      if (shouldCallParentCallback) {
        // $FlowIssue TODO (DA) but I don't think this is an issue
        this.props.onKeyDown && this.props.onKeyDown(evt, ici)
      }
    }

    _onBlur = () => {
      // $FlowIssue TODO (DA) but I don't think this is an issue
      this.props.onBlur && this.props.onBlur()
      this._setInactive()
    }

    _onFocus = () => {
      // $FlowIssue TODO (DA) but I don't think this is an issue
      this.props.onFocus && this.props.onFocus()
      this._checkTrigger(this._lastText || '')
    }

    _onSelectionChange = selection => {
      // $FlowIssue TODO (DA) but I don't think this is an issue
      this.props.onSelectionChange && this.props.onSelectionChange()
      this._checkTrigger(this._lastText || '')
    }

    _triggerTransform = (value, final = true) => {
      if (this._inputRef.current && this.state.active) {
        const input = this._inputRef.current
        const active = this.state.active
        const cursorInfo = this._getWordAtCursor()
        if (!cursorInfo) {
          return
        }
        const matchInfo = matchesMarker(cursorInfo.word, this.props.suggestorToMarker[active])
        const transformedText = this.props.transformers[active](
          value,
          matchInfo.marker,
          {
            position: cursorInfo.position,
            text: this._lastText || '',
          },
          !final
        )
        this._lastText = transformedText.text
        input.transformText(textInfo => transformedText, final)
      }
    }

    _itemRenderer = (index: number, value: string): React.ReactNode =>
      !this.state.active ? null : (
        <Kb.ClickableBox
          key={
            (this.props.keyExtractors &&
              this.props.keyExtractors[this.state.active] &&
              this.props.keyExtractors[this.state.active](value)) ||
            value
          }
          onClick={() => this._triggerTransform(value)}
          onMouseMove={() => this.setState(s => (s.selected === index ? null : {selected: index}))}
        >
          {this.props.renderers[this.state.active](
            value,
            Styles.isMobile ? false : index === this.state.selected
          )}
        </Kb.ClickableBox>
      )

    _getResults = () =>
      this.state.active ? this.props.dataSources[this.state.active](this.state.filter) : []

    _getSelected = () => (this.state.active ? this._getResults()[this.state.selected] : null)

    render() {
      let overlay = null
      if (this.state.active) {
        this._validateProps()
      }
      let suggestionsVisible = false
      const results = this._getResults()
      if (results.length) {
        suggestionsVisible = true
        const content = (
          <SuggestionList
            style={this.props.suggestionListStyle}
            items={results}
            keyExtractor={
              (this.props.keyExtractors &&
                !!this.state.active &&
                this.props.keyExtractors[this.state.active]) ||
              null
            }
            renderItem={this._itemRenderer}
            selectedIndex={this.state.selected}
          />
        )
        overlay = Styles.isMobile ? (
          <Kb.FloatingBox
            containerStyle={this.props.suggestionOverlayStyle}
            dest="keyboard-avoiding-root"
            onHidden={this._setInactive}
          >
            {content}
          </Kb.FloatingBox>
        ) : (
          <Kb.Overlay
            attachTo={this._getAttachmentRef}
            matchDimension={true}
            position="top center"
            positionFallbacks={['bottom center']}
            visible={true}
            propagateOutsideClicks={false}
            onHidden={this._setInactive}
            style={this.props.suggestionOverlayStyle}
          >
            {content}
          </Kb.Overlay>
        )
      }

      const {
        dataSources,
        forwardedRef,
        keyExtractors,
        renderers,
        suggestionListStyle,
        suggestionOverlayStyle,
        suggestorToMarker,
        transformers,
        ...wrappedOP
      } = this.props
      return (
        <>
          {overlay}
          <WrappedComponent
            {...wrappedOP}
            suggestionsVisible={suggestionsVisible}
            ref={this._setAttachmentRef}
            inputRef={this._inputRef}
            onBlur={this._onBlur}
            onFocus={this._onFocus}
            onChangeText={this._onChangeText}
            onKeyDown={this._onKeyDown}
            onSelectionChange={this._onSelectionChange}
          />
        </>
      )
    }
  }

  // @ts-ignore TODO fix these types
  return React.forwardRef((props, ref) => <SuggestorsComponent {...props} forwardedRef={ref} />)
}

export {standardTransformer}
export default AddSuggestors