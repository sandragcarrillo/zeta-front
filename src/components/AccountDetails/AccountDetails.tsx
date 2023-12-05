import React from 'react'
import { Theme, makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useApp } from 'src/contexts/AppContext'
import { Modal } from 'src/components/Modal'
import { useWeb3Context } from 'src/contexts/Web3Context'
import { ClipboardCopyButton } from 'src/components/Button/ClipboardCopyButton'
import { AccountTransferHistory } from './AccountTransferHistory'
import { Div } from 'src/components/ui'

const useStyles = makeStyles((theme: Theme) => ({
  box: {
    position: 'relative',
  },
  connectedWallet: {
    border: '1px solid #fff',
    padding: '2rem',
    marginBottom: '3rem',
    borderRadius: '1rem',
  },
  changeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    borderRadius: '1.5rem',
    boxShadow: 'none',
  },
  disconnectButton: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    fontSize: '1.2rem',
    marginBottom: 0,
    borderRadius: '1.5rem',
    boxShadow: 'none',
  },
  address: {
    fontSize: '2rem',
  },
  copyButton: {
    marginLeft: '0.5rem',
  },
}))

const ManageWallet = (props: any) => {
  const { onChange, onDisconnect } = props
  const styles = useStyles()
  const { address, walletName, walletIcon } = useWeb3Context()

  return (
    <div className={styles.connectedWallet}>
      <Box display="flex" alignItems="center">
        <Typography>
          Connected with&nbsp;
        </Typography>
        {!!walletIcon && (
          <Box width="28px" height="28px" display="flex">
            <img src={walletIcon} alt="" width="100%" />
          </Box>
        )}
        <Typography>
          {walletName}
        </Typography>
      </Box>
      <Button className={styles.changeButton} onClick={onChange}>
        Change
      </Button>
      <Button className={styles.disconnectButton} onClick={onDisconnect}>
        Disconnect
      </Button>
      <div className={styles.address}>
        <span>{address?.truncate()}</span>
        <div>
          <ClipboardCopyButton
            className={styles.copyButton}
            value={address?.toString()}
            label={'Copy address'}
          />
        </div>
      </div>
    </div>
  )
}

export const AccountDetails = () => {
  const styles = useStyles()
  const { accountDetails } = useApp()
  const { address, requestWallet, disconnectWallet } = useWeb3Context()

  if (!accountDetails?.open) {
    return null
  }

  const handleClose = () => {
    accountDetails.show(false)
  }

  const handleChangeClick = () => {
    handleClose()
    requestWallet()
  }

  const handleDisconnectClick = () => {
    handleClose()
    disconnectWallet()
  }

  return (
    <Modal onClose={handleClose}>
      <Box className={styles.box}>
        {!!address && (
          <ManageWallet onChange={handleChangeClick} onDisconnect={handleDisconnectClick} />
        )}
      </Box>
      <Div position="relative">
        <AccountTransferHistory address={address?.address} />
      </Div>
    </Modal>
  )
}
