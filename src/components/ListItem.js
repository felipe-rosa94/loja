import React from 'react'
import {withRouter} from 'react-router-dom'
import '../styles/listitem.css'
import {Card, CardMedia, FormLabel} from '@material-ui/core'
import fundo from '../imagens/fundo.jpg'
import {padronizacao} from '../util'
import {cores} from '../configuracoes.json'

class ListItem extends React.Component {

    onClickProduto = objeto => this.props.history.push({pathname: '/sacola', state: {dados: objeto}})

    render() {
        const {lista} = this.props
        return (
            <div id="div-list-item" style={{backgroundColor: cores.corpo}}>
                {
                    lista.map((l, index) => (
                        (() => {
                            if (!l.produto) {
                                return (
                                    <div id="div-layout-categoria" style={{backgroundColor: cores.corpo}} key={index}>
                                        <div id={padronizacao(l.categoria)}/>
                                        {
                                            l.imagem &&
                                            <Card id="card-imagem-categoria">
                                                <CardMedia image={l.imagem} id="card-media-categoria"/>
                                            </Card>
                                        }
                                        <div id="div-titulo-categoria">
                                            <FormLabel id="label-titulo-categoria"
                                                       style={{color: cores.fonteCorpo}}>{l.categoria}</FormLabel>
                                        </div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div id="div-layout-produto" key={index}>
                                        <Card id="card-produto" style={{backgroundColor: cores.cartaoProduto}}
                                              onClick={() => this.onClickProduto(l)}>
                                            <div id="div-descritivo-imagem">
                                                <CardMedia id="card-media-produto" image={l.imagem ? l.imagem : fundo}/>
                                            </div>
                                            <div id="div-descritivo">
                                                <div id="div-label-produto">
                                                    <FormLabel
                                                        id="label-titulo-produto-list-item"
                                                        style={{color: cores.nomeProduto}}>{l.produto}</FormLabel>
                                                    <FormLabel
                                                        id="label-descricao"
                                                        style={{color: cores.descricaoProduto}}>{l.descricao ? l.descricao : l.produto}</FormLabel>
                                                </div>
                                                <div id="div-label-preco">
                                                    {
                                                        (l.preco !== 0) &&
                                                        <FormLabel id="label-preco" style={{color: cores.precoProduto}}>
                                                            {l.preco.toLocaleString('pt-BR', {
                                                                style: 'currency',
                                                                currency: 'BRL'
                                                            })}
                                                        </FormLabel>
                                                    }
                                                    {
                                                        (l.preco === 0 && l.precos.length !== 0) &&
                                                        l.precos.map((i, index) => (
                                                            <FormLabel id="label-precos"
                                                                       style={{color: cores.precoProduto}} key={index}>
                                                                {i}
                                                            </FormLabel>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            }
                        })()
                    ))
                }
            </div>
        )
    }
}

export default withRouter(ListItem)