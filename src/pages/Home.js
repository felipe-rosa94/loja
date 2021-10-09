import React from 'react'
import '../styles/home.css'
import Header from '../components/Header'
import Categorys from '../components/Categorys'
import ListItem from '../components/ListItem'
import ButtonCart from '../components/ButtonCart'
import Timeline from '../components/Timeline'
import ShopClosed from '../components/ShopClosed'
import Banners from '../components/Banners'
import Menu from '../components/Menu'
import firebase from '../firebase'
import {escondeDados, mostraDados, padronizacao, rolagem, isEmptyObject} from '../util'
import {cores} from '../configuracoes.json'
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core'

const {REACT_APP_TABELA} = process.env

let arrayCategorias

class Home extends React.Component {

    state = {
        titulo: '',
        status: {},
        itens: [],
        categorias: [],
        banners: [],
        total: 0,
        quantidadeCarrinho: 0,
        dialogAviso: false,
        carrinho: false,
        statusLoja: true,
        tituloAviso: '',
        mensagemAviso: '',
        menu: false
    }

    handleMenu = () => {
        const {menu} = this.state
        this.setState({menu: !menu})
    }

    handleButtonCart = () => this.setState({
        dialogAviso: true,
        tituloAviso: 'Aviso',
        mensagemAviso: 'A loja está fechada'
    })

    handleCategorys = categoria => rolagem(categoria, 500)

    cancelaAviso = () => this.setState({dialogAviso: false})

    guia = div => {
        div = `${div}-guia`
        arrayCategorias.forEach(e => {
            let elem = e.tag.replace('menu', '') + 'guia'
            let style = document.querySelector(elem)
            style.style.color = (elem === div) ? cores.fonteCorpo : cores.fonteCategoria
        })
    }

    itens = async () => {
        try {
            let products = await firebase.database().ref('produtos').child(REACT_APP_TABELA).once('value')
            products = products.val()
            if (products !== null) products = Object.values(products)
            let categories = await firebase.database().ref('categorias').child(REACT_APP_TABELA).once('value')
            categories = categories.val()
            if (categories !== null) categories = Object.values(categories)
            localStorage.setItem(`loja-${REACT_APP_TABELA}:produtos`, escondeDados(products))
            localStorage.setItem(`loja-${REACT_APP_TABELA}:categorias`, escondeDados(categories))
            this.montaLista(products, categories)
        } catch (e) {
            console.error(e)
        }
    }

    montaLista = (produtos, categorias) => {
        if (!produtos || !categorias) return
        let itens = []
        let itensCategorias = []
        let indexItem = 0
        let indexCategoria = 0
        let removerItem
        categorias.sort((a, b) => {
            if (a.ordem > b.ordem) return 1
            if (a.ordem < b.ordem) return -1
            return 0
        })
        categorias.forEach(c => {
            removerItem = false
            if (c.ativo) {
                itens.push(c)
                itensCategorias.push(c)
            }
            produtos.forEach(p => {
                let precos = []
                if (c.categoria === p.categoria && c.ativo && p.ativo) {
                    try {
                        if (p.preco === 0 && p.etapasProduto.length !== 0) {
                            p.etapasProduto.forEach(ep => {
                                if (ep.exibirValores && ep.itens.length !== 0) {
                                    ep.itens.forEach(epi => {
                                        let ps = `${epi.adicional} ${epi.valor.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        })}`
                                        precos.push(ps)
                                    })
                                }
                            })
                        }
                    } catch (e) {
                        console.log(e.message)
                    }
                    p.precos = precos
                    indexItem++
                    removerItem = true
                    itens.push(p)
                }
            })
            if (!removerItem) {
                itens.splice(indexItem, 1)
                --indexItem
            }
            if (!removerItem && c.ativo) {
                itensCategorias.splice(indexCategoria, 1)
                --indexCategoria
            }
            if (c.ativo) indexCategoria++
            indexItem++
        })
        this.setState({itens: itens, categorias: itensCategorias})
    }

    configuracoes = () => {
        let config = localStorage.getItem(`loja-${REACT_APP_TABELA}:configuracoes`)
        if (config !== null) {
            config = mostraDados(config)
            const {banners} = config
            this.setState({banners: banners})
        }
        firebase
            .database()
            .ref('configuracoes')
            .child(REACT_APP_TABELA)
            .once('value')
            .then((data) => {
                let settings = data.val()
                if (settings !== null) {
                    const {tituloSite, banners, statusLoja} = settings
                    this.setState({titulo: tituloSite, banners: banners, statusLoja: statusLoja})
                    localStorage.setItem(`loja-${REACT_APP_TABELA}:tituloSite`, escondeDados(tituloSite))
                    localStorage.setItem(`loja-${REACT_APP_TABELA}:configuracoes`, escondeDados(settings))
                }
            })
            .catch((e) => {
                console.error(e)
            })
    }

    raios = () => {
        firebase
            .database()
            .ref('raios')
            .child(REACT_APP_TABELA)
            .once('value')
            .then((data) => {
                let ray = data.val()
                if (ray !== null) {
                    ray = Object.values(ray)
                    ray.sort((a, b) => {
                        if (a.distancia > b.distancia) return 1
                        if (a.distancia < b.distancia) return -1
                        return 0
                    })
                    localStorage.setItem(`loja-${REACT_APP_TABELA}:raios`, escondeDados(ray))
                }
            })
            .catch((e) => {

            })
    }

