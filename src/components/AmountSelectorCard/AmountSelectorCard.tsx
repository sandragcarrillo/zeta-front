import React, { useMemo, FC, ChangeEvent, useCallback } from 'react'
import { BigNumber } from 'ethers'
import { formatUnits, parseEther } from 'ethers/lib/utils'
import Card from '@material-ui/core/Card'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Skeleton from '@material-ui/lab/Skeleton'
import { Token } from '@hop-protocol/sdk'
import clsx from 'clsx'
import { LargeTextField } from 'src/components/LargeTextField'
import { commafy } from 'src/utils'
import { useAmountSelectorCardStyles, useEstimateTxCost } from 'src/hooks'
import Network from 'src/models/Network'
import { Flex } from 'src/components/ui'

type AmountSelectorProps = {
  value?: string
  label?: string
  loadingLabel?: boolean
  onChange?: (value: string) => void
  title?: string
  titleIconUrl?: string
  token?: Token
  balance?: BigNumber
  balanceLabel?: string
  loadingBalance?: boolean
  secondaryToken?: Token
  secondaryBalance?: BigNumber
  secondaryBalanceLabel?: string
  loadingSecondaryBalance?: boolean
  loadingValue?: boolean
  disableInput?: boolean
  hideSymbol?: boolean
  hideMaxButton?: boolean
  className?: string
  decimalPlaces?: number
  methodName?: string
  destNetwork?: Network
  selectedNetwork?: Network
  maxButtonLeaveSmallAmount?: boolean
}

export const AmountSelectorCard: FC<AmountSelectorProps> = props => {
  const {
    value = '',
    label,
    loadingLabel = false,
    onChange,
    title,
    titleIconUrl,
    token,
    balance,
    balanceLabel,
    loadingBalance = false,
    secondaryToken,
    secondaryBalance,
    secondaryBalanceLabel,
    loadingSecondaryBalance = false,
    loadingValue = false,
    disableInput = false,
    hideSymbol = false,
    hideMaxButton = false,
    decimalPlaces = 4,
    className,
    methodName,
    destNetwork,
    selectedNetwork,
    maxButtonLeaveSmallAmount = false
  } = props
  const styles = useAmountSelectorCardStyles()
  const { estimateMaxValue } = useEstimateTxCost(selectedNetwork)

  const balanceDisplay = useMemo(() => {
    let label: string = ''
    if (token && balance) {
      label = formatUnits(balance, token?.decimals)
      label = commafy(label, decimalPlaces)
    }
    return label
  }, [token, balance])

  const secondaryBalanceDisplay = useMemo(() => {
    let label: string = ''
    if (secondaryToken && secondaryBalance) {
      label = formatUnits(secondaryBalance, secondaryToken?.decimals)
      label = commafy(label, decimalPlaces)
    }
    return label
  }, [secondaryToken, secondaryBalance])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    if (onChange) {
      onChange(value)
    }
  }

  async function getEstimatedMaxValue(methodName: string, options: any) {
    const { balance, token: selectedToken } = options

    if (!selectedToken?.isNativeToken) {
      return ''
    }

    const nativeTokenMaxGasCost = await estimateMaxValue(methodName, options)

    if (nativeTokenMaxGasCost) {
      let totalAmount = balance.sub(nativeTokenMaxGasCost)
      if (totalAmount.lt(0)) {
        totalAmount = BigNumber.from(0)
      }
      if (maxButtonLeaveSmallAmount) {
        const tokenSymbol = options?.token?.symbol
        const smallAmount = tokenSymbol === 'XDAI' || tokenSymbol === 'MATIC' ? parseEther('1') : parseEther('0.001')
        if (tokenSymbol === 'XDAI' || tokenSymbol === 'MATIC' || tokenSymbol === 'ETH') {
          if (totalAmount.gt(smallAmount)) {
            // leave a little bit of native token for gas
            totalAmount = totalAmount.sub(smallAmount)
          }
        }
      }
      return formatUnits(totalAmount, selectedToken.decimals)
    }

    return formatUnits(balance, selectedToken.decimals)
  }

  const handleMaxClick = useCallback(async () => {
    if (!(onChange && balance && token)) {
      return
    }

    let maxValue = formatUnits(balance, token.decimals)

    if (token?.isNativeToken && methodName) {
      const opts = {
        token,
        balance,
        network: selectedNetwork,
        destNetwork,
      }
      maxValue = await getEstimatedMaxValue(methodName, opts)
    }

    onChange(maxValue)
  }, [onChange, token, balance, methodName])

  const handleSecondaryMaxClick = useCallback(async () => {
    if (!(onChange && secondaryBalance && secondaryToken)) {
      return
    }

    let maxValue = formatUnits(secondaryBalance, secondaryToken.decimals)

    if (secondaryToken?.isNativeToken && methodName) {
      const opts = {
        token: secondaryToken,
        balance: secondaryBalance,
        network: selectedNetwork,
      }
      maxValue = await getEstimatedMaxValue(methodName, opts)
    }

    onChange(maxValue)
  }, [onChange, secondaryToken, secondaryBalance, methodName, selectedNetwork])

  return (
    <Card className={clsx(styles.root, className)}>
      <Flex justifyBetween alignCenter mb="1.8rem" fullWidth>
        {!!label && (
          <Typography variant="subtitle2" color="textSecondary">
            {loadingBalance ? <Skeleton variant="text" width="15.0rem"></Skeleton> : label}
          </Typography>
        )}
        {loadingSecondaryBalance ? (
          <Skeleton variant="text" width="15.0rem"></Skeleton>
        ) : secondaryBalance ? (
          <div className={styles.balance}>
            {!hideMaxButton && secondaryBalance.gt(0) && !disableInput ? (
              <button
                className={styles.maxButton}
                onClick={handleSecondaryMaxClick}
                title="Max amount you can send while still having enough to cover fees"
              >
                MAX
              </button>
            ) : null}
            <Typography variant="subtitle2" color="textSecondary" align="left">
              {secondaryBalanceLabel || 'Balance:'} {secondaryBalanceDisplay}
            </Typography>
          </div>
        ) : null}
        {loadingBalance ? (
          <Skeleton variant="text" width="15.0rem"></Skeleton>
        ) : balance ? (
          <div className={styles.balance}>
            {!hideMaxButton && balance.gt(0) && !disableInput ? (
              <button
                className={styles.maxButton}
                onClick={handleMaxClick}
                title="Max amount you can send while still having enough to cover fees"
              >
                MAX
              </button>
            ) : null}
            <Typography variant="subtitle2" color="textSecondary" align="right">
              {balanceLabel || 'Balance:'} {balanceDisplay}
            </Typography>
          </div>
        ) : null}
      </Flex>

      <Flex fullWidth justifyBetween alignCenter>
        <Flex width="50%">
          <Box className={styles.networkSelectionBox}>
            {titleIconUrl ? (
              <Box className={styles.networkIconContainer}>
                <img src={titleIconUrl} className={styles.networkIcon} alt={title} />
              </Box>
            ) : null}
            <Typography variant="subtitle2" className={styles.networkLabel}>
              {title}
            </Typography>
          </Box>
        </Flex>

        <Flex>
          <LargeTextField
            value={value}
            onChange={handleInputChange}
            placeholder="0.0"
            units={hideSymbol ? '' : token?.symbol}
            disabled={disableInput}
            loadingValue={loadingValue}
          />
        </Flex>
      </Flex>
    </Card>
  )
}
