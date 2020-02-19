/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import { WrappedComponentProps, injectIntl, FormattedMessage } from 'react-intl'
import { PageBlock, Button, Tag, Input } from 'vtex.styleguide'
import PropTypes from 'prop-types'
import QuickOrderAutocomplete from './QuickOrderAutocomplete'
import styles from '../styles.css'
import { useCssHandles } from 'vtex.css-handles'
import { useApolloClient } from 'react-apollo'
import productQuery from '../queries/product.gql'

const AutocompleteBlock: StorefrontFunctionComponent<any &
  WrappedComponentProps> = ({ onAddToCart, loading, success, intl }) => {
  const client = useApolloClient()

  const [state, setState] = useState<any>({
    selectedItem: null,
    quantitySelected: 1,
  })

  const { selectedItem, quantitySelected } = state

  const onSelect = async (product: any) => {
    if (!!product && product.length) {
      const query = {
        query: productQuery,
        variables: { slug: product[0].slug },
      }
      const { data } = await client.query(query)
      const selectedSku =
        data.product.items.length === 1 ? data.product.items[0].itemId : null

      setState({
        ...state,
        selectedItem:
          !!product && product.length
            ? { ...product[0], value: selectedSku, data }
            : null,
      })
    }
  }

  const selectSku = (value: string) => {
    const newSelected = {
      ...selectedItem,
      value,
    }
    setState({
      ...state,
      selectedItem: newSelected,
    })
  }

  const callAddUnitToCart = () => {
    const items = [
      {
        id: selectedItem.value,
        quantity: quantitySelected,
        seller: '1',
      },
    ]
    onAddToCart(items).then(() => {
      if (!loading && success) {
        setState({
          ...state,
          selectedItem: null,
          quantitySelected: 1,
        })
      }
    })
  }

  const CSS_HANDLES = [
    'skuSelection',
    'productThumb',
    'productLabel',
    'inputQuantity',
    'buttonAdd',
  ] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <PageBlock
      variation="annotated"
      title={intl.formatMessage({ id: 'quickorder.autocomplete.label' })}
      subtitle={intl.formatMessage({ id: 'quickorder.autocomplete.helper' })}
    >
      <div className={'flex flex-column w-60'}>
        {!selectedItem && <QuickOrderAutocomplete onSelect={onSelect} />}
        {!!selectedItem && (
          <div>
            <div className={`flex flex-column w-10 fl ${handles.productThumb}`}>
              <img src={selectedItem.thumb} width="25" height="25" alt="" />
            </div>
            <div className={`flex flex-column w-60 fl ${handles.productLabel}`}>
              {selectedItem.label}
            </div>
            <div
              className={`flex flex-column w-10 fl ${handles.inputQuantity}`}
            >
              <Input
                value={quantitySelected}
                size={'3'}
                onChange={(e: any) => {
                  setState({
                    ...state,
                    quantitySelected: e.target.value,
                  })
                }}
              />
            </div>
            <div className={`flex flex-column w-20 fl ${handles.buttonAdd}`}>
              <Button
                variation="primary"
                size="small"
                isLoading={loading}
                onClick={() => {
                  callAddUnitToCart()
                }}
              >
                <FormattedMessage id="quickorder.autocomplete.addButton" />
              </Button>
            </div>
            {!!selectedItem && selectedItem.data.product.items.length > 1 && (
              <div>
                {selectedItem.data.product.items.map((item: any) => {
                  return (
                    <span
                      key={item.itemId}
                      className={`mr4 ${handles.skuSelection} ${styles.tag}`}
                    >
                      <Tag
                        size="small"
                        bgColor={
                          item.itemId === selectedItem.value
                            ? '#8bc34a'
                            : '#979899'
                        }
                        onClick={() => {
                          selectSku(item.itemId)
                        }}
                      >
                        {item.name}
                      </Tag>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={'flex flex-column w-40'}></div>
    </PageBlock>
  )
}
AutocompleteBlock.propTypes = {
  onAddToCart: PropTypes.func,
  loading: PropTypes.bool,
  success: PropTypes.bool,
}

export default injectIntl(AutocompleteBlock)
