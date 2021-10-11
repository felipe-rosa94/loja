import React from 'react'
import '../styles/bag.css'
import Header from '../components/Header'
import {CardMedia, FormLabel, TextField, Snackbar} from '@material-ui/core'
import {Remove, Add} from '@material-ui/icons'
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles'
import fundo from '../imagens/fundo.jpg'
import {escondeDados, mostraDados, rolagem} from '../util'
import Optional from '../components/Optional'
import Additional from '../components/Additional'
import Observation from '../components/Observation'

import {cores} from '../configuracoes.json'

const {REACT_APP_TABELA} = process.env

const tema = createMuiTheme({
    palette: {
        primary: {
            main: cores.botao
        }
    },
})

class Bag extends React.Component {

    state = {
        codigo: '',
        produto: '',
        descricao: '',
        preco: 0,
        imagem: '',
        quantidade: 1,
        observacao: '',
        etapasProduto: [],
        listaDivs: [],
        subitens: [],
        qtd: 1,
        totalSubItens: 0,
        snackbar: {
            show: false,
            mensagem: ''
        },
        permitirObservacoes: true
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value})

    handleClick = (objeto, acao) => {
        if (acao === 'observacao') {
            this.observacao(objeto)
        } else if (acao === 'adicional') {
            this.adicional(objeto)
        } else if (acao === 'opional') {
            this.opional(objeto)
        }
    }

    cancelaSnackbar = () => this.setState({snackbar: {show: false, mensagem: ''}})

    observacao = objeto => {
        const {subitens} = this.state
        let index = subitens.indexOf(objeto)
        if (index === -1) {
            subitens.push(objeto)
        } else {
            subitens.splice(index, 1)
        }
        this.setState({subitens: subitens})
        this.calculaTotal(subitens)
    }

    adicional = objeto => {
        const {subitens} = this.state
        let index = subitens.indexOf(objeto)
        if (index === -1) {
            subitens.push(objeto)
        } else {
            if (objeto.quantidade === 0) {
                subitens.splice(index, 1)
            } else {
                subitens[index] = objeto
            }
        }
        this.setState({subitens: subitens})
        this.calculaTotal(subitens)
    }

    opional = objeto => {
        const {subitens} = this.state
        let index = -1
        subitens.forEach((i, p) => {
            if (i.id === objeto.id) index = p
        })
        if (index !== -1) {
            subitens[index] = objeto
        } else {
            subitens.push(objeto)
        }
        this.setState({subitens: subitens})
        this.calculaTotal(subitens)
        this.positionStep(objeto.id)
    }

    calculaTotal = subitens => {
        let totalSubItens = 0
        subitens.forEach(s => {
            totalSubItens += (s.valor * s.quantidade)
        })
        this.setState({totalSubItens: totalSubItens})
    }

    onClickAdicionar = () => this.adicionar()

    adicionar = () => {
        let itens = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:itens`)
        itens = (itens === null) ? [] : mostraDados(itens)
        const {codigo, produto, observacao, quantidade, preco, subitens, etapasProduto} = this.state
        let obrigatorios = 0
        etapasProduto.forEach(ep => {
            if (ep.tipo === '2') obrigatorios++
        })
        let obrigatoriosEscolhidos = 0
        subitens.forEach(si => {
            if (si.tipo === '2') obrigatoriosEscolhidos++
        })
        if (obrigatorios !== obrigatoriosEscolhidos) return this.setState({
            snackbar: {
                show: true,
                mensagem: 'Escolha os itens obrigatorios'
            }
        })
        let item = {
            codigo: codigo,
            produto: produto,
            quantidade: quantidade,
            observacao: observacao,
            valor: preco,
            subitens: subitens
        }
        itens.push(item)
        sessionStorage.setItem(`loja-${REACT_APP_TABELA}:itens`, escondeDados(itens))
        localStorage.removeItem(`loja-${REACT_APP_TABELA}:pedido`)
        this.props.history.goBack()
    }

    onClickQuantidade = adicionar => {
        const {quantidade} = this.state
        if (adicionar) {
            let qtd = (quantidade + 1)
            this.setState({quantidade: qtd})
        } else if (quantidade !== 1) {
            let qtd = (quantidade - 1)
            this.setState({quantidade: qtd})
        }
    }

    produto = () => {
        const {dados: {codigo, produto, descricao, preco, imagem, etapasProduto}} = this.props.location.state
        this.setState({
            codigo: codigo,
            produto: produto,
            descricao: descricao,
            preco: preco,
            imagem: imagem,
            etapasProduto: etapasProduto !== undefined ? etapasProduto : []
        })
        this.listaDivs(etapasProduto)
    }

    listaDivs = etapasProduto => {
        if (etapasProduto === undefined) return
        let listaDivs = []
        etapasProduto.forEach(i => {
            listaDivs.push(i.id)
        })
        this.setState({listaDivs: listaDivs})
    }

    positionStep = id => {
        setTimeout(() => {
            const {listaDivs} = this.state
            let index = listaDivs.indexOf(id)
            index = listaDivs[index + 1]
            rolagem(index, 500)
        }, 200)
    }

    configuracoes = () => {
        let configuracoes = localStorage.getItem(`loja-${REACT_APP_TABELA}:configuracoes`)
        if (configuracoes === null) return
        configuracoes = mostraDados(configuracoes)
        this.setState({permitirObservacoes: configuracoes.observacao})
    }

    componentDidMount() {
        window.scrollTo(0, 0)
        this.produto()
        this.configuracoes()
    }

    render() {
        const {
            produto,
            descricao,
            preco,
            imagem,
            quantidade,
            totalSubItens,
            etapasProduto,
            snackbar,
            permitirObservacoes
        } = this.state
        return (
            <MuiThemeProvider theme={tema}>
                <div id="bag" style={{backgroundColor: cores.corpo}}>
                    <div id="container-bag">
                        <Header titulo={produto} home={false}/>
                        <div id="div-produto-bag">
                            <CardMedia id="card-media-bag" image={imagem ? imagem : fundo}/>
                        </div>
                        <FormLabel id="label-titulo-produto-bag"
                                   style={{color: cores.nomeProduto}}>{produto}</FormLabel>
                        <FormLabel id="label-titulo-descricao-bag"
                                   style={{color: cores.descricaoProduto}}>{descricao}</FormLabel>
                        {
                            (preco !== 0) &&
                            <FormLabel id="label-titulo-preco-bag" style={{color: cores.precoProduto}}>
                                {parseFloat(preco).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                })}
                            </FormLabel>
                        }
                        <div>
                            {
                                etapasProduto.map((ep, index) => {
                                    if (ep.tipo === '0') {
                                        return (<Additional key={index} etapa={ep}
                                                            handleChange={this.handleClick.bind(this)}/>)
                                    } else if (ep.tipo === '1') {
                                        return (<Observation key={index} etapa={ep}
                                                             handleChange={this.handleClick.bind(this)}/>)
                                    } else {
                                        return (<Optional key={index} etapa={ep}
                                                          handleChange={this.handleClick.bind(this)}/>)
                                    }
                                })
                            }
                        </div>
                        {
                            permitirObservacoes &&
                            <div id="div-observacao">
                                <div style={{background: '#ffffff', borderRadius: 8}}>
                                    <TextField variant="outlined" fullWidth={true} label="Observação"
                                               placeholder="Observação"
                                               name="observacao" onChange={this.handleInput}/>
                                </div>
                            </div>
                        }
                        <div id="div-rodape" style={{backgroundColor: cores.corpo}}>
                            <div id="div-quantidade">
                                <Remove id="icone-quantidade" style={{color: cores.fonteCorpo}}
                                        onClick={() => this.onClickQuantidade(false)}/>
                                <div id="div-label-quantidade">
                                    <FormLabel id="label-quantidade"
                                               style={{color: cores.fonteCorpo}}>{quantidade}</FormLabel>
                                </div>
                                <Add id="icone-quantidade" style={{color: cores.fonteCorpo}}
                                     onClick={() => this.onClickQuantidade(true)}/>
                            </div>
                            <div id="div-acoes">
                                <div id="div-botao-adicionar" style={{backgroundColor: cores.botao}}
                                     onClick={this.onClickAdicionar}>
                                    <FormLabel id="label-titulo-adicionar"
                                               style={{color: cores.fonteBotao}}>Adicionar</FormLabel>
                                    {
                                        ((quantidade * (preco + totalSubItens)) !== 0) &&
                                        <FormLabel id="label-titulo-adicionar" style={{color: cores.fonteBotao}}>
                                            {
                                                ((quantidade * (preco + totalSubItens))).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })
                                            }
                                        </FormLabel>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Snackbar
                    anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                    open={snackbar.show}
                    autoHideDuration={1000}
                    onClose={this.cancelaSnackbar}
                    message={snackbar.mensagem}
                />
            </MuiThemeProvider>
        )
    }
}

export default Bag