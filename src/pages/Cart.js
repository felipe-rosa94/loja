import React from 'react'
import '../styles/cart.css'
import {
    Box,
    Card,
    CardContent,
    Divider,
    Dialog,
    DialogContent,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup, DialogTitle, DialogContentText, DialogActions, Button, TextField, Snackbar, CircularProgress
} from '@material-ui/core'
import {DeleteRounded, Edit} from '@material-ui/icons'
import {cores} from '../configuracoes.json'
import {
    mostraDados,
    requisicao,
    isEmptyObject,
    escondeDados,
    mascaraTelefone,
    idPedido,
    expiracao,
    rolagem
} from '../util'
import Header from '../components/Header'
import {MuiThemeProvider, createMuiTheme, withStyles} from '@material-ui/core/styles'

import {getDistance} from 'geolib'
import firebase from "firebase";

const {REACT_APP_KEY, REACT_APP_TABELA, REACT_APP_URL_PEDIDO} = process.env

const RadioButton = withStyles({
    checked: {},
})(props => <Radio color="default" {...props} />)

const tema = createMuiTheme({
    palette: {
        primary: {
            main: cores.botao
        }
    },
})

class Cart extends React.Component {

    state = {
        itens: [],
        pagamento: '',
        dialogTroco: false,
        dialogAviso: false,
        dialogCliente: false,
        dialogEntrega: false,
        dialogEndereco: false,
        dialogCarregando: false,
        dialogEsvaziar: false,
        precisaTroco: false,
        retirada: false,
        entrega: false,
        mensagemCarregando: '',
        mensagemAviso: '',
        snackbar: {
            show: false,
            mensagem: ''
        },
        troco: 0,
        subtotal: 0,
        taxaEntrega: 0,
        nome: '',
        telefone: '',
        cep: '',
        numero: '',
        complemento: '',
        endereco: {},
        enderecos: [],
        lat: 0,
        lng: 0,
        botaoAvancar: 'Enviar Pedido'
    }

    handleInput = e => {
        let name = e.target.name
        let value = e.target.value
        if (name === 'troco') {
            this.setState({troco: parseFloat(value)})
        } else if (name === 'cep') {
            let cep = value.replace(/[^\d]+/g, '')
            if (cep.length >= 8) this.validarCEP(cep)
            this.setState({cep: cep})
        } else if (name === 'telefone') {
            this.setState({[name]: mascaraTelefone(value)})
        } else {
            this.setState({[name]: value})
        }
    }

    URL_BASE = address => {
        return `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${REACT_APP_KEY}`
    }

    onRadioTipoPagamento = e => {
        let value = e.target.value
        this.setState({pagamento: value, dialogTroco: (value === 'dinheiro')})
        if (value !== 'dinheiro') {
            this.setState({troco: 0, precisaTroco: false})
            sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:troco`)
        }
        sessionStorage.setItem(`loja-${REACT_APP_TABELA}:pagamento`, escondeDados(value))
        this.avancoBotao()
    }

    onRadioEntrega = endereco => {
        if (endereco === 'Retirar no local') {
            sessionStorage.setItem(`loja-${REACT_APP_TABELA}:endereco`, escondeDados({retirar: 'Retirar no local'}))
            this.setState({taxaEntrega: 0, endereco: {retirar: 'Retirar no local'}, dialogEntrega: false})
        } else {
            sessionStorage.setItem(`loja-${REACT_APP_TABELA}:endereco`, escondeDados(endereco))
            const {taxa} = this.verificaAreaDeAtendimento(endereco.distancia)
            this.setState({taxaEntrega: taxa, endereco: endereco, dialogEntrega: false})
        }
        this.avancoBotao()
    }

    onClickAlteraTroco = () => this.setState({dialogTroco: true})

    onClickTrocoSim = () => this.setState({precisaTroco: true})

    onClickTrocoNao = () => {
        this.setState({dialogTroco: false, troco: 0, precisaTroco: false})
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:troco`)
    }

    onClickCadastroEndereco = () => this.setState({dialogEndereco: true, dialogEntrega: false})

    onClickSelecionaEntrega = () => this.setState({dialogEntrega: true})