    informacoesGravadas = () => {
        let produtos = localStorage.getItem(`loja-${REACT_APP_TABELA}:produtos`)
        let categorias = localStorage.getItem(`loja-${REACT_APP_TABELA}:categorias`)
        let titulo = localStorage.getItem(`loja-${REACT_APP_TABELA}:tituloSite`)
        if (produtos == null || categorias === null || titulo == null) return
        produtos = mostraDados(produtos)
        categorias = mostraDados(categorias)
        titulo = mostraDados(titulo)
        this.montaLista(produtos, categorias)
        this.setState({titulo: titulo})
    }

    carrinho = () => {
        let itens = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:itens`)
        itens = (itens === null) ? [] : mostraDados(itens)
        let total = 0
        itens.forEach(i => {
            let valorSubItens = 0
            i.subitens.forEach(si => {
                valorSubItens += (si.valor * si.quantidade)
            })
            total += (i.quantidade * (i.valor + valorSubItens))
        })
        this.setState({carrinho: (itens.length !== 0), quantidadeCarrinho: itens.length, total: total})
    }

    listaCategorias = () => {
        try {
            arrayCategorias = []
            let categorias = localStorage.getItem(`loja-${REACT_APP_TABELA}:categorias`)
            if (categorias === null) return
            categorias = mostraDados(categorias)
            categorias.forEach(i => {
                let tag = padronizacao(i.categoria)
                tag = `#${tag}-menu`
                let elem = document.querySelector(tag)
                if (elem !== null) {
                    let coordenadas = elem.getBoundingClientRect()
                    arrayCategorias.push({tag: tag, position: coordenadas.width})
                }
            })
        } catch (e) {

        }
    }

    autoRolagemCategorias = () => {
        window.onscroll = () => {
            let categorias = localStorage.getItem(`loja-${REACT_APP_TABELA}:categorias`)
            if (categorias === null) return
            categorias = mostraDados(categorias)
            for (let i = 0; i < categorias.length; i++) {
                let id = `#${padronizacao(categorias[i].categoria)}`
                let elem = document.querySelector(id)
                let position = 0
                let scroll = document.getElementById('categorys')
                if (elem !== null) {
                    let bounding = elem.getBoundingClientRect()
                    if (bounding.top > -100 && bounding.top < 100) {
                        if (i === 0) {
                            scroll.scrollTo(0, 0)
                            this.guia(id)
                        } else if (i === 1) {
                            this.guia(id)
                            position = arrayCategorias[0].position
                            scroll.scrollTo((position - 40), 0)
                        } else {
                            let cont = i
                            for (let x = 0; x < ++cont; x++) {
                                this.guia(id)
                                if (`${id}-menu` !== arrayCategorias[x].tag) {
                                    position += arrayCategorias[x].position
                                } else {
                                    scroll.scrollTo((position - 40), 0)
                                    break
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    sucesso = () => {
        let suceso = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:sucesso`)
        if (suceso !== null) this.setState({
            dialogAviso: true,
            tituloAviso: 'Pedido',
            mensagemAviso: 'Pedido enviado com sucesso'
        })
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:sucesso`)
    }

    status = () => {
        let pedido = localStorage.getItem(`loja-${REACT_APP_TABELA}:pedido`)
        if (pedido === null) return
        pedido = mostraDados(pedido)
        this.expiracaoPedido(pedido.expiracao)
        firebase
            .database()
            .ref('pedidos')
            .child(REACT_APP_TABELA)
            .child(pedido.id_pedido)
            .on('value', data => {
                if (data.val() !== null) this.setState({status: data.val()})
            })
    }

    expiracaoPedido = expiracao => {
        let date = new Date()
        if (date.getTime() >= expiracao) localStorage.removeItem(`loja-${REACT_APP_TABELA}:pedido`)
    }

    autenticacao = () => {
        firebase
            .auth()
            .signInWithEmailAndPassword('pedidos@whiledev.com', 'UKY5ec5HeMzE')
            .then((r) => {
                console.log(r)
            })
            .catch((e) => {
                console.log(e)
            })
    }

    componentDidMount() {
        this.autenticacao()
        this.informacoesGravadas()
        this.configuracoes()
        this.raios()
        this.itens()
        this.carrinho()
        this.autoRolagemCategorias()
        this.sucesso()
        this.status()
    }

    componentDidUpdate() {
        this.listaCategorias()
    }

    render() {
        const {
            titulo,
            itens,
            categorias,
            carrinho,
            quantidadeCarrinho,
            total,
            dialogAviso,
            status,
            banners,
            statusLoja,
            tituloAviso,
            mensagemAviso,
            menu
        } = this.state
        return (
            <section id="home" style={{backgroundColor: cores.corpo}}>
                <div id="container-home">
                    <Header titulo={titulo} home={true} handleChange={this.handleMenu.bind(this)}/>
                    <Menu abre={menu} titulo={titulo} handleChange={this.handleMenu.bind(this)}/>
                    {(banners.length !== 0) && <Banners banners={banners}/>}
                    {(!statusLoja) && <ShopClosed/>}
                    <Categorys lista={categorias} handleChange={this.handleCategorys.bind(this)}/>
                    <ListItem lista={itens}/>
                    {
                        (carrinho && isEmptyObject(status)) &&
                        <ButtonCart quantidade={quantidadeCarrinho} statusLoja={statusLoja} total={total}
                                    handleChange={this.handleButtonCart.bind(this)}/>
                    }
                    {!carrinho && !isEmptyObject(status) && <Timeline status={status}/>}
                </div>
                <Dialog open={dialogAviso} onClose={this.cancelaAviso}>
                    <DialogTitle>{tituloAviso}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{mensagemAviso}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancelaAviso}>Ok</Button>
                    </DialogActions>
                </Dialog>
            </section>
        )
    }
}

export default Home