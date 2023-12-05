
import Box from '@material-ui/core/Box'
import React from 'react';
import Logo from '../../assets/logo_zeta.png'


function SendHeader(props: any) {
  const { styles, bridges, selectedBridge, handleBridgeChange } = props

  return (
    <div className={styles.header}>
      <Box display="flex" alignItems="center" className={styles.sendSelect}>
        <img src={Logo} alt="Logo" />
      </Box>
    </div>
  )
}

export default SendHeader
