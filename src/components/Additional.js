import React from 'react'
import '../styles/additional.css'
import {Card, CardContent, Divider, FormLabel} from '@material-ui/core'
import {Add, Remove} from '@material-ui/icons'
import {cores} from '../configuracoes.json'

class Additional extends React.Component {

    state = {
        tituloAdicional: '',
        itens: []
    }

    onClick = (objeto, index, adicionar, _id, tipo) => {
        if (adicionar) {
            this.adicionar(objeto, index, _id, tipo)
        } else {
            this.remover(objeto, index, _id, tipo)
        }
    }

    adicionar = (objeto, index, _id, tipo) => {
        const {itens} = this.state
        if (objeto.quantidade !== undefined) {
            objeto.quantidade = (objeto.quantidade + 1)
        } else {
            objeto.quantidade = 1
        }
        objeto._id = _id
        objeto.tipo = tipo
        itens[index] = objeto
        this.setState({itens: itens})
        this.props.handleChange(objeto, 'adicional')
    }

    remover = (objeto, index, _id, tipo) => {
        const {itens} = this.state
        if (objeto.quantidade !== undefined && objeto.quantidade !== 0) {
            objeto.quantidade = (objeto.quantidade - 1)
        } else {
            objeto.quantidade = 0
        }
        objeto._id = _id
        objeto.tipo = tipo
        itens[index] = objeto
        this.setState({itens: itens})
        this.props.handleChange(objeto, 'adicional')
    }

    adicionais = () => {
        const {tituloAdicional, itens, _id, tipo} = this.props.etapa
        this.setState({tituloAdicional: tituloAdicional, itens: itens, _id: _id, tipo: tipo})
    }

    componentDidMount() {
        this.adicionais()
    }

    render() {
        const {tituloAdicional, itens, _id, tipo} = this.state
        return (
            <div>
                <div id={_id}/>
                <Card id="card-additional" style={{backgroundColor: cores.cartaoProduto}}>
                    <CardContent id="card-content-additional">
                        <FormLabel id="label-titulo-additional" style={{color: cores.descricaoProduto}}>
                            {tituloAdicional}
                        </FormLabel>
                    </CardContent>
                    <Divider/>
                    <CardContent id="card-content-additional">
                        <div id="div-itens-additional">
                            {
                                itens.map((i, index) => (
                                    <div id="div-labels-additional" key={index}>
                                        <div id="div-descritivos-additional">
                                            <FormLabel id="label-nome-additional"
                                                       style={{color: cores.descricaoProduto}}>{i.adicional}</FormLabel>
                                            {
                                                (i.valor !== 0) &&
                                                <FormLabel id="label-preco-additional"
                                                           style={{color: cores.precoProduto}}>
                                                    {i.valor.toLocaleString('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    })}
                                                </FormLabel>
                                            }
                                        </div>
                                        <div id="div-botoes-additional">
                                            <Remove id="icone-additional" style={{color: cores.descricaoProduto}}
                                                    onClick={() => this.onClick(i, index, false, _id, tipo)}/>
                                            <div id="div-quantidade-additional">
                                                <FormLabel
                                                    id="label-quantidade-additional"
                                                    style={{color: cores.descricaoProduto}}>{(i.quantidade !== undefined) ? i.quantidade : 0}</FormLabel>
                                            </div>
                                            <Add id="icone-additional" style={{color: cores.descricaoProduto}}
                                                 onClick={() => this.onClick(i, index, true, _id, tipo)}/>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }
}

export default Additional