    onClickTrocoConfirma = () => {
        const {subtotal, taxaEntrega, troco} = this.state
        if (troco < (subtotal + taxaEntrega)) {
            this.setState({
                troco: 0,
                snackbar: {show: true, mensagem: 'Troco não pode ser menor que o total da compra'}
            })
            sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:troco`)
            return
        }
        sessionStorage.setItem(`loja-${REACT_APP_TABELA}:troco`, escondeDados(troco))
        this.setState({dialogTroco: false, precisaTroco: false})
    }

    onClickEnviarPedido = () => {
        const {subtotal, taxaEntrega, itens, troco, pagamento} = this.state
        let cliente = localStorage.getItem(`loja-${REACT_APP_TABELA}:cliente`)
        if (cliente == null) return this.setState({dialogCliente: true})
        cliente = mostraDados(cliente)
        let endereco = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:endereco`)
        if (endereco == null) return this.setState({dialogEntrega: true})
        endereco = mostraDados(endereco)
        if (pagamento === '') {
            rolagem('card-forma-pagamento', 200)
            return this.setState({snackbar: {show: true, mensagem: 'Escolha uma forma de pagamento'}})
        }
        let pedido = {
            cliente: {
                nome: cliente.nome,
                telefone: cliente.telefone,
                endereco: endereco
            },
            pagamento: {
                pagamento: pagamento,
                taxaEntrega: taxaEntrega,
                subtotal: subtotal,
                total: (subtotal + taxaEntrega)
            },
            id_pedido: idPedido(),
            itens: itens,
            status: 'ENVIADO',
            loja: REACT_APP_TABELA
        }
        if (troco !== 0) pedido.pagamento.troco = (troco - (subtotal + taxaEntrega))
        this.setState({dialogCarregando: true, mensagemCarregando: 'Enviando pedido'})
        firebase
            .database()
            .ref(`pedidos/${REACT_APP_TABELA}/${pedido.id_pedido}`)
            .set(pedido)
            .then((data) => {
                this.sucesso(pedido)
            })
            .catch((e) => {
                this.setState({dialogCarregando: false, dialogAviso: true, mensagemAviso: e})
            })
    }

