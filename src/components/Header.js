import React from 'react'
import {withRouter} from 'react-router-dom'
import '../styles/header.css'
import {ArrowBackRounded, MenuRounded} from '@material-ui/icons'
import {Typography} from '@material-ui/core'

import {cores} from '../configuracoes.json'

class Header extends React.Component {

    onClickMenu = () => this.props.handleChange()

    onClickVoltar = () => this.voltar()

    voltar = () => this.props.history.goBack()

    render() {
        const {home, titulo} = this.props
        return (
            <div id="header" style={{backgroundColor: cores.corpo}}>
                < div id="div-header-esquerdo">
                    {
                        !home &&
                        <div>
                            <ArrowBackRounded id="icone" style={{color: cores.fonteCorpo}}
                                              onClick={this.onClickVoltar}/>
                        </div>
                    }
                    <div>
                        <Typography id="titulo-site" style={{color: cores.fonteCorpo}}>
                            {titulo}
                        </Typography>
                    </div>
                </div>
                <div id="div-header-direito">
                    {home && <MenuRounded id="icone" style={{color: cores.fonteCorpo}} onClick={this.onClickMenu}/>}
                </div>
            </div>
        )
    }
}

export default withRouter(Header)