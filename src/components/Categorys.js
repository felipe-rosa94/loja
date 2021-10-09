import React from 'react'
import '../styles/categorys.css'
import {FormLabel} from '@material-ui/core'
import {padronizacao} from '../util'
import {cores} from '../configuracoes.json'

class Categorys extends React.Component {

    onClickCategoria = categoria => this.props.handleChange(padronizacao(categoria))

    render() {
        const {lista} = this.props
        return (
            <div id="categorys" style={{backgroundColor: cores.corpo}}>
                {
                    // eslint-disable-next-line array-callback-return
                    lista.map((c, index) => {
                        if (c.ativo) {
                            return (
                                <div className="div-categoria" id={`${padronizacao(c.categoria)}-menu`} key={index}
                                     onClick={() => this.onClickCategoria(c.categoria)}>
                                    <FormLabel className="label-nome-categoria" id={`${padronizacao(c.categoria)}-guia`}
                                               style={{fontSize: "large", color: cores.fonteCategoria}}>
                                        {c.categoria}
                                    </FormLabel>
                                </div>
                            )
                        }
                    })
                }
            </div>
        )
    }
}

export default Categorys
