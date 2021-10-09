import React from 'react'
import {withRouter} from 'react-router-dom'
import '../styles/menu.css'
import {Hidden, Drawer, FormLabel, Card, CardContent, Divider} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'

const {REACT_APP_VERSION} = process.env

const classes = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: 240,
            flexShrink: 0,
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: 240,
    }
}))

class Menu extends React.Component {

    onClick = objeto => {
        if (objeto.acao === 'menu') {
            this.props.handleChange()
        } else {
            this.props.history.push(objeto.acao)
        }
    }

    render() {
        const {abre, titulo} = this.props
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
                                <Divider/>
                                <section id="div-drawer">
                                    <Card id="card-item-menu" onClick={() => this.onClick({acao: 'historico'})}>
                                        <CardContent id="card-content-item-menu">
                                            <FormLabel id="label-item-menu">
                                                Histórico de pedidos
                                            </FormLabel>
                                        </CardContent>
                                    </Card>
                                    <FormLabel id="label-versao">
                                        {`Versão: ${REACT_APP_VERSION}`}
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