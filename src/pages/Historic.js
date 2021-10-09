import React from 'react'
import '../styles/historic.css'
import Header from '../components/Header'
import {mostraDados} from '../util'
import {cores} from '../configuracoes.json'
import Order from '../components/Order'

const {REACT_APP_TABELA} = process.env

class Historic extends React.Component {

    state = {
        historico: []
    }

    historico = () => {
        let historico = localStorage.getItem(`loja-${REACT_APP_TABELA}:historico`)
        historico = (historico !== null) ? mostraDados(historico) : []
        this.setState({historico: historico.reverse()})
    }

    componentDidMount() {
        this.historico()
    }

    render() {
        const {historico} = this.state
        return (
            <div id="historic" style={{backgroundColor: cores.corpo}}>
                <div id="container-historic">
                    <Header titulo="Histórico" home={false}/>
                    <div id="lista-historico">
                        {
                            historico.map((i, index) => (
                                <Order key={index} data={i}/>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Historic