import React from 'react'
import {withRouter} from 'react-router-dom'
import '../styles/menu.css'
import {Hidden, Drawer, FormLabel, Card, CardContent} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import {Description, WhatsApp} from '@material-ui/icons/'
import {converteNumeroWhatsApp, mostraDados} from '../util'

const {REACT_APP_VERSAO, REACT_APP_TABELA} = process.env

const classes = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: 250,
            flexShrink: 0,
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: 250,
    }
}))

class Menu extends React.Component {

    state = {
        whatsApp: ''
    }

    onClick = objeto => {
        if (objeto.acao === 'menu') {
            this.props.handleChange()
        } else if (objeto.acao === 'whatsApp') {
            const {whatsApp} = this.state
            window.location.href = `https://api.whatsapp.com/send?phone=55${converteNumeroWhatsApp(whatsApp)}&text=oi`
        } else {
            this.props.history.push(objeto.acao)
        }
    }

    verificaWhatsApp = () => {
        let configuracoes = localStorage.getItem(`loja-${REACT_APP_TABELA}:configuracoes`)
        if (configuracoes === null) return
        configuracoes = mostraDados(configuracoes)
        this.setState({whatsApp: (configuracoes.whatsApp !== undefined) ? configuracoes.whatsApp : ''})
    }

    componentDidMount() {
        this.verificaWhatsApp()
    }

    render() {
        const {abre, titulo} = this.props
        const {whatsApp} = this.state
        return (
            <section>
                <nav className={classes.drawer} aria-label="mailbox folders">
                    <Hidden smUp implementation="css">
                        <Drawer variant="temporary" anchor='left' open={abre}
                                onClose={() => this.onClick({acao: 'menu'})}
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                                ModalProps={{
                                    keepMounted: true,
                                }}>
                            <section>
                                <section className={classes.toolbar}/>
                                <section id="div-drawer">
                                    <FormLabel id="label-titulo-menu">{titulo}</FormLabel>
                                </section>

                                <section id="div-drawer">
                                    <Card id="card-item-menu" onClick={() => this.onClick({acao: 'historico'})}>
                                        <CardContent id="card-content-item-menu">
                                            <Description/>
                                            <FormLabel id="label-item-menu">
                                                Histórico de pedidos
                                            </FormLabel>
                                        </CardContent>
                                    </Card>
                                    {
                                        whatsApp &&
                                        <Card id="card-item-menu" onClick={() => this.onClick({acao: 'whatsApp'})}>
                                            <CardContent id="card-content-item-menu">
                                                <WhatsApp/>
                                                <FormLabel id="label-item-menu">
                                                    Chamar no WhatsApp
                                                </FormLabel>
                                            </CardContent>
                                        </Card>
                                    }
                                    <FormLabel id="label-versao">
                                        {`Versão: ${REACT_APP_VERSAO}`}
                                    </FormLabel>
                                </section>
                            </section>
                        </Drawer>
                    </Hidden>
                </nav>
            </section>
        )
    }
}

export default withRouter(Menu)