import React from 'react'
import '../styles/order.css'
import {Card, CardContent, Divider, FormLabel} from '@material-ui/core'
import {simplificaIdPedido} from '../util'

class Order extends React.Component {

    dataFormatada = data => {
        let date = new Date(data)
        let dia = date.getDate().toString()
        dia = dia.length === 1 ? `0${dia}` : dia
        let mes = date.getMonth().toString()
        mes = mes.length === 1 ? `0${mes}` : mes
        let ano = date.getFullYear()
        let hora = date.getHours().toString()
        hora = hora.length === 1 ? `0${hora}` : hora
        let minuto = date.getMinutes().toString()
        minuto = minuto.length === 1 ? `0${minuto}` : minuto
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`
    }

    render() {
        const {
            cliente: {
                nome,
                telefone,
                endereco: {
                    retirar,
                    logradouro,
                    numero,
                    bairro,
                    localidade,
                    complemento
                }
            },
            pagamento: {
                pagamento,
                taxaEntrega,
                subtotal,
                total,
                troco
            },
            itens,
            data,
            id_pedido
        } = this.props.data
        return (
            <div>
                <Card id="card-pedido">
                    <CardContent id="card-content-pedido">
                        <div id="div-data-id">
                            <FormLabel id="data-pedido">{`Data: ${this.dataFormatada(data)}`}</FormLabel>
                            <FormLabel id="id-pedido">{`Pedido: ${simplificaIdPedido(id_pedido)}`}</FormLabel>
                        </div>
                        <FormLabel id="nome-pedido">{`Nome: ${nome}`}</FormLabel>
                        <FormLabel id="telefone-pedido">{`Telefone: ${telefone}`}</FormLabel>
                        <Divider id="divider"/>
                        {
                            (retirar !== undefined) ?
                                <FormLabel id="endereco-pedido">{`Endereço: ${retirar}`}</FormLabel>
                                :
                                <FormLabel
                                    id="endereco-pedido">{`Endereço: ${logradouro}, ${numero} - ${bairro}, ${localidade} ${complemento}`}</FormLabel>
                        }
                        <Divider id="divider"/>
                        {
                            itens.map((i, index) => (
                                <div key={index}>
                                    <FormLabel
                                        id="produto-pedido">{`${i.quantidade}x ${`${i.codigo} - ${i.produto}`}`}</FormLabel>
                                    <FormLabel id="observacao-pedido">{i.observacao}</FormLabel>
                                    {
                                        (i.subitens !== undefined) &&
                                        <div id="div-subitens">
                                            {
                                                i.subitens.map((si, index) => (
                                                    <div key={index}>
                                                        <FormLabel
                                                            id="nome-subitens">{`${si.quantidade}x ${si.adicional}`}</FormLabel>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    }
                                </div>
                            ))
                        }
                        <Divider id="divider"/>
                        <FormLabel id="pagamento-pedido">{`Tipo de pagamento: ${pagamento.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        })}`}</FormLabel>
                        {(taxaEntrega !== 0) &&
                        <FormLabel id="taxa-pedido">{`Taxa de entrega: ${taxaEntrega.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        })}`}</FormLabel>}
                        <FormLabel id="subtotal-pedido">{`SubTotal: ${subtotal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        })}`}</FormLabel>
                        {
                            (troco !== undefined) &&
                            <FormLabel id="troco-pedido">{`Troco: ${troco.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}`}</FormLabel>
                        }
                        <FormLabel id="total-pedido">{`Total: ${total.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        })}`}</FormLabel>
                    </CardContent>
                </Card>
            </div>
        )
    }
}

export default Order