    sucesso = pedido => {
        this.setState({dialogCarregando: false})
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:itens`)
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:troco`)
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:pagamento`)
        sessionStorage.setItem(`loja-${REACT_APP_TABELA}:sucesso`, 'ok')
        localStorage.setItem(`loja-${REACT_APP_TABELA}:pedido`, escondeDados({
            id_pedido: pedido.id_pedido,
            expiracao: expiracao()
        }))
        let date = new Date()
        pedido.data = date.getTime()
        let historico = localStorage.getItem(`loja-${REACT_APP_TABELA}:historico`)
        historico = (historico !== null) ? mostraDados(historico) : []
        historico.push(pedido)
        localStorage.setItem(`loja-${REACT_APP_TABELA}:historico`, escondeDados(historico))
        this.props.history.replace('/')
    }

    onClickConfirmaCliente = () => {
        const {nome, telefone} = this.state
        if (nome === '' && nome.length < 3) return this.setState({snackbar: {show: true, mensagem: 'Coloque um nome'}})
        if (telefone === '' && telefone.length < 13) return this.setState({
            snackbar: {
                show: true,
                mensagem: 'Coloque um Telefone'
            }
        })
        let cliente = {nome: nome, telefone: telefone}
        localStorage.setItem(`loja-${REACT_APP_TABELA}:cliente`, escondeDados(cliente))
        this.setState({dialogCliente: false})
        this.avancoBotao()
    }

    onClickEsvaziarCarrinho = () => this.setState({dialogEsvaziar: true})

    onClickEsvaziar = () => {
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:itens`)
        sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:troco`)
        this.setState({troco: 0})
        this.cancelaEsvaziar()
        this.listaItens()
    }

    cancelaEntrega = () => this.setState({dialogEntrega: false})

    cancelaEndereco = () => this.setState({dialogEndereco: false})

    cancelaCliente = () => this.setState({nome: '', telefone: '', dialogCliente: false})

    cancelaEsvaziar = () => this.setState({dialogEsvaziar: false})

    onClickConfirmaEndereco = async () => {
        let {cep, numero, complemento, endereco, lat, lng} = this.state
        if (cep === '') return this.setState({snackbar: {show: true, mensagem: 'Coloque um CEP válido'}})
        if (numero === '') return this.setState({snackbar: {show: true, mensagem: 'Coloque um número válido'}})
        let address = `${endereco.logradouro}, ${numero} - ${endereco.bairro} ${endereco.localidade} - ${endereco.uf}`
        this.setState({dialogCarregando: true, mensagemCarregando: 'Verificando area de atendiemnto'})
        let response = await requisicao(this.URL_BASE(address), {method: 'get'})
        response = response.results[0].geometry.location
        this.setState({dialogCarregando: false})
        let a = {latitude: lat, longitude: lng}
        let b = {latitude: response.lat, longitude: response.lng}
        let distancia = getDistance(a, b)
        const {atende, taxa} = this.verificaAreaDeAtendimento(distancia)
        if (!atende) {
            this.setState({
                dialogEndereco: false,
                dialogAviso: true,
                mensagemAviso: 'Infelizmente ainda não atendemos sua região',
                endereco: {}
            })
            sessionStorage.removeItem(`loja-${REACT_APP_TABELA}:endereco`)
            this.avancoBotao()
            return

        }
        let enderecos = localStorage.getItem(`loja-${REACT_APP_TABELA}:enderecos`)
        enderecos = (enderecos !== null) ? mostraDados(enderecos) : []
        endereco.numero = numero
        endereco.complemento = complemento
        endereco.latitude = response.lat
        endereco.longitude = response.lng
        endereco.distancia = distancia
        enderecos.push(endereco)
        this.setState({taxaEntrega: taxa, dialogEndereco: false, endereco: endereco, enderecos: enderecos})
        localStorage.setItem(`loja-${REACT_APP_TABELA}:enderecos`, escondeDados(enderecos))
        sessionStorage.setItem(`loja-${REACT_APP_TABELA}:endereco`, escondeDados(endereco))
        this.avancoBotao()
    }

    verificaAreaDeAtendimento = distancia => {
        let raios = localStorage.getItem(`loja-${REACT_APP_TABELA}:raios`)
        raios = (raios !== null) ? mostraDados(raios) : []
        for (let i = 0; i < raios.length; i++) {
            if (distancia <= raios[i].distancia) return {atende: true, taxa: raios[i].taxa}
        }
        return {atende: false}
    }

    cancelaSnackbar = () => this.setState({snackbar: {show: false}})

    cancelaAviso = () => this.setState({dialogAviso: false})

    validarCEP = async cep => {
        this.setState({dialogCarregando: true, mensagemCarregando: 'Validando CEP'})
        let url = `https://viacep.com.br/ws/${cep}/json/`
        let endereco = await requisicao(url, {method: 'get'})
        this.setState({
            cep: (endereco.erro === undefined) ? cep : '',
            endereco: (endereco.erro === undefined) ? endereco : {},
            dialogCarregando: false
        })
    }

    listaItens = () => {
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
        this.setState({itens: itens, subtotal: total})
    }

    calculaValorItem = (valor, quantidade, subItens) => {
        let totalSubItens = 0
        subItens.forEach(si => {
            totalSubItens += (si.quantidade * si.valor)
        })
        return (quantidade * (valor + totalSubItens)).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
    }

    configuracoes = () => {
        let configuracoes = localStorage.getItem(`loja-${REACT_APP_TABELA}:configuracoes`)
        if (configuracoes === null) return
        configuracoes = mostraDados(configuracoes)
        const {cartao, dinheiro, online, latitude, longitude, retirada, entrega} = configuracoes
        this.setState({
            cartao: cartao,
            dinheiro: dinheiro,
            online: online,
            lat: latitude,
            lng: longitude,
            retirada: retirada,
            entrega: entrega
        })
    }

    cliente = () => {
        let cliente = localStorage.getItem(`loja-${REACT_APP_TABELA}:cliente`)
        if (cliente === null) return
        cliente = mostraDados(cliente)
        const {nome, telefone} = cliente
        this.setState({nome: nome, telefone: telefone})
    }

    endereco = () => {
        let endereco = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:endereco`)
        if (endereco === null) return
        endereco = mostraDados(endereco)
        this.setState({endereco: endereco})
        this.verificaTaxaDeEntrega(endereco)
    }

    verificaTaxaDeEntrega = endereco => {
        if (endereco.retirar !== undefined) {
            this.setState({taxaEntrega: 0})
        } else {
            const {taxa} = this.verificaAreaDeAtendimento(endereco.distancia)
            this.setState({taxaEntrega: taxa})
        }
    }

    enderecos = () => {
        let enderecos = localStorage.getItem(`loja-${REACT_APP_TABELA}:enderecos`)
        if (enderecos === null) return
        enderecos = mostraDados(enderecos)
        this.setState({enderecos: enderecos})
    }

    pagamento = () => {
        let pagamento = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:pagamento`)
        if (pagamento === null) return
        pagamento = mostraDados(pagamento)
        this.setState({pagamento: pagamento})
    }

    troco = () => {
        let troco = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:troco`)
        if (troco === null) return
        troco = mostraDados(troco)
        this.setState({troco: troco})
    }

    avancoBotao = () => {
        let cliente = localStorage.getItem(`loja-${REACT_APP_TABELA}:cliente`)
        if (cliente == null) return this.setState({botaoAvancar: 'Identificação'})
        let endereco = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:endereco`)
        if (endereco === null) return this.setState({botaoAvancar: 'Tipo de Entrega'})
        let pagamento = sessionStorage.getItem(`loja-${REACT_APP_TABELA}:pagamento`)
        if (pagamento === null) return this.setState({botaoAvancar: 'Tipo de Pagamento'})
        this.setState({botaoAvancar: 'Enviar Pedido'})
    }

    componentDidMount() {
        this.listaItens()
        this.configuracoes()
        this.cliente()
        this.endereco()
        this.enderecos()
        this.pagamento()
        this.troco()
        this.avancoBotao()
    }

    render() {
        const {
            itens,
            pagamento,
            dialogTroco,
            dialogAviso,
            dialogCarregando,
            dialogEndereco,
            dialogEntrega,
            dialogEsvaziar,
            dialogCliente,
            precisaTroco,
            cartao,
            dinheiro,
            online,
            retirada,
            entrega,
            subtotal,
            troco,
            taxaEntrega,
            snackbar,
            nome,
            telefone,
            enderecos,
            endereco,
            numero,
            mensagemCarregando,
            mensagemAviso,
            botaoAvancar
        } = this.state
        return (
            <MuiThemeProvider theme={tema}>
                <div id="cart" style={{backgroundColor: cores.corpo}}>
                    <div id="container-cart">
                        <Header titulo="Carrinho" home={false}/>
                        {
                            (!isEmptyObject(endereco)) &&
                            <Card id="card-endereco" onClick={this.onClickSelecionaEntrega}>
                                <CardContent id="card-content-endereco">
                                    {
                                        (endereco.retirar !== undefined)
                                            ?
                                            <div id="div-endereco">
                                                <div id="div-endereco-selecionado">
                                                    <FormLabel id="label-endereco"
                                                               style={{color: cores.descricaoProduto}}>
                                                        {nome}
                                                    </FormLabel>
                                                    <FormLabel id="label-endereco"
                                                               style={{color: cores.descricaoProduto}}>
                                                        {endereco.retirar}
                                                    </FormLabel>
                                                </div>
                                                <div id="div-endereco-alterar">
                                                    <Edit style={{color: cores.descricaoProduto}}/>
                                                    <FormLabel id="label-endereco-alterar"
                                                               style={{color: cores.descricaoProduto}}>Alterar</FormLabel>
                                                </div>
                                            </div>
                                            :
                                            <div id="div-endereco">
                                                <div id="div-endereco-selecionado">
                                                    <FormLabel id="label-endereco"
                                                               style={{color: cores.descricaoProduto}}>
                                                        {nome}
                                                    </FormLabel>
                                                    <FormLabel id="label-endereco"
                                                               style={{color: cores.descricaoProduto}}>
                                                        {`${endereco.logradouro}, ${endereco.numero !== undefined ? endereco.numero : ''} - ${endereco.bairro}`}
                                                    </FormLabel>
                                                    <FormLabel id="label-endereco"
                                                               style={{color: cores.descricaoProduto}}>
                                                        {`${endereco.localidade} - ${endereco.uf}`}
                                                    </FormLabel>
                                                </div>
                                                <div id="div-endereco-alterar">
                                                    <Edit style={{color: cores.descricaoProduto}}/>
                                                    <FormLabel id="label-endereco-alterar"
                                                               style={{color: cores.descricaoProduto}}>
                                                        Alterar
                                                    </FormLabel>
                                                </div>
                                            </div>
                                    }
                                </CardContent>
                            </Card>
                        }
                        <Card id="card-itens" style={{backgroundColor: cores.cartaoProduto}}>
                            <CardContent id="card-content-meu-pedido">
                                <FormLabel id="label-meu-pedido" style={{color: cores.descricaoProduto}}>Meu
                                    pedido</FormLabel>
                            </CardContent>
                            <Divider/>
                            <CardContent id="card-content-itens">
                                {
                                    itens.map((i, index) => (
                                        <div id="div-lista-itens" key={index}>
                                            {(index !== 0) && <Divider id="divider"/>}
                                            <div id="div-item">
                                                <FormLabel id="label-nome-produto"
                                                           style={{color: cores.nomeProduto}}>{`${i.quantidade}x ${i.produto}`}</FormLabel>
                                                <FormLabel id="label-preco-produto" style={{color: cores.nomeProduto}}>
                                                    {this.calculaValorItem(i.valor, i.quantidade, i.subitens)}
                                                </FormLabel>
                                            </div>
                                            {
                                                i.subitens.map((si, index) => (
                                                    <FormLabel id="label-sub-item-produto"
                                                               style={{color: cores.descricaoProduto}}
                                                               key={index}>{`${si.quantidade}x ${si.adicional}`}</FormLabel>
                                                ))
                                            }

                                        </div>
                                    ))
                                }
                            </CardContent>
                            <Divider/>
                            <CardContent id="card-content-totais">
                                <div id="div-label-total">
                                    <FormLabel id="label-valor-totais" style={{color: cores.descricaoProduto}}>
                                        {
                                            `SubTotal: ${subtotal.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}`
                                        }
                                    </FormLabel>
                                </div>
                            </CardContent>
                            {
                                (taxaEntrega !== 0) &&
                                <CardContent id="card-content-totais">
                                    <div id="div-label-total">
                                        <FormLabel id="label-valor-totais" style={{color: cores.descricaoProduto}}>
                                            {
                                                `Entrega: ${taxaEntrega.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`
                                            }
                                        </FormLabel>
                                    </div>
                                </CardContent>
                            }

                            <CardContent id="card-content-totais">
                                <div id="div-label-total">
                                    <FormLabel id="label-valor-total" style={{color: cores.nomeProduto}}>
                                        {
                                            `Total: ${(subtotal + taxaEntrega).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}`
                                        }
                                    </FormLabel>
                                </div>
                            </CardContent>

                            {(troco !== 0) && <Divider/>}

                            {
                                (troco !== 0) &&
                                <CardContent id="card-content-totais">
                                    <div id="div-label-total">
                                        <FormLabel id="label-valor-totais" style={{color: cores.descricaoProduto}}>
                                            {
                                                `Total a pagar: ${troco.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`
                                            }
                                        </FormLabel>
                                    </div>
                                </CardContent>
                            }

                            {
                                (troco !== 0) &&
                                <CardContent id="card-content-totais">
                                    <div id="div-label-total">
                                        <FormLabel id="label-valor-totais" style={{color: cores.descricaoProduto}}>
                                            {
                                                `Troco: ${(troco - (subtotal + taxaEntrega)).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`
                                            }
                                        </FormLabel>
                                    </div>
                                </CardContent>
                            }

                            <Divider/>
                            <CardContent id="card-content-limpa-carrinho" onClick={this.onClickEsvaziarCarrinho}>
                                <div id="div-limpa-carrinho">
                                    <DeleteRounded style={{color: cores.descricaoProduto}}/>
                                    <FormLabel id="label-esvaziar" style={{color: cores.descricaoProduto}}>
                                        Esvaziar carrinho
                                    </FormLabel>
                                </div>
                            </CardContent>
                        </Card>
                        <Card id="card-forma-pagamento" style={{backgroundColor: cores.cartaoProduto}}>
                            <CardContent id="card-content-pagamento">
                                <FormLabel id="label-pagamento" style={{color: cores.descricaoProduto}}>Forma de
                                    pagamento</FormLabel>
                            </CardContent>
                            <Divider/>
                            <CardContent id="card-content-forma-pagamento">
                                <RadioGroup id="radio-group-pagamento">
                                    {
                                        (dinheiro) &&
                                        <div id="div-dinheiro">
                                            <FormControlLabel id="label-tipo-pagamento"
                                                              style={{color: cores.descricaoProduto}}
                                                              value="dinheiro"
                                                              control={<RadioButton
                                                                  style={{color: cores.descricaoProduto}}/>}
                                                              label="Dinheiro" onChange={this.onRadioTipoPagamento}
                                                              checked={pagamento === 'dinheiro'}/>
                                            {
                                                (pagamento === 'dinheiro') &&
                                                <div onClick={this.onClickAlteraTroco}>
                                                    <FormLabel id="label-alterar-troco"
                                                               style={{color: cores.descricaoProduto}}>
                                                        Alterar troco
                                                    </FormLabel>
                                                </div>
                                            }
                                        </div>

                                    }
                                    {
                                        (cartao) &&
                                        <FormControlLabel id="label-tipo-pagamento"
                                                          style={{color: cores.descricaoProduto}} value="cartao"
                                                          control={<RadioButton
                                                              style={{color: cores.descricaoProduto}}/>}
                                                          label="Cartão" onChange={this.onRadioTipoPagamento}
                                                          checked={pagamento === 'cartao'}/>
                                    }
                                    {
                                        (online) &&
                                        <FormControlLabel id="label-tipo-pagamento"
                                                          style={{color: cores.descricaoProduto}} value="online"
                                                          control={<RadioButton
                                                              style={{color: cores.descricaoProduto}}/>}
                                                          label="Online" onChange={this.onRadioTipoPagamento}
                                                          checked={pagamento === 'online'}/>
                                    }
                                </RadioGroup>
                            </CardContent>
                        </Card>
                        <div id="div-rodape-carrinho" style={{backgroundColor: cores.botao}}
                             onClick={this.onClickEnviarPedido}>
                            <FormLabel id="label-carrinho" style={{color: cores.fonteBotao}}>{botaoAvancar}</FormLabel>
                        </div>
                    </div>
                    <Dialog open={dialogTroco} onClose={this.onClickTrocoNao}>
                        <DialogTitle>Precisa de troco ?</DialogTitle>
                        <DialogContent>
                            {
                                (precisaTroco) &&
                                <DialogContentText>Digite o troco</DialogContentText>
                            }
                            {
                                (precisaTroco) &&
                                <TextField variant="outlined" fullWidth={true} label="Troco" placeholder="100"
                                           name="troco" type="number" onChange={this.handleInput}/>
                            }
                        </DialogContent>
                        {
                            (!precisaTroco) &&
                            <DialogActions>
                                <Button onClick={this.onClickTrocoNao}>Não</Button>
                                <Button onClick={this.onClickTrocoSim}>Sim</Button>
                            </DialogActions>
                        }
                        {
                            (precisaTroco) &&
                            <DialogActions>
                                <Button onClick={this.onClickTrocoConfirma}>Confirmar</Button>
                            </DialogActions>
                        }
                    </Dialog>
                    <Dialog open={dialogCliente} onClose={this.cancelaCliente}>
                        <DialogTitle>Informações cliente</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Preencha as informações para entrega</DialogContentText>
                            <div id="div-input-cliente">
                                <TextField variant="outlined" fullWidth={true} label="Nome" placeholder="João"
                                           name="nome" onChange={this.handleInput}/>
                            </div>
                            <div id="div-input-cliente">
                                <TextField variant="outlined" fullWidth={true} label="Telefone"
                                           placeholder="(00) 00000-0000" value={telefone}
                                           name="telefone" onChange={this.handleInput}/>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.onClickConfirmaCliente}>Confirmar</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={dialogEntrega} onClose={this.cancelaEntrega}>
                        <DialogTitle>Entrega</DialogTitle>
                        <DialogContent id="dialog-selecione-entrega">
                            <DialogContentText>Selecione o tipo de entrega</DialogContentText>
                            {
                                (retirada) &&
                                <FormControlLabel style={{color: cores.descricaoProduto}} value="retirar"
                                                  control={<RadioButton style={{color: cores.descricaoProduto}}/>}
                                                  label="Retirar no local"
                                                  onChange={() => this.onRadioEntrega('Retirar no local')}/>
                            }
                            {
                                (entrega) &&
                                enderecos.map((e, index) => (
                                    <FormControlLabel key={index} style={{color: cores.descricaoProduto}}
                                                      value="retirar"
                                                      control={<RadioButton style={{color: cores.descricaoProduto}}/>}
                                                      label={`${e.logradouro}, ${e.numero}`}
                                                      onChange={() => this.onRadioEntrega(e)}/>
                                ))
                            }
                            {
                                (entrega) &&
                                <Button id="button-adicionar-endereco" variant="outlined" fullWidth={true}
                                        onClick={this.onClickCadastroEndereco}>
                                    Adicionar novo endereço
                                </Button>
                            }
                        </DialogContent>
                    </Dialog>
                    <Dialog open={dialogEndereco} onClose={this.cancelaEndereco}>
                        <DialogTitle>Informações cliente</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Preencha as informações para entrega</DialogContentText>
                            <div id="div-input-cliente">
                                <TextField variant="outlined" fullWidth={true} label="Cep" placeholder="00000-000"
                                           name="cep" type="number" onChange={this.handleInput}/>
                                <Box p={1}/>
                                <div>
                                    <TextField variant="outlined" fullWidth={true} label="Número"
                                               placeholder="Número residência"
                                               name="numero" type="number" onChange={this.handleInput}/>
                                </div>

                            </div>
                            <div id="div-input-cliente">
                                <TextField variant="outlined" fullWidth={true} label="Complemento"
                                           placeholder="Apartamento 401"
                                           name="complemento" onChange={this.handleInput}/>
                            </div>
                            {
                                (!isEmptyObject(endereco) && endereco.retirar === undefined) &&
                                <DialogContentText id="label-dialog-endereco">
                                    {`${endereco.logradouro}${numero !== '' ? `, ${numero}` : ``} - ${endereco.bairro}\n${endereco.localidade}-${endereco.uf}`}
                                </DialogContentText>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.onClickConfirmaEndereco}>Confirmar</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={dialogCarregando}>
                        <DialogContent id="dialog-content-carregando">
                            <CircularProgress size={30}/>
                            <FormLabel id="label-carregando">{mensagemCarregando}</FormLabel>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={dialogEsvaziar} onClose={this.cancelaEsvaziar}>
                        <DialogTitle>Esvaziar carrinho</DialogTitle>
                        <DialogContent id="dialog-content-carregando">
                            <DialogContentText>Deseja esvaziar o carrinho ?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.cancelaEsvaziar}>Não</Button>
                            <Button onClick={this.onClickEsvaziar}>Sim</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={dialogAviso} onClick={this.cancelaAviso}>
                        <DialogTitle>Aviso</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{mensagemAviso}</DialogContentText>
                        </DialogContent>
                    </Dialog>
                    <Snackbar
                        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                        open={snackbar.show}
                        autoHideDuration={1000}
                        onClose={this.cancelaSnackbar}
                        message={snackbar.mensagem}
                    />
                </div>
            </MuiThemeProvider>
        )
    }

}

export default Cart