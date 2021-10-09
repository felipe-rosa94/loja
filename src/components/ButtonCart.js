import React from 'react'
import {withRouter} from 'react-router-dom'
import '../styles/buttonCart.css'
import {cores} from '../configuracoes.json'
import {FormLabel} from '@material-ui/core'

class ButtonCart extends React.Component {

    onClickCarrinho = () => {
        if (this.props.statusLoja) {
            this.props.history.push('/carrinho')
        } else {
            this.props.handleChange()
        }
    }

    render() {
        const {quantidade, total} = this.props
        return (
            <div id="botao-carrinho" style={{backgroundColor: cores.botao}} onClick={this.onClickCarrinho}>
                <div id="div-quantidade-carrinho" style={{backgroundColor: cores.corpo}}>
                    <FormLabel id="label-carrinho" style={{color: cores.fonteCorpo}}>{quantidade}</FormLabel>
                </div>
                <FormLabel id="label-carrinho" style={{color: cores.fonteBotao}}>Carrinho</FormLabel>
                <FormLabel id="label-carrinho" style={{color: cores.fonteBotao}}>
                    {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </FormLabel>
            < /div>
        )
    }
}

export default withRouter(ButtonCart)