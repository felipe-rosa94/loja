import React from 'react'
import '../styles/observation.css'
import {Card, CardContent, Checkbox, Divider, FormControlLabel, FormLabel} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {cores} from '../configuracoes.json'

const CheckButton = withStyles({
    checked: {},
})(props => <Checkbox color="default" {...props} />)

class Observation extends React.Component {

    onCheck = (objeto, e, _id, tipo) => {
        if (e.target.checked) {
            objeto.quantidade = 1
            objeto._id = _id
            objeto.tipo = tipo
        } else {
            objeto.quantidade = 0
            objeto._id = _id
            objeto.tipo = tipo
        }
        this.props.handleChange(objeto, 'observacao')
    }

    render() {
        const {tituloAdicional, itens, _id, tipo} = this.props.etapa
        return (
            <div>
                <div id={_id}/>
                <Card id="card-observation" style={{backgroundColor: cores.cartaoProduto}}>
                    <CardContent id="card-content-observation">
                        <FormLabel id="label-titulo-observation" style={{color: cores.descricaoProduto}}>
                            {tituloAdicional}
                        </FormLabel>
                    </CardContent>
                    <Divider/>
                    <CardContent id="card-content-observation">
                        <div id="div-itens-observation">
                            {
                                itens.map((i, index) => (
                                    <div id="div-labels-observation" key={index}>
                                        <FormControlLabel id="label-nome-observation"
                                                          style={{color: cores.descricaoProduto}} control={<CheckButton
                                            style={{color: cores.descricaoProduto}}/>}
                                                          onChange={(e) => this.onCheck(i, e, _id, tipo)}
                                                          label={i.adicional}/>
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

export default Observation