import React from 'react'
import '../styles/timeline.css'
import {FormLabel} from '@material-ui/core'
import {
    SendRounded,
    ThumbUpAltRounded,
    SentimentVerySatisfiedRounded,
    MotorcycleRounded,
    CancelRounded,
    LocationOnRounded
} from '@material-ui/icons'

import {simplificaIdPedido, mostraDados, converteNumeroWhatsApp} from '../util'
import {cores} from '../configuracoes.json'

const {REACT_APP_TABELA} = process.env

class Timeline extends React.Component {

    onClickWhatsApp = () => {
        let config = localStorage.getItem(`loja-${REACT_APP_TABELA}:configuracoes`)
        if (config === null) return
        config = mostraDados(config)
        window.location.href = `https://api.whatsapp.com/send?phone=55${converteNumeroWhatsApp(config.whatsApp)}&text=`
    }

    onClickMaps = () => {
        let config = localStorage.getItem(`loja-${REACT_APP_TABELA}:configuracoes`)
        if (config === null) return
        config = mostraDados(config)
        window.location.href = `http://www.google.com/maps/place/${config.endereco}`
    }

    render() {
        const {status, id_pedido, cliente: {endereco: {retirar}}} = this.props.status
        return (
            <div id="timeline" style={{backgroundColor: cores.cartaoProduto}}>
                <div id="div-info">
                    <FormLabel id="label-id_pedido"
                               style={{color: cores.nomeProduto}}>{`Nº pedido: ${simplificaIdPedido(id_pedido)}`}</FormLabel>
                    <FormLabel id="label-whatsapp" style={{color: cores.descricaoProduto}}
                               onClick={this.onClickWhatsApp}>{`Chamar no WhatsApp`}</FormLabel>
                </div>
                {
                    (retirar !== undefined) &&
                    <div id="div-local" onClick={this.onClickMaps}>
                        <LocationOnRounded style={{color: cores.descricaoProduto}}/>
                        <FormLabel id="label-local" style={{color: cores.descricaoProduto}}>Ver rota até local de
                            retirada</FormLabel>
                    </div>
                }
                <div>
                    <div>
                        {(() => {
                            if (status === 'ENVIADO') {
                                return (
                                    <div id="div-status-pedido">
                                        <SendRounded id="icone-status" style={{color: cores.descricaoProduto}}/>
                                        <FormLabel id="label-status" style={{color: cores.descricaoProduto}}>
                                            Pedido pendente
                                        </FormLabel>
                                    </div>
                                )
                            } else if (status === 'RECEBIDO') {
                                return (
                                    <div id="div-status-pedido">
                                        <ThumbUpAltRounded id="icone-status" style={{color: cores.descricaoProduto}}/>
                                        <FormLabel id="label-status" style={{color: cores.descricaoProduto}}>
                                            Pedido recebido
                                        </FormLabel>
                                    </div>
                                )
                            } else if (status === 'PRONTO') {
                                return (
                                    <div id="div-status-pedido">
                                        <SentimentVerySatisfiedRounded id="icone-status"
                                                                       style={{color: cores.descricaoProduto}}/>
                                        <FormLabel id="label-status" style={{color: cores.descricaoProduto}}>
                                            Pedido pronto
                                        </FormLabel>
                                    </div>
                                )
                            } else if (status === 'ENTREGANDO') {
                                return (
                                    <div id="div-status-pedido">
                                        <MotorcycleRounded id="icone-status" style={{color: cores.descricaoProduto}}/>
                                        <FormLabel id="label-status" style={{color: cores.descricaoProduto}}>
                                            Pedido saindo pra entrega
                                        </FormLabel>
                                    </div>
                                )
                            } else if (status === 'CANCELADO') {
                                return (
                                    <div id="div-status-pedido">
                                        <CancelRounded id="icone-status" style={{color: cores.descricaoProduto}}/>
                                        <FormLabel id="label-status" style={{color: cores.descricaoProduto}}>Pedido
                                            cancelado</FormLabel>
                                    </div>
                                )
                            }
                        })()}
                    </div>
                </div>
            </div>
        )
    }
}

export default Timeline