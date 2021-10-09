import React from 'react'
import '../styles/optional.css'
import {Card, CardContent, Divider, FormLabel, FormControlLabel, Radio, RadioGroup} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {isEmptyObject} from '../util'
import {cores} from '../configuracoes.json'

const RadioButton = withStyles({
    checked: {},
})(props => <Radio color="default" {...props} />)

class Optional extends React.Component {

    state = {
        checked: {}
    }

    onRadio = (objeto, _id, tipo) => {
        objeto._id = _id
        objeto.quantidade = 1
        objeto.tipo = tipo
        this.setState({checked: objeto})
        this.props.handleChange(objeto, 'opional')
    }

    render() {
        const {checked} = this.state
        const {tituloAdicional, itens, _id, tipo} = this.props.etapa
        return (
            <div>
                <div id={_id}/>
                <Card id="card-optional" style={{backgroundColor: cores.cartaoProduto}}>
                    <CardContent id="card-content-optional">
                        <FormLabel id="label-titulo-optional" style={{color: cores.descricaoProduto}}>
                            {tituloAdicional}
                        </FormLabel>
                        {
                            isEmptyObject(checked) &&
                            <div id="div-obrigatorio">
                                <FormLabel id="label-obrigatorio">Obrigatório</FormLabel>
                            </div>
                        }
                    </CardContent>
                    <Divider/>
                    <CardContent id="card-content-optional">
                        <RadioGroup id="div-itens-optional">
                            {
                                itens.map((i, index) => (
                                    <div id="div-labels-optional" key={index}>
                                        <FormControlLabel id="label-nome-optional"
                                                          style={{color: cores.descricaoProduto}}
                                                          checked={i === checked}
                                                          onChange={() => this.onRadio(i, _id, tipo)}
                                                          control={<RadioButton
                                                              style={{color: cores.descricaoProduto}}/>}
                                                          label={i.adicional}/>
                                        {
                                            (i.valor !== 0) &&
                                            <FormLabel id="label-preco-optional">
                                                {i.valor.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}
                                            </FormLabel>
                                        }
                                    </div>
                                ))
                            }
                        </RadioGroup>
                    </CardContent>
                </Card>
            </div>
        )
    }
}

export default Optional