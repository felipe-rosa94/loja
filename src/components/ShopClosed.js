import React from 'react'
import '../styles/shopClosed.css'
import {FormLabel} from '@material-ui/core'
import {HighlightOffRounded} from '@material-ui/icons'

class ShopClosed extends React.Component {
    render() {
        return (
            <div id="div-shop-closed">
                <HighlightOffRounded id="icone-fechada"/>
                <FormLabel id="label-fechada">Loja fechada</FormLabel>
            </div>
        )
    }
}

export default ShopClosed