import React, { useState, ChangeEvent } from 'react'
import { usePool } from '../PoolsContext'
import Box from '@material-ui/core/Box'
import { useParams } from 'react-router'
import { Alert } from 'src/components/Alert'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Skeleton from '@material-ui/lab/Skeleton'
import { BigNumber } from 'ethers'
import {
  BNMin,
  getTokenImage
} from 'src/utils'
import { normalizeTokenSymbol } from 'src/utils/normalizeTokenSymbol'
import useCheckTokenDeprecated from 'src/hooks/useCheckTokenDeprecated'
import { stakingRewardTokens, stakingRewardsContracts, hopStakingRewardsContracts, reactAppNetwork } from 'src/config'
import { useStyles } from './useStyles'
import { TopPoolStats } from './TopPoolStats'
import { BottomPoolStats } from './BottomPoolStats'
import { PoolEmptyState } from './PoolEmptyState'
import { AccountPosition } from './AccountPosition'
import { WithdrawForm } from './WithdrawForm'
import { DepositForm } from './DepositForm'
import { StakeForm } from './StakeForm'

export function PoolDetails () {
  const styles = useStyles()
  const {
    addLiquidityAndStake,
    aprFormatted,
    calculateRemoveLiquidityPriceImpactFn,
    canonicalToken,
    canonicalTokenSymbol,
    chainImageUrl,
    chainName,
    chainSlug,
    depositAmountTotalDisplayFormatted,
    enoughBalance,
    error,
    feeFormatted,
    hasBalance,
    hasStakeContract,
    hasStaked,
    hopToken,
    hopTokenSymbol,
    isDepositing,
    isWithdrawing,
    loading,
    lpTokenTotalSupplyFormatted,
    overallToken0DepositedFormatted,
    overallToken1DepositedFormatted,
    overallUserPoolBalanceFormatted,
    overallUserPoolBalanceUsdFormatted,
    overallUserPoolTokenPercentageFormatted,
    poolName,
    poolReserves,
    priceImpactFormatted,
    reserve0Formatted,
    reserve1Formatted,
    selectedNetwork,
    setError,
    setToken0Amount,
    setToken1Amount,
    token0Amount,
    token0BalanceBn,
    token0BalanceFormatted,
    token0Deposited,
    token1Amount,
    token1BalanceBn,
    token1BalanceFormatted,
    token1Deposited,
    tokenDecimals,
    tokenImageUrl,
    tokenSymbol,
    totalAprFormatted,
    tvlFormatted,
    unstakeAndRemoveLiquidity,
    userPoolBalance,
    virtualPriceFormatted,
    volumeUsdFormatted,
    walletConnected,
    warning,
  } = usePool()
  const navigate = useNavigate()
  const { search } = useLocation()
  const { tab } = useParams<{ tab: string }>()
  const [selectedTab, setSelectedTab] = useState(tab || 'deposit')
  const [selectedStaking, setSelectedStaking] = useState<string>('0')
  const calculateRemoveLiquidityPriceImpact = calculateRemoveLiquidityPriceImpactFn(userPoolBalance)

  function goToTab(value: string) {
    navigate(`/pool/${value}${search}`)
    setSelectedTab(value)
  }

  function handleTabChange(event: ChangeEvent<{}>, newValue: string) {
    event.preventDefault()
    goToTab(newValue)
  }

  function handleStakingChange(event: ChangeEvent<{}>, newValue: string): void {
    event.preventDefault()
    setSelectedStaking(newValue)
  }

  const totalAmount = BigNumber.from(token0Deposited || 0).add(BigNumber.from(token1Deposited || 0))
  const token0Max = BNMin(poolReserves[0], totalAmount)
  const token1Max = BNMin(poolReserves[1], totalAmount)

  const stakingContractAddress = stakingRewardsContracts?.[reactAppNetwork]?.[chainSlug]?.[tokenSymbol]
  const hopStakingContractAddress = hopStakingRewardsContracts?.[reactAppNetwork]?.[chainSlug]?.[tokenSymbol]
  const stakingRewards :any[] = []
  if (hopStakingContractAddress) {
    const rewardTokenSymbol = 'HOP'
    stakingRewards.push({
      stakingContractAddress: hopStakingContractAddress,
      rewardTokenSymbol,
      rewardTokenImageUrl: getTokenImage(rewardTokenSymbol),
    })
  }
  if (stakingContractAddress) {
    const rewardTokenSymbol = stakingRewardTokens?.[reactAppNetwork]?.[chainSlug]?.[stakingContractAddress?.toLowerCase()] ?? ''
    stakingRewards.push({
      stakingContractAddress: stakingContractAddress,
      rewardTokenSymbol,
      rewardTokenImageUrl: getTokenImage(rewardTokenSymbol)
    })
  }

  const isTokenDeprecated = useCheckTokenDeprecated(normalizeTokenSymbol(tokenSymbol)) ?? false
  const stakingEnabled = stakingRewards.length > 0
  const selectedStakingContractAddress = stakingRewards[selectedStaking] ? stakingRewards[selectedStaking].stakingContractAddress : null

  const showStakeMessage = !loading && walletConnected && !hasStaked && hasStakeContract && hasBalance

  return (
    <Box maxWidth={"900px"} m={"0 auto"}>
      <Link to={'/pools'} className={styles.backLink}>
        <Box mb={4} display="flex" alignItems="center">
          <Box display="flex" alignItems="center">
              <IconButton title="Go back to pools overview">
                <Typography variant="body1" color="secondary" className={styles.backLinkIcon}>
                ‹
                </Typography>
              </IconButton>
          </Box>
          <Box display="flex">
            <Box mr={2}>
              <Box className={styles.imageContainer}>
                <img className={styles.chainImage} src={chainImageUrl} alt={chainName} title={chainName} />
                <img className={styles.tokenImage} src={tokenImageUrl} alt={tokenSymbol} title={tokenSymbol} />
              </Box>
            </Box>
            <Box display="flex" alignItems="center">
              <Typography variant="h4">
                {poolName}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Link>
      <TopPoolStats
        aprFormatted={aprFormatted}
        goToTab={goToTab}
        showStakeMessage={showStakeMessage}
        totalAprFormatted={totalAprFormatted}
        tvlFormatted={tvlFormatted}
        volume24hFormatted={volumeUsdFormatted}
      />
      <Box mb={4}>
        <Box p={4} className={styles.poolDetails}>
          <Box p={2} display="flex" className={styles.poolDetailsBoxes}>
            <Box width="50%" display="flex" flexDirection="column" className={styles.poolDetailsBox}>
              <Box p={2}>
                <Box mb={4}>
                  <Typography variant="h4">
                    My Liquidity
                  </Typography>
                </Box>
                {loading && (
                  <Box>
                    <Skeleton animation="wave" width={'100px'} title="loading" />
                    <Skeleton animation="wave" width={'200px'} title="loading" />
                  </Box>
                )}
                {!loading && (
                  <>
                  {hasBalance && (
                  <AccountPosition
                      chainSlug={chainSlug}
                      stakingContractAddress={selectedStakingContractAddress}
                      token0DepositedFormatted={overallToken0DepositedFormatted}
                      token0Symbol={canonicalTokenSymbol}
                      token1DepositedFormatted={overallToken1DepositedFormatted}
                      token1Symbol={hopTokenSymbol}
                      tokenSymbol={tokenSymbol}
                      userPoolBalanceFormatted={overallUserPoolBalanceFormatted}
                      userPoolBalanceUsdFormatted={overallUserPoolBalanceUsdFormatted}
                      userPoolTokenPercentageFormatted={overallUserPoolTokenPercentageFormatted}
                  />
                  )}
                  {!hasBalance && (
                  <PoolEmptyState />
                  )}
                  </>
                )}
              </Box>
            </Box>
            <Box width="50%" className={styles.poolDetailsBox}>
              <Tabs value={selectedTab} onChange={handleTabChange} className={styles.tabs} style={{ width: 'max-content' }} variant="scrollable">
                <Tab label="Deposit" value="deposit" className={styles.tab} />
                <Tab label="Withdraw" value="withdraw" className={styles.tab} />
                <Tab label="Stake" value="stake" className={styles.tab} />
              </Tabs>
              <Box p={2} display="flex" flexDirection="column">
                <Box mb={2} >
                  {selectedTab === 'deposit' && <DepositForm
                      addLiquidity={addLiquidityAndStake}
                      balance0Bn={token0BalanceBn}
                      balance0Formatted={token0BalanceFormatted}
                      balance1Bn={token1BalanceBn}
                      balance1Formatted={token1BalanceFormatted}
                      depositAmountTotalDisplayFormatted={depositAmountTotalDisplayFormatted}
                      enoughBalance={enoughBalance}
                      isDepositing={isDepositing}
                      isTokenDeprecated={isTokenDeprecated}
                      priceImpactFormatted={priceImpactFormatted}
                      selectedNetwork={selectedNetwork}
                      setToken0Amount={setToken0Amount}
                      setToken1Amount={setToken1Amount}
                      token0Amount={token0Amount}
                      token0ImageUrl={canonicalToken?.imageUrl!}
                      token0Symbol={canonicalTokenSymbol}
                      token1Amount={token1Amount}
                      token1ImageUrl={hopToken?.imageUrl!}
                      token1Symbol={hopTokenSymbol}
                      tokenDecimals={tokenDecimals}
                      walletConnected={walletConnected}
                  />}
                  {selectedTab === 'withdraw' && <WithdrawForm
                      calculatePriceImpact={calculateRemoveLiquidityPriceImpact}
                      depositAmountTotalDisplayFormatted={depositAmountTotalDisplayFormatted}
                      goToTab={goToTab}
                      hasBalance={hasBalance}
                      isWithdrawing={isWithdrawing}
                      removeLiquidity={unstakeAndRemoveLiquidity}
                      setToken0Amount={setToken0Amount}
                      setToken1Amount={setToken1Amount}
                      token0Amount={token0Amount}
                      token0AmountBn={token0Deposited}
                      token0ImageUrl={canonicalToken?.imageUrl!}
                      token0MaxBn={token0Max}
                      token0Symbol={canonicalTokenSymbol}
                      token1Amount={token1Amount}
                      token1AmountBn={token1Deposited}
                      token1ImageUrl={hopToken?.imageUrl}
                      token1MaxBn={token1Max}
                      token1Symbol={hopTokenSymbol}
                      tokenDecimals={canonicalToken?.decimals!}
                      totalAmount={totalAmount}
                      walletConnected={walletConnected}
                  />}
                  {selectedTab === 'stake' && <StakeForm
                      chainSlug={chainSlug}
                      handleStakingChange={handleStakingChange}
                      isTokenDeprecated={isTokenDeprecated}
                      selectedStaking={selectedStaking}
                      stakingContractAddress={selectedStakingContractAddress}
                      stakingEnabled={stakingEnabled}
                      stakingRewards={stakingRewards}
                      tokenSymbol={tokenSymbol}
                  />}
                </Box>
                <Box>
                  <Alert severity="warning">{warning}</Alert>
                  <Alert severity="error" onClose={() => setError('')} text={error} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <BottomPoolStats
        feeFormatted={feeFormatted}
        lpTokenTotalSupplyFormatted={lpTokenTotalSupplyFormatted}
        poolName={poolName}
        reserve0Formatted={reserve0Formatted}
        reserve1Formatted={reserve1Formatted}
        token0Symbol={canonicalTokenSymbol}
        token1Symbol={hopTokenSymbol}
        virtualPriceFormatted={virtualPriceFormatted}
      />
    </Box>
  )
}
